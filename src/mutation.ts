import { accessPath } from './access'
import { IndexPath } from './indexPath'
import { map } from './map'
import { memoizeGetChildrenByIndexPathLength } from './memoize'
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
  options = {
    ...options,
    getChildren: memoizeGetChildrenByIndexPathLength(options.getChildren),
  }

  const { nodes, at, getChildren, create } = options

  if (at.length === 0) {
    throw new Error(`Can't insert nodes at the root`)
  }

  const pathToParent = accessPath(node, at.slice(0, -1), options)

  for (let i = pathToParent.length - 1; i >= 0; i--) {
    const original = pathToParent[i]
    const indexPath = at.slice(0, i)
    const index = at[i]

    const children = getChildren(original, indexPath)

    pathToParent[i] = create(
      original,
      i === pathToParent.length - 1
        ? splice(children, index, 0, ...nodes)
        : splice(children, index, 1, pathToParent[i + 1]),
      indexPath
    )
  }

  return pathToParent[0]
}

export type RemoveOptions<T> = BaseOptions<T> & {
  indexPaths: IndexPath[]

  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

/**
 * Insert nodes at a given `IndexPath`.
 */
export function remove<T>(node: T, options: RemoveOptions<T>) {
  const { indexPaths } = options

  if (indexPaths.length === 0) return node

  const sortedIndexPaths = sortIndexPaths(indexPaths)

  const isDeleted = new Set<string>()
  const needsReplacement = new Set<string>()
  const buckets = new Map<string, number[]>()

  main: for (const indexPath of sortedIndexPaths) {
    if (indexPath.length === 0) {
      throw new Error(`Can't remove the root node`)
    }

    isDeleted.add(indexPath.join())

    // Check if any of the parent nodes are also being deleted.
    // We stop when `i` is 1 since we know that the root node can't be deleted.
    for (let i = indexPath.length - 1; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join()

      if (isDeleted.has(parentKey)) {
        continue main
      }

      needsReplacement.add(parentKey)
    }

    // Add a 0 so we can always slice off the last element to get a unique parent key
    const parentKey = indexPath.slice(0, -1).join()

    const value = buckets.get(parentKey) ?? []

    value.push(indexPath[indexPath.length - 1])

    buckets.set(parentKey, value)
  }

  return map(node, {
    ...options,
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()
      const indexes = buckets.get(key)

      if (indexes) {
        return options.create(
          node,
          children.filter((_, index) => !indexes.includes(index)),
          indexPath
        )
      } else if (needsReplacement.has(key)) {
        return options.create(node, children, indexPath)
      }

      return node
    },
  })
}
