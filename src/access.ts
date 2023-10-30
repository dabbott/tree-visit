import { convertChildrenToEntries, getEntriesChild } from './getChild'
import { IndexPath, KeyPath } from './indexPath'
import { BaseEntriesOptions, BaseOptions } from './options'

type AccessChildrenOptions<T> = BaseOptions<T> & {
  indexPath: IndexPath
}

type AccessEntriesOptions<T> = BaseEntriesOptions<T> & {
  keyPath: KeyPath
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
export function access<T>(node: T, options: AccessOptions<T>): T {
  const opts =
    'getChildren' in options
      ? { ...convertChildrenToEntries<T>(options), keyPath: options.indexPath }
      : options

  return accessInternal(node, opts)
}

export function accessInternal<T>(
  node: T,
  options: AccessEntriesOptions<T>
): T {
  let path = options.keyPath.slice()

  while (path.length > 0) {
    let key = path.shift()!

    node = getEntriesChild(node, {
      ...options,
      keyPath: path,
      key,
    })
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
export function accessPath<T>(node: T, options: AccessOptions<T>): T[] {
  const opts =
    'getChildren' in options
      ? { ...convertChildrenToEntries<T>(options), keyPath: options.indexPath }
      : options

  return accessPathInternal(node, opts)
}

export function accessPathInternal<T>(
  node: T,
  options: AccessEntriesOptions<T>
): T[] {
  let result: T[] = [node]
  let path = options.keyPath.slice()

  while (path.length > 0) {
    let key = path.shift()!

    node = getEntriesChild(node, {
      ...options,
      keyPath: path,
      key,
    })

    result.push(node)
  }

  return result
}
