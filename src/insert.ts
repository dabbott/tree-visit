import { IndexPath } from './indexPath'
import { map } from './map'
import { BaseOptions } from './options'

export type InsertOptions<T> = BaseOptions<T> & {
  nodes: T[]
  at: IndexPath

  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function insert<T>(node: T, options: InsertOptions<T>) {
  const { nodes, at } = options

  if (at.length === 0) {
    throw new Error(`Can't insert nodes at the root`)
  }

  const parentIndexPath = at.slice(0, -1)
  const index = at[at.length - 1]

  return map(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getChildren: (node, indexPath) => {
      if (isPrefixPath(indexPath, parentIndexPath)) {
        return options.getChildren(node, indexPath)
      }

      return []
    },
    transform: (node, children: T[], indexPath) => {
      if (isPathEqual(indexPath, parentIndexPath)) {
        return options.create(
          node,
          splice(children, index, 0, ...nodes),
          indexPath
        )
      }

      if (isPrefixPath(indexPath, parentIndexPath)) {
        return options.create(node, children, indexPath)
      }

      return node
    },
  })
}

function splice<T>(
  array: T[],
  start: number,
  deleteCount: number,
  ...items: T[]
) {
  return [
    ...array.slice(0, start),
    ...items,
    ...array.slice(start + deleteCount),
  ]
}

function isPathEqual(a: IndexPath, b: IndexPath) {
  if (a.length !== b.length) {
    return false
  }

  return a.every((segment, index) => segment === b[index])
}

function isPrefixPath(prefix: IndexPath, path: IndexPath) {
  if (prefix.length > path.length) {
    return false
  }

  return prefix.every((segment, index) => segment === path[index])
}
