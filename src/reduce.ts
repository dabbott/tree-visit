import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { visit } from './visit'

export type ReduceOptions<T, R> = BaseOptions<T> & {
  /**
   * The initial result value.
   */
  initialResult: R

  /**
   * Return the next result value.
   */
  nextResult: (result: R, node: T, indexPath: IndexPath) => R
}

export function reduce<T, R>(node: T, options: ReduceOptions<T, R>): R {
  let result = options.initialResult

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      result = options.nextResult(result, child, indexPath)
    },
  })

  return result
}
