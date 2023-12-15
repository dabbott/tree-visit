import { access, accessPath } from '../access'
import { DiagramEntriesOptions, diagram } from '../diagram'
import {
  FindEntriesOptions,
  FindEntriesOptionsTyped,
  find,
  findAll,
  findAllIndexPaths,
  findIndexPath,
} from '../find'
import { flat } from '../flat'
import { BaseEntriesOptions } from '../options'
import { ExtractRequiredKeys, OptionCheck, Prettify } from '../types'
import { VisitEntriesOptions, visit } from '../visit'

type WithoutBase<T, PK extends PropertyKey> = Omit<
  T,
  keyof BaseEntriesOptions<T, PK>
>

// type MutationOptions<T, PK extends PropertyKey> = WithoutBase<MutationBaseOptions<T>, PK>

type DiagramOptionsWB<T, PK extends PropertyKey> = WithoutBase<
  DiagramEntriesOptions<T, PK>,
  PK
>
type DiagramRequiredOptions<T, PK extends PropertyKey> = Pick<
  DiagramOptionsWB<T, PK>,
  ExtractRequiredKeys<DiagramOptionsWB<T, PK>>
>
type DiagramOptionalOptions<T, PK extends PropertyKey> = Omit<
  DiagramOptionsWB<T, PK>,
  ExtractRequiredKeys<DiagramOptionsWB<T, PK>>
>
type FindOptionsWB<T, PK extends PropertyKey> = WithoutBase<
  FindEntriesOptions<T, PK>,
  PK
>
type VisitOptionsWB<T, PK extends PropertyKey> = WithoutBase<
  VisitEntriesOptions<T, PK>,
  PK
>
// type InsertOptionsWB<T> = WithoutBase<InsertOptions<T>>
// type RemoveOptionsWB<T> = WithoutBase<RemoveOptions<T>>
// type MoveOptionsWB<T> = WithoutBase<MoveOptions<T>>
// type ReplaceOptionsWB<T> = WithoutBase<ReplaceOptions<T>>

type ApplyableOptions<T, PK extends PropertyKey> = DiagramRequiredOptions<T, PK> // & MutationOptions<T>

interface Overloads<T, PK extends PropertyKey> {
  /**
   * Find a node matching a predicate function.
   */
  find(
    node: T,
    predicate: FindEntriesOptions<T, PK>['predicate']
  ): T | undefined

  find(node: T, options: FindOptionsWB<T, PK>): T | undefined

  find<S extends T>(
    node: T,
    predicate: FindEntriesOptionsTyped<T, PK, S>['predicate']
  ): S | undefined

  find<S extends T>(
    node: T,
    options: WithoutBase<FindEntriesOptionsTyped<T, PK, S>, PK>
  ): S | undefined

  /**
   * Find all nodes matching a predicate function.
   */
  findAll(node: T, predicate: FindEntriesOptions<T, PK>['predicate']): T[]

  findAll(node: T, options: FindOptionsWB<T, PK>): T[]

  findAll<S extends T>(
    node: T,
    predicate: FindEntriesOptionsTyped<T, PK, S>['predicate']
  ): S[]

  findAll<S extends T>(
    node: T,
    options: WithoutBase<FindEntriesOptionsTyped<T, PK, S>, PK>
  ): S[]

  /**
   * Find the `IndexPath` of a node matching a predicate function.
   */
  findIndexPath(
    node: T,
    predicate: FindEntriesOptions<T, PK>['predicate']
  ): PK[] | undefined

  findIndexPath(node: T, options: FindOptionsWB<T, PK>): PK[] | undefined

  /**
   * Find the `IndexPath` of all nodes matching a predicate function.
   */
  findAllIndexPaths(
    node: T,
    predicate: FindEntriesOptions<T, PK>['predicate']
  ): PK[][]

  findAllIndexPaths(node: T, options: FindOptionsWB<T, PK>): PK[][]

  /**
   * Visit each node using preorder DFS traversal.
   */
  visit(
    node: T,
    onEnter: NonNullable<VisitEntriesOptions<T, PK>>['onEnter']
  ): void

  /**
   * Visit each node using DFS traversal.
   */
  visit(node: T, options: VisitOptionsWB<T, PK>): void
}

export class EntriesTree<
  T,
  PK extends PropertyKey,
  AppliedOptions extends Partial<ApplyableOptions<T, PK>>
> {
  constructor(
    private baseOptions: BaseEntriesOptions<T, PK>,
    private appliedOptions: AppliedOptions
  ) {}

  private mergeOptions = <T extends Record<string, any>>(options: T) => ({
    ...this.baseOptions,
    ...this.appliedOptions,
    ...options,
  })

  withOptions = <NewOptions extends Partial<ApplyableOptions<T, PK>>>(
    newOptions: NewOptions
  ) =>
    new EntriesTree(this.baseOptions, {
      ...this.appliedOptions,
      ...newOptions,
    })

  /**
   * Returns a node by its `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  access = (node: T, path: PK[]) => access(node, this.mergeOptions({ path }))

  /**
   * Returns an array of each node in an `IndexPath`.
   *
   * The first node is implicitly included in the `IndexPath` (i.e. no need to pass a `0` first in every `IndexPath`).
   */
  accessPath = (node: T, path: PK[]) =>
    accessPath(node, this.mergeOptions({ path }))

  /**
   * Generate a diagram of the tree, as a string.
   */
  diagram = (
    node: T,
    options:
      | DiagramRequiredOptions<T, PK>['getLabel']
      | Prettify<
          AppliedOptions extends DiagramRequiredOptions<T, PK>
            ? DiagramOptionalOptions<T, PK> | void
            : OptionCheck<
                AppliedOptions,
                'getLabel',
                DiagramRequiredOptions<T, PK>
              > &
                DiagramOptionalOptions<T, PK>
        >
  ) =>
    typeof options === 'function'
      ? diagram(node, this.mergeOptions({ getLabel: options }))
      : diagram(node, this.mergeOptions(options))

  find: Overloads<T, PK>['find'] = (
    node: T,
    predicateOrOptions:
      | FindEntriesOptions<T, PK>['predicate']
      | FindOptionsWB<T, PK>
  ) =>
    typeof predicateOrOptions === 'function'
      ? find(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : find(node, this.mergeOptions({ ...predicateOrOptions }))

  findAll: Overloads<T, PK>['findAll'] = (
    node: T,
    predicateOrOptions:
      | FindEntriesOptions<T, PK>['predicate']
      | FindOptionsWB<T, PK>
  ) =>
    typeof predicateOrOptions === 'function'
      ? findAll(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : findAll(node, this.mergeOptions({ ...predicateOrOptions }))

  findIndexPath: Overloads<T, PK>['findIndexPath'] = (
    node: T,
    predicateOrOptions:
      | FindEntriesOptions<T, PK>['predicate']
      | FindOptionsWB<T, PK>
  ) =>
    typeof predicateOrOptions === 'function'
      ? findIndexPath(
          node,
          this.mergeOptions({ predicate: predicateOrOptions })
        )
      : findIndexPath(node, this.mergeOptions({ ...predicateOrOptions }))

  findAllIndexPaths: Overloads<T, PK>['findAllIndexPaths'] = (
    node: T,
    predicateOrOptions:
      | FindEntriesOptions<T, PK>['predicate']
      | FindOptionsWB<T, PK>
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

  // /**
  //  * Map each node into an array of values, which are then flattened into a single array.
  //  *
  //  * This is analogous to `Array.prototype.flatMap` for arrays.
  //  */
  // flatMap = <R>(node: T, transform: FlatMapOptions<T, R>['transform']) =>
  //   flatMap(node, this.mergeOptions({ transform }))

  // reduce = <R>(
  //   node: T,
  //   nextResult: ReduceChildrenOptions<T, R>['nextResult'],
  //   initialResult: R
  // ): R => reduce(node, this.mergeOptions({ nextResult, initialResult }))

  // map = <R>(node: T, transform: MapOptions<T, R>['transform']): R =>
  //   map(node, this.mergeOptions({ transform }))

  visit: Overloads<T, PK>['visit'] = (
    node: T,
    onEnterOrOptions:
      | NonNullable<VisitEntriesOptions<T, PK>>['onEnter']
      | VisitOptionsWB<T, PK>
  ) =>
    typeof onEnterOrOptions === 'function'
      ? visit(node, this.mergeOptions({ onEnter: onEnterOrOptions }))
      : visit(node, this.mergeOptions({ ...onEnterOrOptions }))

  // --- Mutations ---

  /**
   * Insert nodes at a given `IndexPath`.
   */
  // insert = (
  //   node: T,
  //   options: Prettify<
  //     OptionCheck<AppliedOptions, 'create', InsertOptionsWB<T>> &
  //       Omit<InsertOptionsWB<T>, 'create'>
  //   >
  // ) => insert(node, this.mergeOptions(options))

  // /**
  //  * Remove nodes at the given `IndexPath`s.
  //  */
  // remove = (
  //   node: T,
  //   options: Prettify<
  //     OptionCheck<AppliedOptions, 'create', RemoveOptionsWB<T>> &
  //       Omit<RemoveOptionsWB<T>, 'create'>
  //   >
  // ) => remove(node, this.mergeOptions(options))

  // /**
  //  * Move nodes from one `IndexPath` to another.
  //  */
  // move = (
  //   node: T,
  //   options: Prettify<
  //     OptionCheck<AppliedOptions, 'create', MoveOptionsWB<T>> &
  //       Omit<MoveOptionsWB<T>, 'create'>
  //   >
  // ) => move(node, this.mergeOptions(options))

  // /**
  //  * Replace the node at the given `IndexPath` with another
  //  */
  // replace = (
  //   node: T,
  //   options: Prettify<
  //     OptionCheck<AppliedOptions, 'create', ReplaceOptionsWB<T>> &
  //       Omit<ReplaceOptionsWB<T>, 'create'>
  //   >
  // ) => replace(node, this.mergeOptions(options))
}
