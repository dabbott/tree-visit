import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'
import { visit } from './visit'

export type ReduceChildrenOptions<T, R> = BaseChildrenOptions<T> & {
  /**
   * The initial result value.
   */
  initialResult: R

  /**
   * Return the next result value.
   */
  nextResult: (result: R, node: T, indexPath: IndexPath) => R
}

export type ReduceEntriesOptions<
  T,
  PK extends PropertyKey,
  R
> = BaseEntriesOptions<T, PK> & {
  /**
   * The initial result value.
   */
  initialResult: R

  /**
   * Return the next result value.
   */
  nextResult: (result: R, node: T, keyPath: PK[]) => R
}

export type ReduceOptions<T, PK extends PropertyKey, R> =
  | ReduceChildrenOptions<T, R>
  | ReduceEntriesOptions<T, PK, R>

export function reduce<T, R>(node: T, options: ReduceChildrenOptions<T, R>): R
export function reduce<T, PK extends PropertyKey, R>(
  node: T,
  options: ReduceEntriesOptions<T, PK, R>
): R
export function reduce<T, PK extends PropertyKey, R>(
  node: T,
  _options: ReduceOptions<T, PK, R>
): R {
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

function reduceOptionsInterop<T, PK extends PropertyKey, R>(
  options: ReduceOptions<T, PK, R>
): ReduceEntriesOptions<T, PK, R> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    initialResult: options.initialResult,
    nextResult: options.nextResult as ReduceEntriesOptions<
      T,
      PK,
      R
    >['nextResult'],
  }
}
