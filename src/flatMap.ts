import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'
import { reduce } from './reduce'

export type FlatMapChildrenOptions<T, R> = BaseChildrenOptions<T> & {
  /**
   * Transform the node into an array of values.
   */
  transform: (node: T, indexPath: IndexPath) => R[]
}

export type FlatMapEntriesOptions<
  T,
  PK extends PropertyKey,
  R
> = BaseEntriesOptions<T, PK> & {
  /**
   * Transform the node into an array of values.
   */
  transform: (node: T, keyPath: PK[]) => R[]
}

/**
 * Map each node into an array of values, which are then flattened into a single array.
 *
 * This is analogous to `Array.prototype.flatMap` for arrays.
 */
export function flatMap<T, R>(
  node: T,
  options: FlatMapChildrenOptions<T, R>
): R[]
export function flatMap<T, PK extends PropertyKey, R>(
  node: T,
  options: FlatMapEntriesOptions<T, PK, R>
): R[]
export function flatMap<T, PK extends PropertyKey, R>(
  node: T,
  _options: FlatMapChildrenOptions<T, R> | FlatMapEntriesOptions<T, PK, R>
): R[] {
  const options = flatMapOptionsInterop<T, PK, R>(_options)

  return reduce<T, PK, R[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child, indexPath) => {
      result.push(...options.transform(child, indexPath))
      return result
    },
  })
}

function flatMapOptionsInterop<T, PK extends PropertyKey, R>(
  options: FlatMapChildrenOptions<T, R> | FlatMapEntriesOptions<T, PK, R>
): FlatMapEntriesOptions<T, PK, R> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    transform: options.transform as FlatMapEntriesOptions<
      T,
      PK,
      R
    >['transform'],
  }
}
