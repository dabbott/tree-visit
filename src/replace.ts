import { IndexPath } from './indexPath'
import { applyOperations, getReplaceOperations } from './operation'
import { MutationBaseOptions } from './options'

export type ReplaceOptions<T> = MutationBaseOptions<T> & {
  path: IndexPath
  node: T
}

/**
 * Replace the node at the given `IndexPath` with another.
 */
export function replace<T>(node: T, options: ReplaceOptions<T>) {
  if (options.path.length === 0) return options.node

  const operations = getReplaceOperations<T>(options.path, options.node)

  return applyOperations(node, operations, options)
}
