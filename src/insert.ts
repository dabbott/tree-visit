import { IndexPath } from './indexPath'
import { map } from './map'
import { MutationBaseOptions } from './options'

export type InsertOptions<T> = MutationBaseOptions<T> & {
  nodes: T[]
  at: IndexPath
}

export enum InsertionState {
  insert,
  replace,
}

export function getInsertionState(indexPath: IndexPath) {
  const state = new Map<string, InsertionState>()

  // Mark all parents for replacing
  for (let i = indexPath.length - 1; i >= 0; i--) {
    const parentKey = indexPath.slice(0, i).join()

    state.set(parentKey, InsertionState.replace)
  }

  // Mark insertion node
  state.set(indexPath.join(), InsertionState.insert)

  return state
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

  const state = getInsertionState(parentIndexPath)

  return map(node, {
    ...options,
    // Avoid calling `getChildren` for every node in the tree.
    // Return [] if we're just going to return the original node anyway.
    getChildren: (node, indexPath) => {
      const key = indexPath.join()

      switch (state.get(key)) {
        case InsertionState.replace:
        case InsertionState.insert:
          return options.getChildren(node, indexPath)
        default:
          return []
      }
    },
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()

      switch (state.get(key)) {
        case InsertionState.insert:
          return options.create(
            node,
            splice(children, index, 0, ...nodes),
            indexPath
          )
        case InsertionState.replace:
          return options.create(node, children, indexPath)
        default:
          return node
      }
    },
  })
}

export function splice<T>(
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
