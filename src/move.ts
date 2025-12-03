import { access } from './access.js'
import { ancestorPaths } from './ancestors.js'
import { IndexPath } from './indexPath.js'
import {
  applyOperations,
  getInsertionOperations,
  getRemovalOperations,
} from './operation.js'
import { MutationBaseOptions } from './options.js'

export type MoveOptions<T> = MutationBaseOptions<T> & {
  paths: IndexPath[]
  to: IndexPath
}

export function move<T>(node: T, options: MoveOptions<T>) {
  if (options.paths.length === 0) return node

  for (const indexPath of options.paths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't move the root node`)
    }
  }

  if (options.to.length === 0) {
    throw new Error(`Can't move nodes to the root`)
  }

  const _ancestorIndexPaths = ancestorPaths(options.paths)

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
