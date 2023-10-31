import { convertChildrenToEntries, getChild } from './getChild'
import { IndexPath } from './indexPath'
import { BaseChildrenOptions, BaseEntriesOptions } from './options'

export type AccessChildrenOptions<T> = BaseChildrenOptions<T> & {
  path: IndexPath
}

export type AccessEntriesOptions<
  T,
  PK extends PropertyKey
> = BaseEntriesOptions<T, PK> & {
  path: PK[]
}

export type AccessOptions<T, PK extends PropertyKey> =
  | AccessChildrenOptions<T>
  | AccessEntriesOptions<T, PK>

/**
 * Returns a node by its `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function access<T>(node: T, options: AccessChildrenOptions<T>): T
export function access<T, PK extends PropertyKey>(
  node: T,
  options: AccessEntriesOptions<T, PK>
): T
export function access<T, PK extends PropertyKey>(
  node: T,
  _options: AccessOptions<T, PK>
): T {
  return accessInternal(node, accessOptionsInterop(_options))
}
export function accessInternal<T, PK extends PropertyKey>(
  node: T,
  options: AccessEntriesOptions<T, PK>
): T {
  let path = options.path.slice()

  while (path.length > 0) {
    let key = path.shift()!

    node = getChild<T, PK>(node, options, path, key)
  }

  return node
}

/**
 * Returns an array of each node in an `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function accessPath<T>(node: T, options: AccessChildrenOptions<T>): T[]
export function accessPath<T, PK extends PropertyKey>(
  node: T,
  options: AccessEntriesOptions<T, PK>
): T[]
export function accessPath<T, PK extends PropertyKey>(
  node: T,
  _options: AccessOptions<T, PK>
): T[] {
  const options = accessOptionsInterop(_options)

  let result: T[] = [node]
  let path = options.path.slice()

  while (path.length > 0) {
    let key = path.shift()!

    node = getChild(node, options, path, key)

    result.push(node)
  }

  return result
}

export function accessOptionsInterop<T, PK extends PropertyKey>(
  options: AccessOptions<T, PK>
): AccessEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    path: options.path as PK[],
  }
}
