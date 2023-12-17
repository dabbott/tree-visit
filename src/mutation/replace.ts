import { IndexPath } from '../indexPath'
import { MutationBaseOptions } from '../options'
import { applyOperations, getReplaceOperations } from './operation'

export type ReplaceOptions<T> = MutationBaseOptions<T> & {
  at: IndexPath
  node: T
}

/**
 * Replace the node at the given `IndexPath` with another.
 */
export function replace<T>(node: T, options: ReplaceOptions<T>) {
  if (options.at.length === 0) return options.node

  const operations = getReplaceOperations<T>(options.at, options.node)

  return applyOperations(node, operations, options)
}
