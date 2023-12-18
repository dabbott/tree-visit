import { mapEntries } from '../map'
import { MutationBaseEntriesOptions } from '../options'
import { ancestorIndexPaths } from './ancestors'

export type NodeOperation<T, PK extends PropertyKey> =
  | {
      type: 'insert'
      index: PK
      nodes: [PK, T][]
    }
  | {
      type: 'remove'
      indexes: PK[]
    }
  | {
      type: 'replace'
    }
  | {
      type: 'removeThenInsert'
      removeIndexes: PK[]
      insertIndex: PK
      insertNodes: [PK, T][]
    }

export function insertOperation<T, PK extends PropertyKey>(
  index: PK,
  nodes: [PK, T][]
): NodeOperation<T, PK> {
  return {
    type: 'insert',
    index,
    nodes,
  }
}

export function removeOperation<T, PK extends PropertyKey>(
  indexes: PK[]
): NodeOperation<T, PK> {
  return {
    type: 'remove',
    indexes,
  }
}

export function replaceOperation<T, PK extends PropertyKey>(): NodeOperation<
  T,
  PK
> {
  return {
    type: 'replace',
  }
}

type OperationMap<T, PK extends PropertyKey> = Map<string, NodeOperation<T, PK>>

function splitIndexPath<PK extends PropertyKey>(indexPath: PK[]): [PK[], PK] {
  return [indexPath.slice(0, -1), indexPath[indexPath.length - 1]]
}

export function getInsertionOperations<T, PK extends PropertyKey>(
  indexPath: PK[],
  nodes: [PK, T][],
  operations: OperationMap<T, PK> = new Map()
): OperationMap<T, PK> {
  const [parentIndexPath, index] = splitIndexPath(indexPath)

  // Mark all parents for replacing
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join()

    switch (operations.get(parentKey)?.type) {
      case 'remove':
        continue
    }

    operations.set(parentKey, replaceOperation())
  }

  const operation = operations.get(parentIndexPath.join())

  // Mark insertion node
  switch (operation?.type) {
    case 'remove':
      operations.set(parentIndexPath.join(), {
        type: 'removeThenInsert',
        removeIndexes: operation.indexes,
        insertIndex: index,
        insertNodes: nodes,
      })
      break
    default:
      operations.set(parentIndexPath.join(), insertOperation(index, nodes))
  }

  return operations
}

export function getRemovalOperations<T, PK extends PropertyKey>(
  indexPaths: PK[][]
) {
  const _ancestorIndexPaths = ancestorIndexPaths(indexPaths)

  const indexesToRemove = new Map<string, PK[]>()

  for (const indexPath of _ancestorIndexPaths) {
    const parentKey = indexPath.slice(0, -1).join()

    const value = indexesToRemove.get(parentKey) ?? []

    value.push(indexPath[indexPath.length - 1])

    indexesToRemove.set(parentKey, value)
  }

  const operations: OperationMap<T, PK> = new Map()

  // Mark all parents for replacing
  for (const indexPath of _ancestorIndexPaths) {
    for (let i = indexPath.length - 1; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join()

      operations.set(parentKey, replaceOperation())
    }
  }

  // Mark all nodes for removal
  for (const indexPath of _ancestorIndexPaths) {
    const parentKey = indexPath.slice(0, -1).join()

    operations.set(
      parentKey,
      removeOperation(indexesToRemove.get(parentKey) ?? [])
    )
  }

  return operations
}

export function getReplaceOperations<T, PK extends PropertyKey>(
  indexPath: PK[],
  node: [PK, T]
) {
  const operations: OperationMap<T, PK> = new Map()
  const [parentIndexPath, index] = splitIndexPath(indexPath)

  // Mark all parents for replacing
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join()

    operations.set(parentKey, replaceOperation())
  }

  operations.set(parentIndexPath.join(), {
    type: 'removeThenInsert',
    removeIndexes: [index],
    insertIndex: index,
    insertNodes: [node],
  })

  return operations
}

export function applyOperations<T, PK extends PropertyKey>(
  node: T,
  operations: OperationMap<T, PK>,
  options: MutationBaseEntriesOptions<T, PK>
) {
  return mapEntries(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getEntries: (node, indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)

      switch (operation?.type) {
        case 'replace':
        case 'remove':
        case 'removeThenInsert':
        case 'insert':
          return options.getEntries(node, indexPath)
        default:
          return []
      }
    },
    transform: (node, entries: [PK, T][], indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)

      switch (operation?.type) {
        case 'remove': {
          return options.create(
            node,
            entries.filter(([pk, _]) => !operation.indexes.includes(pk)),
            indexPath
          )
        }
        case 'removeThenInsert':
          const updatedChildren = entries.filter(
            ([pk, _]) => !operation.removeIndexes.includes(pk)
          )

          const removeIndexes = operation.removeIndexes.map((index) =>
            entries.findIndex(([pk, _]) => pk === index)
          )

          const adjustedIndex: number = removeIndexes.reduce(
            (index, removedIndex) => (removedIndex < index ? index - 1 : index),
            entries.findIndex(([pk, _]) => pk === operation.insertIndex)
          )

          return options.create(
            node,
            splice(updatedChildren, adjustedIndex, 0, ...operation.insertNodes),
            indexPath
          )
        case 'insert': {
          let insertionIndex = entries.findIndex(
            ([pk, _]) => pk === operation.index
          )

          if (insertionIndex === -1) {
            insertionIndex = entries.length
          }

          return options.create(
            node,
            splice(entries, insertionIndex, 0, ...operation.nodes),
            indexPath
          )
        }
        case 'replace':
          return options.create(node, entries, indexPath)
        default:
          return node
      }
    },
  })
}

export function splice<T>(
  array: T[],
  start: number,
  deleteCount: number,
  ...items: T[]
) {
  return [
    ...array.slice(0, start),
    ...items,
    ...array.slice(start + deleteCount),
  ]
}
