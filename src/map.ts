import { access } from './access'
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
 * filtering them out of the `children` argument. The root can't be omitted.
 */
export function map<T, U>(node: T, options: MapOptions<T, U>): U {
  const childrenMap = new Map<T | undefined, U[]>()

  visit(node, {
    ...options,
    onLeave: (child, indexPath) => {
      const transformed = options.transform(
        child,
        childrenMap.get(child) ?? [],
        indexPath
      )

      const parent =
        indexPath.length > 0
          ? access(node, indexPath.slice(0, -1), options)
          : undefined

      const parentChildren = childrenMap.get(parent) ?? []

      parentChildren.push(transformed)

      childrenMap.set(parent, parentChildren)
    },
  })

  return childrenMap.get(undefined)![0]
}
