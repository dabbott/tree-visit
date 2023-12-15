import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'
import { STOP, visit } from './visit'

export type FindChildrenOptions<T> = BaseChildrenOptions<T> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, indexPath: IndexPath) => boolean
}

export type FindChildrenOptionsTyped<
  T,
  S extends T
> = BaseChildrenOptions<T> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, indexPath: IndexPath) => node is S
}

export type FindEntriesOptions<T, PK extends PropertyKey> = BaseEntriesOptions<
  T,
  PK
> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, keyPath: PK[]) => boolean
}

export type FindEntriesOptionsTyped<
  T,
  PK extends PropertyKey,
  S extends T
> = BaseEntriesOptions<T, PK> & {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, keyPath: PK[]) => node is S
}

/**
 * Find a node matching a predicate function.
 */
export function find<T>(node: T, options: FindChildrenOptions<T>): T | undefined
export function find<T, S extends T>(
  node: T,
  options: FindChildrenOptionsTyped<T, S>
): S | undefined
export function find<T, PK extends PropertyKey>(
  node: T,
  options: FindEntriesOptions<T, PK>
): T | undefined
export function find<T, PK extends PropertyKey, S extends T>(
  node: T,
  options: FindEntriesOptionsTyped<T, PK, S>
): S | undefined
export function find<T, PK extends PropertyKey>(
  node: T,
  _options: FindChildrenOptions<T> | FindEntriesOptions<T, PK>
): T | undefined {
  const options = findOptionsInterop<T, PK>(_options)

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
export function findAll<T>(node: T, options: FindChildrenOptions<T>): T[]
export function findAll<T, S extends T>(
  node: T,
  options: FindChildrenOptionsTyped<T, S>
): S[]
export function findAll<T, PK extends PropertyKey>(
  node: T,
  options: FindEntriesOptions<T, PK>
): T[]
export function findAll<T, PK extends PropertyKey, S extends T>(
  node: T,
  options: FindEntriesOptionsTyped<T, PK, S>
): S[]
export function findAll<T, PK extends PropertyKey>(
  node: T,
  _options: FindChildrenOptions<T> | FindEntriesOptions<T, PK>
): T[] {
  const options = findOptionsInterop<T, PK>(_options)

  let found: T[] = []

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found.push(child)
      }
    },
  })

  return found
}

/**
 * Find the `IndexPath` of a node matching a predicate function.
 */
export function findIndexPath<T>(
  node: T,
  options: FindChildrenOptions<T>
): IndexPath | undefined
export function findIndexPath<T, PK extends PropertyKey>(
  node: T,
  options: FindEntriesOptions<T, PK>
): PK[] | undefined
export function findIndexPath<T, PK extends PropertyKey>(
  node: T,
  _options: FindChildrenOptions<T> | FindEntriesOptions<T, PK>
): PK[] | undefined {
  const options = findOptionsInterop<T, PK>(_options)

  let found: PK[] | undefined

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        // Copy the indexPath, since indexPath may be mutated
        found = [...indexPath]
        return STOP
      }
    },
  })

  return found
}

/**
 * Find the `IndexPath` of all nodes matching a predicate function.
 */
export function findAllIndexPaths<T>(
  node: T,
  options: FindChildrenOptions<T>
): IndexPath[]
export function findAllIndexPaths<T, PK extends PropertyKey>(
  node: T,
  options: FindEntriesOptions<T, PK>
): PK[][]
export function findAllIndexPaths<T, PK extends PropertyKey>(
  node: T,
  _options: FindChildrenOptions<T> | FindEntriesOptions<T, PK>
): PK[][] {
  const options = findOptionsInterop<T, PK>(_options)

  let found: PK[][] = []

  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        // Copy the indexPath, since indexPath may be mutated
        found.push([...indexPath])
      }
    },
  })

  return found
}

function findOptionsInterop<T, PK extends PropertyKey>(
  options: FindChildrenOptions<T> | FindEntriesOptions<T, PK>
): FindEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    ...(options.predicate && {
      predicate: options.predicate as FindEntriesOptions<T, PK>['predicate'],
    }),
  }
}
