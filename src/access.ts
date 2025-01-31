import { IndexPath } from './indexPath'
import { BaseOptions, TraversalContext } from './options'

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
  if (options.includeTraversalContext) {
    const accessed = accessPath(node, indexPath, options)
    return accessed[accessed.length - 1]
  }

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

    const context: TraversalContext<T> | undefined =
      options.includeTraversalContext
        ? {
            getRoot: () => result[0],
            getParent: () => result[result.length - 2],
            getAncestors: () => result.slice(0, -1),
          }
        : undefined

    node = options.getChildren(node, path, context)[index]
    result.push(node)
  }

  return result
}
