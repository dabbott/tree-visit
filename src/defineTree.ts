import { access, accessPath } from './access'
import { diagram, DiagramOptions } from './diagram'
import {
  find,
  findAll,
  findAllIndexPaths,
  findIndexPath,
  FindOptions,
  FindOptionsTyped,
} from './find'
import { flat } from './flat'
import { flatMap, FlatMapOptions } from './flatMap'
import { IndexPath } from './indexPath'
import { insert, InsertOptions } from './insert'
import { map, MapOptions } from './map'
import { move, MoveOptions } from './move'
import { BaseOptions, MutationBaseOptions, TraversalContext } from './options'
import { reduce, ReduceOptions } from './reduce'
import { remove, RemoveOptions } from './remove'
import { replace, ReplaceOptions } from './replace'
import { ExtractRequiredKeys, OptionCheck, Prettify } from './types'
import { visit, VisitOptions } from './visit'

type WithoutBase<T> = Omit<T, keyof BaseOptions<T>>

type MutationOptions<T> = WithoutBase<MutationBaseOptions<T>>

type DiagramOptionsWB<T> = WithoutBase<DiagramOptions<T>>
type DiagramRequiredOptions<T> = Pick<
  DiagramOptionsWB<T>,
  ExtractRequiredKeys<DiagramOptionsWB<T>>
>
type DiagramOptionalOptions<T> = Omit<
  DiagramOptionsWB<T>,
  ExtractRequiredKeys<DiagramOptionsWB<T>>
>
type FindOptionsWB<T> = WithoutBase<FindOptions<T>>
type VisitOptionsWB<T> = WithoutBase<VisitOptions<T>>
type InsertOptionsWB<T> = WithoutBase<InsertOptions<T>>
type RemoveOptionsWB<T> = WithoutBase<RemoveOptions<T>>
type MoveOptionsWB<T> = WithoutBase<MoveOptions<T>>
type ReplaceOptionsWB<T> = WithoutBase<ReplaceOptions<T>>

type ApplyableOptions<T> = DiagramRequiredOptions<T> & MutationOptions<T>

interface Overloads<T> {
  /**
   * Find a node matching a predicate function.
   */
  find(node: T, predicate: FindOptions<T>['predicate']): T | undefined

  find(node: T, options: FindOptionsWB<T>): T | undefined

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

  findAll(node: T, options: FindOptionsWB<T>): T[]

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

  findIndexPath(node: T, options: FindOptionsWB<T>): IndexPath | undefined

  /**
   * Find the `IndexPath` of all nodes matching a predicate function.
   */
  findAllIndexPaths(
    node: T,
    predicate: FindOptions<T>['predicate']
  ): IndexPath[]

  findAllIndexPaths(node: T, options: FindOptionsWB<T>): IndexPath[]

  /**
   * Visit each node using preorder DFS traversal.
   */
  visit(node: T, onEnter: NonNullable<VisitOptions<T>>['onEnter']): void

  /**
   * Visit each node using DFS traversal.
   */
  visit(node: T, options: VisitOptionsWB<T>): void
}

class Tree<T, AppliedOptions extends Partial<ApplyableOptions<T>>> {
  constructor(
    getChildrenOrBaseOptions: BaseOptions<T> | BaseOptions<T>['getChildren'],
    public appliedOptions: AppliedOptions
  ) {
    this.baseOptions =
      typeof getChildrenOrBaseOptions === 'function'
        ? { getChildren: getChildrenOrBaseOptions }
        : getChildrenOrBaseOptions

    this._getChildren = this.baseOptions.getChildren
  }

  _getChildren: BaseOptions<T>['getChildren']

  /**
   * Returns the node's children.
   *
   * This is the same as the `getChildren` option passed to `defineTree`, included here for convenience.
   */
  getChildren = (
    node: T,
    indexPath: IndexPath,
    context?: TraversalContext<T>
  ) => {
    return this._getChildren(node, indexPath, context)
  }

  baseOptions: BaseOptions<T>

  mergeOptions = <T extends Record<string, any>>(options: T) => ({
    ...this.baseOptions,
    ...this.appliedOptions,
    ...options,
  })

  withOptions = <NewOptions extends Partial<ApplyableOptions<T>>>(
    newOptions: NewOptions
  ) => new Tree(this.baseOptions, { ...this.appliedOptions, ...newOptions })

  /**
   * Returns a node by its `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  access = (node: T, indexPath: IndexPath) =>
    access(node, indexPath, this.mergeOptions({}))

  /**
   * Returns an array of each node in an `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  accessPath = (node: T, indexPath: IndexPath) =>
    accessPath(node, indexPath, this.mergeOptions({}))

  /**
   * Generate a diagram of the tree, as a string.
   */
  diagram = (
    node: T,
    options:
      | DiagramRequiredOptions<T>['getLabel']
      | Prettify<
          AppliedOptions extends DiagramRequiredOptions<T>
            ? DiagramOptionalOptions<T> | void
            : OptionCheck<
                AppliedOptions,
                'getLabel',
                DiagramRequiredOptions<T>
              > &
                DiagramOptionalOptions<T>
        >
  ) =>
    typeof options === 'function'
      ? diagram(node, this.mergeOptions({ getLabel: options }))
      : diagram(node, this.mergeOptions(options))

  find: Overloads<T>['find'] = (
    node: T,
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ) =>
    typeof predicateOrOptions === 'function'
      ? find(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : find(node, this.mergeOptions({ ...predicateOrOptions }))

  findAll: Overloads<T>['findAll'] = (
    node: T,
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ) =>
    typeof predicateOrOptions === 'function'
      ? findAll(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : findAll(node, this.mergeOptions({ ...predicateOrOptions }))

  findIndexPath: Overloads<T>['findIndexPath'] = (
    node: T,
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ) =>
    typeof predicateOrOptions === 'function'
      ? findIndexPath(
          node,
          this.mergeOptions({ predicate: predicateOrOptions })
        )
      : findIndexPath(node, this.mergeOptions({ ...predicateOrOptions }))

  findAllIndexPaths: Overloads<T>['findAllIndexPaths'] = (
    node: T,
    predicateOrOptions: FindOptions<T>['predicate'] | FindOptionsWB<T>
  ) =>
    typeof predicateOrOptions === 'function'
      ? findAllIndexPaths(
          node,
          this.mergeOptions({ predicate: predicateOrOptions })
        )
      : findAllIndexPaths(node, this.mergeOptions({ ...predicateOrOptions }))

  /**
   * Returns an array containing the root node and all of its descendants.
   *
   * This is analogous to `Array.prototype.flat` for flattening arrays.
   */
  flat = (node: T) => flat(node, this.mergeOptions({}))

  /**
   * Map each node into an array of values, which are then flattened into a single array.
   *
   * This is analogous to `Array.prototype.flatMap` for arrays.
   */
  flatMap = <R>(node: T, transform: FlatMapOptions<T, R>['transform']) =>
    flatMap(node, this.mergeOptions({ transform }))

  reduce = <R>(
    node: T,
    nextResult: ReduceOptions<T, R>['nextResult'],
    initialResult: R
  ): R => reduce(node, this.mergeOptions({ nextResult, initialResult }))

  map = <R>(node: T, transform: MapOptions<T, R>['transform']): R =>
    map(node, this.mergeOptions({ transform }))

  visit: Overloads<T>['visit'] = (
    node: T,
    onEnterOrOptions:
      | NonNullable<VisitOptions<T>>['onEnter']
      | VisitOptionsWB<T>
  ) =>
    typeof onEnterOrOptions === 'function'
      ? visit(node, this.mergeOptions({ onEnter: onEnterOrOptions }))
      : visit(node, this.mergeOptions({ ...onEnterOrOptions }))

  // --- Mutations ---

  /**
   * Insert nodes at a given `IndexPath`.
   */
  insert = (
    node: T,
    options: Prettify<
      OptionCheck<AppliedOptions, 'create', InsertOptionsWB<T>> &
        Omit<InsertOptionsWB<T>, 'create'>
    >
  ) => insert(node, this.mergeOptions(options))

  /**
   * Remove nodes at the given `IndexPath`s.
   */
  remove = (
    node: T,
    options: Prettify<
      OptionCheck<AppliedOptions, 'create', RemoveOptionsWB<T>> &
        Omit<RemoveOptionsWB<T>, 'create'>
    >
  ) => remove(node, this.mergeOptions(options))

  /**
   * Move nodes from one `IndexPath` to another.
   */
  move = (
    node: T,
    options: Prettify<
      OptionCheck<AppliedOptions, 'create', MoveOptionsWB<T>> &
        Omit<MoveOptionsWB<T>, 'create'>
    >
  ) => move(node, this.mergeOptions(options))

  /**
   * Replace the node at the given `IndexPath` with another
   */
  replace = (
    node: T,
    options: Prettify<
      OptionCheck<AppliedOptions, 'create', ReplaceOptionsWB<T>> &
        Omit<ReplaceOptionsWB<T>, 'create'>
    >
  ) => replace(node, this.mergeOptions(options))
}

export function defineTree<T>(
  getChildren: BaseOptions<T> | BaseOptions<T>['getChildren']
) {
  return new Tree(getChildren, {})
}
