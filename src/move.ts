import { access } from './access'
import { ancestorIndexPaths } from './ancestors'
import { IndexPath } from './indexPath'
import { insert } from './insert'
import { MutationBaseOptions } from './options'
import { getIndexesToRemove, removeInternal } from './remove'

export type MoveOptions<T> = MutationBaseOptions<T> & {
  indexPaths: IndexPath[]
  to: IndexPath
}

function adjustIndex(
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

  node = removeInternal(node, options, _ancestorIndexPaths, indexesToRemove)

  node = insert(node, {
    ...options,
    at: adjustIndex(options.to, indexesToRemove),
    nodes: nodesToInsert,
  })

  return node
}
