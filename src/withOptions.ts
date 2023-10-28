import { defineTree } from './defineTree'
import { DiagramOptions } from './diagram'
import { FindOptions, FindOptionsTyped } from './find'
import { FlatMapOptions } from './flatMap'
import { IndexPath } from './indexPath'
import { InsertOptions } from './insert'
import { MapOptions } from './map'
import { MoveOptions } from './move'
import { BaseOptions, MutationBaseOptions } from './options'
import { ReduceOptions } from './reduce'
import { RemoveOptions } from './remove'
import { ReplaceOptions } from './replace'
import { VisitOptions } from './visit'

// Omit any keys from the BaseOptions, since they're always applied
// automatically as part of `withOptions`
type WithoutBase<O> = Omit<O, keyof BaseOptions<unknown>>

export type WithOptions<T> = {
  /**
   * Returns the node's children.
   *
   * This is the same as the `getChildren` option passed to `withOptions`, included here for convenience.
   */
  getChildren: BaseOptions<T>['getChildren']

  /**
   * Returns a node by its `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  access(node: T, indexPath: IndexPath): T

  /**
   * Returns an array of each node in an `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  accessPath(node: T, indexPath: IndexPath): T[]

  /**
   * Generate a diagram of the tree, as a string.
   */
  diagram(node: T, getLabel: DiagramOptions<T>['getLabel']): string
  diagram(node: T, options: WithoutBase<DiagramOptions<T>>): string

  /**
   * Find a node matching a predicate function.
   */
  find(node: T, predicate: FindOptions<T>['predicate']): T | undefined
  find(node: T, options: WithoutBase<FindOptions<T>>): T | undefined
  find<S extends T>(
    node: T,
    predicate: FindOptionsTyped<T, S>['predicate']
  ): S | undefined
  find<S extends T>(
    node: T,
    options: WithoutBase<FindOptionsTyped<T, S>>
  ): S | undefined

  /**
   * Find all nodes matching a predicate function.
   */
  findAll(node: T, predicate: FindOptions<T>['predicate']): T[]
  findAll(node: T, options: WithoutBase<FindOptions<T>>): T[]
  findAll<S extends T>(
    node: T,
    predicate: FindOptionsTyped<T, S>['predicate']
  ): S[]
  findAll<S extends T>(
    node: T,
    options: WithoutBase<FindOptionsTyped<T, S>>
  ): S[]

  /**
   * Find the `IndexPath` of a node matching a predicate function.
   */
  findIndexPath(
    node: T,
    predicate: FindOptions<T>['predicate']
  ): IndexPath | undefined
  findIndexPath(
    node: T,
    options: WithoutBase<FindOptions<T>>
  ): IndexPath | undefined

  /**
   * Find the `IndexPath` of all nodes matching a predicate function.
   */
  findAllIndexPaths(
    node: T,
    predicate: FindOptions<T>['predicate']
  ): IndexPath[]
  findAllIndexPaths(node: T, options: WithoutBase<FindOptions<T>>): IndexPath[]

  /**
   * Returns an array containing the root node and all of its descendants.
   *
   * This is analogous to `Array.prototype.flat` for flattening arrays.
   */
  flat(node: T): T[]

  /**
   * Map each node into an array of values, which are then flattened into a single array.
   *
   * This is analogous to `Array.prototype.flatMap` for arrays.
   */
  flatMap<R>(node: T, transform: FlatMapOptions<T, R>['transform']): R[]

  reduce<R>(
    node: T,
    nextResult: ReduceOptions<T, R>['nextResult'],
    initialResult: R
  ): R

  map<R>(node: T, transform: MapOptions<T, R>['transform']): R

  /**
   * Visit each node using preorder DFS traversal.
   */
  visit(node: T, onEnter: NonNullable<VisitOptions<T>>['onEnter']): void

  /**
   * Visit each node using DFS traversal.
   */
  visit(node: T, options: WithoutBase<VisitOptions<T>>): void

  /**
   * Insert nodes at a given `IndexPath`.
   */
  insert(node: T, options: WithoutBase<InsertOptions<T>>): T

  /**
   * Remove nodes at the given `IndexPath`s.
   */
  remove(node: T, options: WithoutBase<RemoveOptions<T>>): T

  /**
   * Move nodes from one `IndexPath` to another.
   */
  move(node: T, options: WithoutBase<MoveOptions<T>>): T

  /**
   * Replace the node at the given `IndexPath` with another
   */
  replace(node: T, options: WithoutBase<ReplaceOptions<T>>): T
}

type WithoutMutationBase<O> = Omit<O, keyof MutationBaseOptions<unknown>>

export type WithMutationOptions<T> = Omit<
  WithOptions<T>,
  'insert' | 'remove' | 'move' | 'replace'
> & {
  insert: (node: T, options: WithoutMutationBase<InsertOptions<T>>) => T
  remove: (node: T, options: WithoutMutationBase<RemoveOptions<T>>) => T
  move: (node: T, options: WithoutMutationBase<MoveOptions<T>>) => T
  replace: (node: T, options: WithoutMutationBase<ReplaceOptions<T>>) => T
}

/**
 * Return every tree utility function with options partially applied.
 *
 * @param baseOptions
 */
export function withOptions<T>(baseOptions: BaseOptions<T>): WithOptions<T>
export function withOptions<T>(
  baseOptions: MutationBaseOptions<T>
): WithMutationOptions<T>
export function withOptions<T>(
  baseOptions: BaseOptions<T> | MutationBaseOptions<T>
): WithOptions<T> {
  if ('create' in baseOptions) {
    return defineTree(baseOptions).withOptions({ create: baseOptions.create })
  }

  return defineTree(baseOptions)
}
