import { getChild } from './getChild'
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
  if ('getEntries' in options) {
    let path = options.keyPath.slice()

    while (path.length > 0) {
      let key = path.shift()!

      node = getChild(node, {
        ...options,
        keyPath: path,
        key,
      })
    }

    return node
  } else {
    let path = options.indexPath.slice()

    while (path.length > 0) {
      let index = path.shift()!

      node = getChild(node, {
        ...options,
        indexPath: path,
        index,
      })
    }

    return node
  }
}

/**
 * Returns an array of each node in an `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function accessPath<T>(node: T, options: AccessOptions<T>): T[] {
  let result: T[] = [node]

  if ('getEntries' in options) {
    let path = options.keyPath.slice()

    while (path.length > 1) {
      let key = path.shift()!

      node = getChild(node, {
        ...options,
        keyPath: path,
        key,
      })

      result.push(node)
    }
  } else {
    let path = options.indexPath.slice()

    while (path.length > 0) {
      let index = path.shift()!

      node = getChild(node, {
        ...options,
        indexPath: path,
        index,
      })

      result.push(node)
    }
  }

  return result
}
