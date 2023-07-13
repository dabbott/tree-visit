import { access } from './access'
import { ancestorIndexPaths } from './ancestors'
import { IndexPath } from './indexPath'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
} from './operation'
import { MutationBaseOptions } from './options'

export type MoveOptions<T> = MutationBaseOptions<T> & {
  indexPaths: IndexPath[]
  to: IndexPath
}

export function move<T>(node: T, options: MoveOptions<T>) {
  if (options.indexPaths.length === 0) return node

  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't move the root node`)
    }
  }

  if (options.to.length === 0) {
    throw new Error(`Can't move nodes to the root`)
  }

  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths)

  const nodesToInsert = _ancestorIndexPaths.map((indexPath) =>
    access(node, indexPath, options)
  )

  const operations = getInsertionOperations(
    options.to,
    nodesToInsert,
    getRemovalOperations<T>(_ancestorIndexPaths)
  )

  return applyOperations(node, operations, options)
}
