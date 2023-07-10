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
  const childrenMap: Record<string, U[]> = {}

  visit(node, {
    ...options,
    onLeave: (child, indexPath) => {
      indexPath = [0, ...indexPath]

      const key = indexPath.join()

      const transformed = options.transform(
        child,
        childrenMap[key] ?? [],
        indexPath
      )

      const parentKey = indexPath.slice(0, -1).join()

      const parentChildren = childrenMap[parentKey] ?? []

      parentChildren.push(transformed)

      childrenMap[parentKey] = parentChildren
    },
  })

  return childrenMap[''][0]
}
