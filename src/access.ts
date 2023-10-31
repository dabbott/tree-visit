import { convertChildrenToEntries, getChild } from './getChild'
import { IndexPath, KeyPath } from './indexPath'
import { BaseChildrenOptions, BaseEntriesOptions } from './options'

export type AccessChildrenOptions<T> = BaseChildrenOptions<T> & {
  path: IndexPath
}

export type AccessEntriesOptions<T> = BaseEntriesOptions<T> & {
  path: KeyPath
}

export type AccessOptions<T> =
  | AccessChildrenOptions<T>
  | AccessEntriesOptions<T>

/**
 * Returns a node by its `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function access<T>(node: T, options: AccessChildrenOptions<T>): T
export function access<T>(node: T, options: AccessEntriesOptions<T>): T
export function access<T>(node: T, _options: AccessOptions<T>): T {
  return accessInternal(node, accessOptionsInterop(_options))
}
export function accessInternal<T>(
  node: T,
  options: AccessEntriesOptions<T>
): T {
  let path = options.path.slice()

  while (path.length > 0) {
    let key = path.shift()!

    node = getChild(node, options, path, key)
  }

  return node
}

/**
 * Returns an array of each node in an `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function accessPath<T>(node: T, options: AccessChildrenOptions<T>): T[]
export function accessPath<T>(node: T, options: AccessEntriesOptions<T>): T[]
export function accessPath<T>(node: T, _options: AccessOptions<T>): T[] {
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

export function accessOptionsInterop<T>(
  options: AccessOptions<T>
): AccessEntriesOptions<T> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T>(options),
    path: options.path,
  }
}
