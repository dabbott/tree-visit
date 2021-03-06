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
  let path = indexPath.slice()

  while (path.length > 0) {
    let index = path.shift()!
    node = options.getChildren(node, path)[index]
  }

  return node
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
  let path = indexPath.slice()
  let result: T[] = [node]

  while (path.length > 0) {
    let index = path.shift()!
    node = options.getChildren(node, path)[index]
    result.push(node)
  }

  return result
}
