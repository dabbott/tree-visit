import { IndexPath } from './indexPath'
import { applyOperations, getRemovalOperations } from './operation'
import { MutationBaseOptions } from './options'

export type RemoveOptions<T> = MutationBaseOptions<T> & {
  indexPaths: IndexPath[]
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  if (options.indexPaths.length === 0) return node

  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }
  }

  const operations = getRemovalOperations<T>(options.indexPaths)

  return applyOperations(node, operations, options)
}
