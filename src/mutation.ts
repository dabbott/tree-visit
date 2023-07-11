import { accessPath } from './access'
import { IndexPath } from './indexPath'
import { memoizeGetChildrenByIndexPathLength } from './memoize'
import { BaseOptions } from './options'

export type InsertOptions<T> = BaseOptions<T> & {
  nodes: T[]
  at: IndexPath
  /**
   * Create a new node based on the original node and its new children
   */
  create: (node: T, children: T[], indexPath: IndexPath) => T
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
