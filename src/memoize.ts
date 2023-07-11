import { IndexPath } from './indexPath'

/**
 * Ensure that the `getChildren` function is only called once per `IndexPath` length.
 *
 * This is useful when traversing a single path in a tree, e.g. when inserting nodes.
 */
export function memoizeGetChildrenByIndexPathLength<T>(
  getChildren: (node: T, indexPath: IndexPath) => T[]
) {
  const cache = new Map<number, T[]>()

  return (node: T, indexPath: IndexPath) => {
    const key = indexPath.length

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const children = getChildren(node, indexPath)

    cache.set(key, children)

    return children
  }
}
