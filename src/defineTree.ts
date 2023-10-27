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
import { BaseOptions, MutationBaseOptions } from './options'
import { ReduceOptions, reduce } from './reduce'
import { RemoveOptions, remove } from './remove'
import { ReplaceOptions, replace } from './replace'
import { ExtractRequiredKeys, OptionCheck } from './types'
import { VisitOptions, visit } from './visit'

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

function bindAllMethods(instance: any): void {
  const prototype = Object.getPrototypeOf(instance)

  Object.getOwnPropertyNames(prototype).forEach((propertyName) => {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      prototype,
      propertyName
    )

    if (propertyDescriptor) {
      // For methods
      if (
        typeof propertyDescriptor.value === 'function' &&
        propertyName !== 'constructor'
      ) {
        instance[propertyName] = propertyDescriptor.value.bind(instance)
      }

      // For getters and setters
      if (propertyDescriptor.get || propertyDescriptor.set) {
        const { get, set } = propertyDescriptor
        const boundDescriptor: PropertyDescriptor = {
          configurable: true,
          enumerable: true,
        }

        if (get) {
          boundDescriptor.get = get.bind(instance)
        }

        if (set) {
          boundDescriptor.set = set.bind(instance)
        }

        Object.defineProperty(instance, propertyName, boundDescriptor)
      }
    }
  })
}

class Tree<T, AppliedOptions extends Partial<ApplyableOptions<T>>> {
  constructor(
    getChildrenOrBaseOptions: BaseOptions<T> | ((node: T) => T[]),
    public appliedOptions: AppliedOptions
  ) {
    this.baseOptions =
      typeof getChildrenOrBaseOptions === 'function'
        ? { getChildren: getChildrenOrBaseOptions }
        : getChildrenOrBaseOptions

    bindAllMethods(this)
  }

  public baseOptions: BaseOptions<T>

  private mergeOptions = <T extends Record<string, any>>(options: T) => ({
    ...this.baseOptions,
    ...this.appliedOptions,
    ...options,
  })

  withOptions = <NewOptions extends Partial<ApplyableOptions<T>>>(
    newOptions: NewOptions
  ) => new Tree(this.baseOptions, { ...this.appliedOptions, ...newOptions })

  get getChildren() {
    return this.baseOptions.getChildren
  }

  access = (node: T, indexPath: IndexPath) =>
    access(node, indexPath, this.mergeOptions({}))

  accessPath = (node: T, indexPath: IndexPath) =>
    accessPath(node, indexPath, this.mergeOptions({}))

  diagram = (
    node: T,
    options:
      | DiagramRequiredOptions<T>['getLabel']
      | (AppliedOptions extends DiagramRequiredOptions<T>
          ? DiagramOptionalOptions<T> | void
          : OptionCheck<AppliedOptions, 'getLabel', DiagramRequiredOptions<T>> &
              DiagramOptionalOptions<T>)
  ) =>
    typeof options === 'function'
      ? diagram(node, { ...this.baseOptions, getLabel: options })
      : diagram(node, this.mergeOptions(options))

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

  find(
    node: T,
    predicateOrOptions:
      | FindOptions<T>['predicate']
      | WithoutBase<FindOptions<T>>
  ) {
    return typeof predicateOrOptions === 'function'
      ? find(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : find(node, this.mergeOptions({ ...predicateOrOptions }))
  }

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

  findAll(
    node: T,
    predicateOrOptions:
      | FindOptions<T>['predicate']
      | WithoutBase<FindOptions<T>>
  ) {
    return typeof predicateOrOptions === 'function'
      ? findAll(node, this.mergeOptions({ predicate: predicateOrOptions }))
      : findAll(node, this.mergeOptions({ ...predicateOrOptions }))
  }

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

  findIndexPath(
    node: T,
    predicateOrOptions:
      | FindOptions<T>['predicate']
      | WithoutBase<FindOptions<T>>
  ) {
    return typeof predicateOrOptions === 'function'
      ? findIndexPath(
          node,
          this.mergeOptions({ predicate: predicateOrOptions })
        )
      : findIndexPath(node, this.mergeOptions({ ...predicateOrOptions }))
  }

  /**
   * Find the `IndexPath` of all nodes matching a predicate function.
   */
  findAllIndexPaths(
    node: T,
    predicate: FindOptions<T>['predicate']
  ): IndexPath[]

  findAllIndexPaths(node: T, options: WithoutBase<FindOptions<T>>): IndexPath[]

  findAllIndexPaths(
    node: T,
    predicateOrOptions:
      | FindOptions<T>['predicate']
      | WithoutBase<FindOptions<T>>
  ) {
    return typeof predicateOrOptions === 'function'
      ? findAllIndexPaths(
          node,
          this.mergeOptions({ predicate: predicateOrOptions })
        )
      : findAllIndexPaths(node, this.mergeOptions({ ...predicateOrOptions }))
  }

  flat = (node: T) => flat(node, this.mergeOptions({}))

  flatMap = <R>(node: T, transform: FlatMapOptions<T, R>['transform']) =>
    flatMap(node, this.mergeOptions({ transform }))

  reduce = <R>(
    node: T,
    nextResult: ReduceOptions<T, R>['nextResult'],
    initialResult: R
  ): R => reduce(node, this.mergeOptions({ nextResult, initialResult }))

  map = <R>(node: T, transform: MapOptions<T, R>['transform']): R =>
    map(node, this.mergeOptions({ transform }))

  /**
   * Visit each node using preorder DFS traversal.
   */
  visit(node: T, onEnter: NonNullable<VisitOptions<T>>['onEnter']): void

  /**
   * Visit each node using DFS traversal.
   */
  visit(node: T, options: VisitOptionsWB<T>): void

  visit(
    node: T,
    onEnterOrOptions:
      | NonNullable<VisitOptions<T>>['onEnter']
      | VisitOptionsWB<T>
  ) {
    return typeof onEnterOrOptions === 'function'
      ? visit(node, this.mergeOptions({ onEnter: onEnterOrOptions }))
      : visit(node, this.mergeOptions({ ...onEnterOrOptions }))
  }

  // --- Mutations ---

  insert = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', InsertOptionsWB<T>> &
      Omit<InsertOptionsWB<T>, 'create'>
  ) => insert(node, this.mergeOptions(options))

  remove = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', RemoveOptionsWB<T>> &
      Omit<RemoveOptionsWB<T>, 'create'>
  ) => remove(node, this.mergeOptions(options))

  move = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', MoveOptionsWB<T>> &
      Omit<MoveOptionsWB<T>, 'create'>
  ) => move(node, this.mergeOptions(options))

  replace = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', ReplaceOptionsWB<T>> &
      Omit<ReplaceOptionsWB<T>, 'create'>
  ) => replace(node, this.mergeOptions(options))
}

export function defineTree<T>(
  getChildren: BaseOptions<T> | ((node: T) => T[])
) {
  return new Tree(getChildren, {})
}

// type TestNode = {
//   label: string
//   children: TestNode[]
// }
// const a = { label: 'a', children: [] }

// const TestTree1 = defineTree((node: TestNode) => node.children)
// TestTree1.diagram(a, { getLabel: (node) => node.label })
// // TestTree1.diagram(a, {}) // Fails
// TestTree1.diagram(a, (node) => node.label)

// const TestTree2 = TestTree1.withOptions({ getLabel: (node) => node.label })
// // TestTree2.diagram(a)

// const TestTree3 = TestTree1.withOptions({
//   getLabel: (node) => node.label,
//   funcA: () => {},
// })
// TestTree3.diagram(a, {})
// TestTree3.diagram(a)

// const InsertTree1 = defineTree((node: TestNode) => node.children)
// InsertTree1.insert(a, { at: [], nodes: [], create: (node) => node })
// const InsertTree2 = InsertTree1.withOptions({ create: (node) => node })
// InsertTree2.insert(a, { at: [], nodes: [] })
