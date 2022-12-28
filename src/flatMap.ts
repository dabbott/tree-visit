import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { reduce } from './reduce'

export type FlatMapOptions<T, R> = BaseOptions<T> & {
  /**
   * Transform the node into an array of values.
   */
  transform: (node: T, indexPath: IndexPath) => R[]
}

/**
 * Map each node into an array of values, which are then flattened into a single array.
 *
 * This is analogous to `Array.prototype.flatMap` for arrays.
 */
export function flatMap<T, R>(node: T, options: FlatMapOptions<T, R>): R[] {
  return reduce<T, R[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child, indexPath) => {
      result.push(...options.transform(child, indexPath))
      return result
    },
  })
}
