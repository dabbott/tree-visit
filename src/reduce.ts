import { convertChildrenToEntries } from './getChild'
import { IndexPath, KeyPath } from './indexPath'
import { BaseEntriesOptions, BaseOptions } from './options'
import { visit } from './visit'

export type ReduceChildrenOptions<T, R> = BaseOptions<T> & {
  /**
   * The initial result value.
   */
  initialResult: R

  /**
   * Return the next result value.
   */
  nextResult: (result: R, node: T, indexPath: IndexPath) => R
}

export type ReduceEntriesOptions<T, R> = BaseEntriesOptions<T> & {
  /**
   * The initial result value.
   */
  initialResult: R

  /**
   * Return the next result value.
   */
  nextResult: (result: R, node: T, keyPath: KeyPath) => R
}

export type ReduceOptions<T, R> =
  | ReduceChildrenOptions<T, R>
  | ReduceEntriesOptions<T, R>

export function reduce<T, R>(node: T, options: ReduceChildrenOptions<T, R>): R
export function reduce<T, R>(node: T, options: ReduceEntriesOptions<T, R>): R
export function reduce<T, R>(node: T, _options: ReduceOptions<T, R>): R {
  const options = reduceOptionsInterop(_options)

  let result = options.initialResult

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      result = options.nextResult(result, child, indexPath)
    },
  })

  return result
}

function reduceOptionsInterop<T, R>(
  options: ReduceOptions<T, R>
): ReduceEntriesOptions<T, R> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T>(options),
    initialResult: options.initialResult,
    nextResult: (result: R, node: T, keyPath: KeyPath) => {
      return options.nextResult(
        result,
        node,
        keyPath.map((pk) => pk as number)
      )
    },
  }
}
