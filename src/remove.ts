import { IndexPath } from './indexPath'
import { applyOperations, getRemovalOperations } from './operation'
import { MutationBaseOptions } from './options'

export type RemoveOptions<T> = MutationBaseOptions<T> & {
  paths: IndexPath[]
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  if (options.paths.length === 0) return node

  for (const indexPath of options.paths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }
  }

  const operations = getRemovalOperations<T>(options.paths)

  return applyOperations(node, operations, options)
}
