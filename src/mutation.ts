import { access } from './access'
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

/**
 * Filter out index paths that are descendents of other index paths.
 */
function filterAncestorIndexPaths(indexPaths: IndexPath[]): IndexPath[] {
  const paths = new Map<string, IndexPath>()

  const sortedIndexPaths = sortIndexPaths(indexPaths)

  for (const indexPath of sortedIndexPaths) {
    const foundParent = indexPath.some((_, index) => {
      const parentKey = indexPath.slice(0, index).join()

      return paths.has(parentKey)
    })

    if (foundParent) continue

    paths.set(indexPath.join(), indexPath)
  }

  return Array.from(paths.values())
}

enum RemovalState {
  delete,
  replace,
}

function getRemovalState(indexPaths: IndexPath[]) {
  const state = new Map<string, RemovalState>()

  // Mark all parents for replacing
  for (const indexPath of indexPaths) {
    for (let i = indexPath.length - 1; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join()

      state.set(parentKey, RemovalState.replace)
    }
  }

  // Mark all nodes for deleting
  for (const indexPath of indexPaths) {
    state.set(indexPath.join(), RemovalState.delete)
  }

  return state
}

/**
 * Group indexes to remove by their parent index path.
 */
function getIndexesToRemove(ancestorIndexPaths: IndexPath[]) {
  const indexesToRemove = new Map<string, number[]>()

  for (const indexPath of ancestorIndexPaths) {
    const parentKey = indexPath.slice(0, -1).join()

    const value = indexesToRemove.get(parentKey) ?? []

    value.push(indexPath[indexPath.length - 1])

    indexesToRemove.set(parentKey, value)
  }

  return indexesToRemove
}

/**
 * Remove nodes at the given `IndexPath`s.
 */
function removeInternal<T>(
  node: T,
  options: RemoveOptions<T>,
  ancestorIndexPaths: IndexPath[],
  indexesToRemove: Map<string, number[]>
) {
  const { indexPaths } = options

  if (indexPaths.length === 0) return node

  for (const indexPath of indexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }
  }

  const state = getRemovalState(ancestorIndexPaths)

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

/**
 * Remove nodes at the given `IndexPath`s.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  const ancestorIndexPaths = filterAncestorIndexPaths(options.indexPaths)
  const indexesToRemove = getIndexesToRemove(ancestorIndexPaths)

  return removeInternal(node, options, ancestorIndexPaths, indexesToRemove)
}

export type MoveOptions<T> = BaseOptions<T> & {
  indexPaths: IndexPath[]
  to: IndexPath

  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

function adjustIndex(
  indexPath: IndexPath,
  indexesToRemove: Map<string, number[]>
) {
  const parentIndexPath = indexPath.slice(0, -1)
  const index = indexPath[indexPath.length - 1]
  const removedIndexes = indexesToRemove.get(parentIndexPath.join()) ?? []
  const adjustedIndex = removedIndexes.reduce(
    (index, removedIndex) => (removedIndex < index ? index - 1 : index),
    index
  )

  return [...parentIndexPath, adjustedIndex]
}

export function move<T>(node: T, options: MoveOptions<T>) {
  if (options.indexPaths.length === 0) return node

  if (options.to.length === 0) {
    throw new Error(`Can't move nodes to the root`)
  }

  const ancestorIndexPaths = filterAncestorIndexPaths(options.indexPaths)
  const indexesToRemove = getIndexesToRemove(ancestorIndexPaths)
  const nodesToInsert = ancestorIndexPaths.map((indexPath) =>
    access(node, indexPath, options)
  )

  node = removeInternal(node, options, ancestorIndexPaths, indexesToRemove)

  node = insert(node, {
    ...options,
    at: adjustIndex(options.to, indexesToRemove),
    nodes: nodesToInsert,
  })

  return node
}
