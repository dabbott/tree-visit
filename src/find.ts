import { IndexPath } from './indexPath'
import { BaseChildrenOptions } from './options'
import { STOP, visit } from './visit'

export type FindOptions<T> = BaseChildrenOptions<T> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, indexPath: IndexPath) => boolean
}

export type FindOptionsTyped<T, S extends T> = BaseChildrenOptions<T> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, indexPath: IndexPath) => node is S
}

/**
 * Find a node matching a predicate function.
 */
export function find<T>(node: T, options: FindOptions<T>): T | undefined
export function find<T, S extends T>(
  node: T,
  options: FindOptionsTyped<T, S>
): S | undefined
export function find<T>(node: T, options: FindOptions<T>): T | undefined {
  let found: T | undefined

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = child
        return STOP
      }
    },
  })

  return found
}

/**
 * Find all nodes matching a predicate function.
 */
export function findAll<T>(node: T, options: FindOptions<T>): T[]
export function findAll<T, S extends T>(
  node: T,
  options: FindOptionsTyped<T, S>
): S[]
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
