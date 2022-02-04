import { BaseOptions } from './options'
import { visit } from './visit'

/**
 * Returns an array containing the root node and all of its descendants.
 *
 * This is analogous to `Array.prototype.flat` for flattening arrays.
 */
export function flat<T>(node: T, options: BaseOptions<T>): T[] {
  let nodes: T[] = []

  visit(node, {
    onEnter: (child) => {
      nodes.push(child)
    },
    getChildren: options.getChildren,
  })

  return nodes
}
