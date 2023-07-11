import { access, accessPath } from './access'
import { DiagramOptions, diagram } from './diagram'
import {
  FindOptions,
  FindOptionsTyped,
  find,
  findAll,
  findAllIndexPaths,
  findIndexPath,
} from './find'
import { flat } from './flat'
import { FlatMapOptions, flatMap } from './flatMap'
import { IndexPath } from './indexPath'
import { InsertOptions, insert } from './insert'
import { MapOptions, map } from './map'
import { MoveOptions, move } from './move'
import { BaseOptions } from './options'
import { ReduceOptions, reduce } from './reduce'
import { RemoveOptions, remove } from './remove'
import { VisitOptions, visit } from './visit'

// Omit any keys from the BaseOptions, since they're always applied
// automatically as part of `withOptions`
type WithoutBase<O> = Omit<O, keyof BaseOptions<unknown>>

export type WithOptions<T> = {
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
}

/**
 * Return every tree utility function with options partially applied.
 *
 * @param baseOptions
 */
export function withOptions<T>(baseOptions: BaseOptions<T>): WithOptions<T> {
  return {
    access: (node, indexPath) => access(node, indexPath, baseOptions),
    accessPath: (node, indexPath) => accessPath(node, indexPath, baseOptions),
    diagram: (
      node: T,
      getLabelOrOptions:
        | DiagramOptions<T>['getLabel']
        | WithoutBase<DiagramOptions<T>>
    ) =>
      typeof getLabelOrOptions === 'function'
        ? diagram(node, { ...baseOptions, getLabel: getLabelOrOptions })
        : diagram(node, { ...baseOptions, ...getLabelOrOptions }),
    find: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | WithoutBase<FindOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? find(node, { ...baseOptions, predicate: predicateOrOptions })
        : find(node, { ...baseOptions, ...predicateOrOptions }),
    findAll: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | WithoutBase<FindOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? findAll(node, { ...baseOptions, predicate: predicateOrOptions })
        : findAll(node, { ...baseOptions, ...predicateOrOptions }),
    findIndexPath: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | WithoutBase<FindOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? findIndexPath(node, { ...baseOptions, predicate: predicateOrOptions })
        : findIndexPath(node, { ...baseOptions, ...predicateOrOptions }),
    flat: (node: T) => flat(node, baseOptions),
    flatMap: (node: T, transform) =>
      flatMap(node, { ...baseOptions, transform }),
    reduce: (node: T, nextResult, initialResult) =>
      reduce(node, { ...baseOptions, nextResult, initialResult }),
    map: (node: T, transform) => map(node, { ...baseOptions, transform }),
    findAllIndexPaths: (
      node: T,
      predicateOrOptions:
        | FindOptions<T>['predicate']
        | WithoutBase<FindOptions<T>>
    ) =>
      typeof predicateOrOptions === 'function'
        ? findAllIndexPaths(node, {
            ...baseOptions,
            predicate: predicateOrOptions,
          })
        : findAllIndexPaths(node, { ...baseOptions, ...predicateOrOptions }),
    visit: (
      node: T,
      onEnterOrOptions:
        | NonNullable<VisitOptions<T>>['onEnter']
        | WithoutBase<VisitOptions<T>>
    ) =>
      typeof onEnterOrOptions === 'function'
        ? visit(node, { ...baseOptions, onEnter: onEnterOrOptions })
        : visit(node, { ...baseOptions, ...onEnterOrOptions }),
    insert: (node: T, options) => insert(node, { ...baseOptions, ...options }),
    remove: (node: T, options) => remove(node, { ...baseOptions, ...options }),
    move: (node: T, options) => move(node, { ...baseOptions, ...options }),
  }
}
