import { IndexPath } from './indexPath'
import { map } from './map'
import { BaseOptions } from './options'
import { sortIndexPaths } from './sort'

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

export type RemoveOptions<T> = BaseOptions<T> & {
  indexPaths: IndexPath[]

  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

enum RemovalState {
  delete,
  replace,
}

/**
 * We sort the `IndexPath`s so that we can check if any parent nodes
 * are also being deleted, and if so, we can skip deleting the descendant nodes.
 */
function getIndexesToRemove(indexPaths: IndexPath[]) {
  const sortedIndexPaths = sortIndexPaths(indexPaths)

  const indexesToRemove = new Map<string, number[]>()
  const state = new Map<string, RemovalState>()

  main: for (const indexPath of sortedIndexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }

    // Check if any of the parent nodes are also being deleted.
    for (let i = indexPath.length - 1; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join()

      if (state.get(parentKey) === RemovalState.delete) {
        continue main
      }

      state.set(parentKey, RemovalState.replace)
    }

    state.set(indexPath.join(), RemovalState.delete)

    // Add a 0 so we can always slice off the last element to get a unique parent key
    const parentKey = indexPath.slice(0, -1).join()

    const value = indexesToRemove.get(parentKey) ?? []

    value.push(indexPath[indexPath.length - 1])

    indexesToRemove.set(parentKey, value)
  }

  return { indexesToRemove, state }
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  const { indexPaths } = options

  if (indexPaths.length === 0) return node

  const { state, indexesToRemove } = getIndexesToRemove(indexPaths)

  return map(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getChildren: (node, indexPath) => {
      const key = indexPath.join()

      switch (state.get(key)) {
        case RemovalState.replace:
          return options.getChildren(node, indexPath)
        case RemovalState.delete:
        default:
          return []
      }
    },
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()
      const indexes = indexesToRemove.get(key)

      if (indexes) {
        return options.create(
          node,
          children.filter((_, index) => !indexes.includes(index)),
          indexPath
        )
      }

      if (state.get(key) === RemovalState.replace) {
        return options.create(node, children, indexPath)
      }

      return node
    },
  })
}
