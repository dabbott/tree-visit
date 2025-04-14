import { ancestorPaths } from './ancestors'
import { IndexPath } from './indexPath'
import { map } from './map'
import { MutationBaseOptions } from './options'
import { transformPath } from './transformPath'

export type NodeOperation<T> =
  | {
      type: 'insert'
      index: number
      nodes: T[]
    }
  | {
      type: 'remove'
      indexes: number[]
    }
  | {
      type: 'replace'
    }
  | {
      type: 'removeThenInsert'
      removeIndexes: number[]
      insertIndex: number
      insertNodes: T[]
    }

export function insertOperation<T>(
  index: number,
  nodes: T[]
): NodeOperation<T> {
  return {
    type: 'insert',
    index,
    nodes,
  }
}

export function removeOperation<T>(indexes: number[]): NodeOperation<T> {
  return {
    type: 'remove',
    indexes,
  }
}

export function replaceOperation<T>(): NodeOperation<T> {
  return {
    type: 'replace',
  }
}

type OperationMap<T> = Map<string, NodeOperation<T>>

function splitIndexPath(indexPath: IndexPath): [IndexPath, number] {
  return [indexPath.slice(0, -1), indexPath[indexPath.length - 1]]
}

export function getInsertionOperations<T>(
  indexPath: IndexPath,
  nodes: T[],
  operations: OperationMap<T> = new Map()
) {
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

export function getRemovalOperations<T>(indexPaths: IndexPath[]) {
  const _ancestorIndexPaths = ancestorPaths(indexPaths)

  const indexesToRemove = new Map<string, number[]>()

  for (const indexPath of _ancestorIndexPaths) {
    const parentKey = indexPath.slice(0, -1).join()

    const value = indexesToRemove.get(parentKey) ?? []

    value.push(indexPath[indexPath.length - 1])

    indexesToRemove.set(parentKey, value)
  }

  const operations: OperationMap<T> = new Map()

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

export function getReplaceOperations<T>(indexPath: IndexPath, node: T) {
  const operations: OperationMap<T> = new Map()
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

function adjustInsertIndex(index: number, removeIndexes: number[]) {
  return removeIndexes.reduce(
    (index, removedIndex) => (removedIndex < index ? index - 1 : index),
    index
  )
}

export function applyOperations<T>(
  node: T,
  operations: OperationMap<T>,
  options: MutationBaseOptions<T>
) {
  return map(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getChildren: (node, indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)

      switch (operation?.type) {
        case 'replace':
        case 'remove':
        case 'removeThenInsert':
        case 'insert':
          return options.getChildren(node, indexPath)
        default:
          return []
      }
    },
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)

      switch (operation?.type) {
        case 'remove':
          return options.create(
            node,
            children.filter((_, index) => !operation.indexes.includes(index)),
            indexPath
          )
        case 'removeThenInsert':
          const updatedChildren = children.filter(
            (_, index) => !operation.removeIndexes.includes(index)
          )

          const adjustedIndex = adjustInsertIndex(
            operation.insertIndex,
            operation.removeIndexes
          )

          return options.create(
            node,
            arraySplice(
              updatedChildren,
              adjustedIndex,
              0,
              ...operation.insertNodes
            ),
            indexPath
          )
        case 'insert':
          return options.create(
            node,
            arraySplice(children, operation.index, 0, ...operation.nodes),
            indexPath
          )
        case 'replace':
          return options.create(node, children, indexPath)
        default:
          return node
      }
    },
  })
}

export function arraySplice<T>(
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

export function transformPathsByOperations<T>(
  paths: IndexPath[],
  operations: OperationMap<T>
): (IndexPath | undefined)[] {
  let transformedPaths: (IndexPath | undefined)[] = paths

  for (const [parentKey, operation] of operations.entries()) {
    const parentPath = parentKey ? parentKey.split(',').map(Number) : []

    transformedPaths = transformByOperation(
      transformedPaths,
      parentPath,
      operation
    )
  }

  return transformedPaths
}

function transformByOperation<T>(
  transformedPaths: (IndexPath | undefined)[],
  parentPath: IndexPath,
  operation: NodeOperation<T>
): (IndexPath | undefined)[] {
  switch (operation.type) {
    case 'insert': {
      const otherPath = parentPath.concat(operation.index)

      return transformedPaths.map((path) =>
        path
          ? transformPath(path, 'insert', otherPath, operation.nodes.length)
          : undefined
      )
    }
    case 'remove': {
      const otherPaths = [...operation.indexes]
        .reverse()
        .map((index) => parentPath.concat(index))

      return transformedPaths.map((path) => {
        for (const otherPath of otherPaths) {
          path = path ? transformPath(path, 'remove', otherPath) : undefined
        }

        return path
      })
    }
    case 'removeThenInsert': {
      const result = transformByOperation(transformedPaths, parentPath, {
        type: 'remove',
        indexes: operation.removeIndexes,
      })

      const insertIndex = adjustInsertIndex(
        operation.insertIndex,
        operation.removeIndexes
      )

      return transformByOperation(result, parentPath, {
        type: 'insert',
        index: insertIndex,
        nodes: operation.insertNodes,
      })
    }
    case 'replace': {
      return transformedPaths
    }
  }
}
