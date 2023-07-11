import { ancestorIndexPaths } from './ancestors'
import { IndexPath } from './indexPath'
import { map } from './map'
import { MutationBaseOptions } from './options'

export type RemoveOptions<T> = MutationBaseOptions<T> & {
  indexPaths: IndexPath[]
}

enum RemovalState {
  remove,
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

  // Mark all nodes for removal
  for (const indexPath of indexPaths) {
    state.set(indexPath.join(), RemovalState.remove)
  }

  return state
}

/**
 * Group indexes to remove by their parent index path.
 */
export function getIndexesToRemove(ancestorIndexPaths: IndexPath[]) {
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
 *
 * This function is used internally by `remove` and `move`.
 */
export function removeInternal<T>(
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
        case RemovalState.remove:
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
  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths)
  const indexesToRemove = getIndexesToRemove(_ancestorIndexPaths)

  return removeInternal(node, options, _ancestorIndexPaths, indexesToRemove)
}
