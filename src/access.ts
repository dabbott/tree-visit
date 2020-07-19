import { IndexPath } from './indexPath'
import { BaseOptions } from './options'

/**
 * Returns a node by its `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function access<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T {
  if (indexPath.length === 0) return node

  const children = options.getChildren(node, indexPath)

  return access(children[indexPath[0]], indexPath.slice(1), options)
}

/**
 * Returns an array of each node in an `IndexPath`.
 *
 * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
 */
export function accessPath<T>(
  node: T,
  indexPath: IndexPath,
  options: BaseOptions<T>
): T[] {
  if (indexPath.length === 0) return [node]

  const children = options.getChildren(node, indexPath)

  const result = accessPath(children[indexPath[0]], indexPath.slice(1), options)

  result.unshift(node)

  return result
}
