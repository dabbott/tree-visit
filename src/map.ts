import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { visit } from './visit'

export type MapOptions<T, U> = BaseOptions<T> & {
  /**
   * Transform the node into a different value.
   */
  transform: (node: T, transformedChildren: U[], indexPath: IndexPath) => U
}

/**
 * Map each node into a new node.
 *
 * The shape of the tree remains the same. You can omit nodes from the tree by
 * filtering them out of the `transformedChildren` argument. The root can't be omitted.
 */
export function map<T, U>(node: T, options: MapOptions<T, U>): U {
  return flatMap(node, {
    ...options,
    transform: (node, transformedChildren, indexPath) => [
      options.transform(node, transformedChildren, indexPath),
    ],
  })
}

export type FlatMapOptions<T, U> = BaseOptions<T> & {
  /**
   * Transform the node into an array of new nodes.
   */
  transform: (node: T, transformedChildren: U[], indexPath: IndexPath) => U[]
}

/**
 * Map each node into an array of new nodes.
 *
 * You can omit nodes from the tree by returning an empty array from the `transform` function.
 * The first element of the returned top-level array will be the new root.
 */
export function flatMap<T, U>(node: T, options: FlatMapOptions<T, U>): U {
  const childrenMap: Record<string, U[]> = {}

  visit(node, {
    ...options,
    onLeave: (child, indexPath) => {
      // Add a 0 so we can always slice off the last element to get a unique parent key
      const keyIndexPath = [0, ...indexPath]

      const key = keyIndexPath.join()

      const transformed = options.transform(
        child,
        childrenMap[key] ?? [],
        indexPath
      )

      const parentKey = keyIndexPath.slice(0, -1).join()

      const parentChildren = childrenMap[parentKey] ?? []

      parentChildren.push(...transformed)

      childrenMap[parentKey] = parentChildren
    },
  })

  return childrenMap[''][0]
}
