import { access, accessPath } from './access'
import { DiagramOptions, diagram } from './diagram'
import { IndexPath } from './indexPath'
import { InsertOptions, insert } from './insert'
import { BaseOptions, MutationBaseOptions } from './options'
import { RemoveOptions, remove } from './remove'
import { ExtractRequiredKeys, OptionCheck } from './types'

type WithoutBase<T> = Omit<T, keyof BaseOptions<T>>

type MutationOptions<T> = WithoutBase<MutationBaseOptions<T>>

type InsertOptionsWB<T> = WithoutBase<InsertOptions<T>>
type RemoveOptionsWB<T> = WithoutBase<RemoveOptions<T>>

type DiagramOptionsWB<T> = WithoutBase<DiagramOptions<T>>
type DiagramRequiredOptions<T> = Pick<
  DiagramOptionsWB<T>,
  ExtractRequiredKeys<DiagramOptionsWB<T>>
>
type DiagramOptionalOptions<T> = Omit<
  DiagramOptionsWB<T>,
  ExtractRequiredKeys<DiagramOptionsWB<T>>
>

type ApplyableOptions<T> = DiagramRequiredOptions<T> & MutationOptions<T>

class Tree<T, AppliedOptions extends Partial<ApplyableOptions<T>>> {
  constructor(
    getChildrenOrBaseOptions: BaseOptions<T> | ((node: T) => T[]),
    public appliedOptions: AppliedOptions
  ) {
    this.baseOptions =
      typeof getChildrenOrBaseOptions === 'function'
        ? { getChildren: getChildrenOrBaseOptions }
        : getChildrenOrBaseOptions
  }

  public baseOptions: BaseOptions<T>

  get getChildren() {
    return this.baseOptions.getChildren
  }

  access = (node: T, indexPath: IndexPath) =>
    access(node, indexPath, this.baseOptions)

  accessPath = (node: T, indexPath: IndexPath) =>
    accessPath(node, indexPath, this.baseOptions)

  diagram = (
    node: T,
    options: AppliedOptions extends DiagramRequiredOptions<T>
      ? DiagramOptionalOptions<T> | void
      : OptionCheck<AppliedOptions, 'getLabel', DiagramRequiredOptions<T>> &
          DiagramOptionalOptions<T>
  ) =>
    diagram(node, { ...this.baseOptions, ...this.appliedOptions, ...options })

  insert = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', InsertOptionsWB<T>> &
      Omit<InsertOptionsWB<T>, 'create'>
  ) => insert(node, { ...this.baseOptions, ...this.appliedOptions, ...options })

  remove = (
    node: T,
    options: OptionCheck<AppliedOptions, 'create', RemoveOptionsWB<T>> &
      Omit<RemoveOptionsWB<T>, 'create'>
  ) => remove(node, { ...this.baseOptions, ...this.appliedOptions, ...options })

  // ---

  withOptions = <NewOptions extends Partial<ApplyableOptions<T>>>(
    newOptions: NewOptions
  ) => new Tree(this.baseOptions, { ...this.appliedOptions, ...newOptions })
}

export function defineTree<T>(
  getChildren: BaseOptions<T> | ((node: T) => T[])
) {
  return new Tree(getChildren, {})
}

type TestNode = {
  label: string
  children: TestNode[]
}
const a = { label: 'a', children: [] }

const TestTree1 = defineTree((node: TestNode) => node.children)
TestTree1.diagram(a, { getLabel: (node) => node.label })
// TestTree1.diagram(a, {}) // Fails

const TestTree2 = TestTree1.withOptions({ getLabel: (node) => node.label })
// TestTree2.diagram(a)

const TestTree3 = TestTree1.withOptions({
  getLabel: (node) => node.label,
  funcA: () => {},
})
TestTree3.diagram(a, {})
TestTree3.diagram(a)

const InsertTree1 = defineTree((node: TestNode) => node.children)
InsertTree1.insert(a, { at: [], nodes: [], create: (node) => node })
const InsertTree2 = InsertTree1.withOptions({ create: (node) => node })
InsertTree2.insert(a, { at: [], nodes: [] })
