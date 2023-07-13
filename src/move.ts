import { access } from './access'
import { ancestorIndexPaths } from './ancestors'
import { IndexPath } from './indexPath'
import { InsertionState, getInsertionState, splice } from './insert'
import { map } from './map'
import { MutationBaseOptions } from './options'
import { RemovalState, getIndexesToRemove, getRemovalState } from './remove'

export type MoveOptions<T> = MutationBaseOptions<T> & {
  indexPaths: IndexPath[]
  to: IndexPath
}

function adjustIndexPath(
  indexPath: IndexPath,
  indexesToRemove: Map<string, number[]>
) {
  const parentIndexPath = indexPath.slice(0, -1)
  const index = indexPath[indexPath.length - 1]
  const removedIndexes = indexesToRemove.get(parentIndexPath.join()) ?? []
  const adjustedIndex = removedIndexes.reduce(
    (index, removedIndex) => (removedIndex < index ? index - 1 : index),
    index
  )

  return [...parentIndexPath, adjustedIndex]
}

export function move<T>(node: T, options: MoveOptions<T>) {
  if (options.indexPaths.length === 0) return node

  if (options.to.length === 0) {
    throw new Error(`Can't move nodes to the root`)
  }

  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths)
  const indexesToRemove = getIndexesToRemove(_ancestorIndexPaths)
  const nodesToInsert = _ancestorIndexPaths.map((indexPath) =>
    access(node, indexPath, options)
  )

  const removalState = getRemovalState(_ancestorIndexPaths)

  const adjustedIndexPath = adjustIndexPath(options.to, indexesToRemove)
  const parentIndexPath = adjustedIndexPath.slice(0, -1)
  const index = adjustedIndexPath[adjustedIndexPath.length - 1]
  const insertionState = getInsertionState(parentIndexPath)

  return map(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getChildren: (node, indexPath) => {
      const key = indexPath.join()

      switch (insertionState.get(key)) {
        case InsertionState.replace:
        case InsertionState.insert:
          return options.getChildren(node, indexPath)
      }

      switch (removalState.get(key)) {
        case RemovalState.replace:
          return options.getChildren(node, indexPath)
        case RemovalState.remove:
        default:
          return []
      }
    },
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()
      const indexes = indexesToRemove.get(key)
      const insertion = insertionState.get(key)

      if (indexes && insertion === InsertionState.insert) {
        const updatedChildren = children.filter(
          (_, index) => !(indexes ?? []).includes(index)
        )

        return options.create(
          node,
          splice(updatedChildren, index, 0, ...nodesToInsert),
          indexPath
        )
      }

      if (insertion === InsertionState.insert) {
        return options.create(
          node,
          splice(children, index, 0, ...nodesToInsert),
          indexPath
        )
      }

      if (indexes) {
        return options.create(
          node,
          children.filter((_, index) => !indexes.includes(index)),
          indexPath
        )
      }

      const removal = removalState.get(key)

      if (
        removal === RemovalState.replace ||
        insertion === InsertionState.replace
      ) {
        return options.create(node, children, indexPath)
      }

      return node
    },
  })
}
