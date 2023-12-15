import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'
import { reduce } from './reduce'

/**
 * Returns an array containing the root node and all of its descendants.
 *
 * This is analogous to `Array.prototype.flat` for flattening arrays.
 */
export function flat<T>(node: T, options: BaseChildrenOptions<T>): T[]
export function flat<T, PK extends PropertyKey>(
  node: T,
  options: BaseEntriesOptions<T, PK>
): T[]
export function flat<T, PK extends PropertyKey>(
  node: T,
  _options: BaseChildrenOptions<T> | BaseEntriesOptions<T, PK>
): T[] {
  const options = flatOptionsInterop<T, PK>(_options)

  return reduce<T, PK, T[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child) => {
      result.push(child)
      return result
    },
  })
}

function flatOptionsInterop<T, PK extends PropertyKey>(
  options: BaseChildrenOptions<T> | BaseEntriesOptions<T, PK>
): BaseEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
  }
}
