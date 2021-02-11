import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { visit, STOP } from './visit'

export type FindOptions<T> = BaseOptions<T> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, indexPath: IndexPath) => boolean
}

/**
 * Find a node matching a predicate function.
 */
export function find<T>(node: T, options: FindOptions<T>): T | undefined {
  let found: T | undefined

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = child
        return STOP
      }
    },
    getChildren: options.getChildren,
  })

  return found
}

/**
 * Find all nodes matching a predicate function.
 */
export function findAll<T>(node: T, options: FindOptions<T>): T[] {
  let found: T[] = []

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found.push(child)
      }
    },
    getChildren: options.getChildren,
  })

  return found
}

/**
 * Find the `IndexPath` of a node matching a predicate function.
 */
export function findIndexPath<T>(
  node: T,
  options: FindOptions<T>
): IndexPath | undefined {
  let found: IndexPath | undefined

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        // Copy the indexPath, since indexPath may be mutated
        found = [...indexPath]
        return STOP
      }
    },
    getChildren: options.getChildren,
  })

  return found
}

/**
 * Find the `IndexPath` of all nodes matching a predicate function.
 */
export function findAllIndexPaths<T>(
  node: T,
  options: FindOptions<T>
): IndexPath[] {
  let found: IndexPath[] = []

  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        // Copy the indexPath, since indexPath may be mutated
        found.push([...indexPath])
      }
    },
    getChildren: options.getChildren,
  })

  return found
}
