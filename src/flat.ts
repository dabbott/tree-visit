import { BaseChildrenOptions } from './options'
import { reduce } from './reduce'

/**
 * Returns an array containing the root node and all of its descendants.
 *
 * This is analogous to `Array.prototype.flat` for flattening arrays.
 */
export function flat<T>(node: T, options: BaseChildrenOptions<T>): T[] {
  return reduce<T, T[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child) => {
      result.push(child)
      return result
    },
  })
}
