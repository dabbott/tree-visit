import { IndexPath, KeyPath } from './indexPath'
import { BaseEntriesOptions, BaseOptions } from './options'

export const SKIP = 'skip'
export const STOP = 'stop'

export type EnterReturnValue = void | 'skip' | 'stop'
export type LeaveReturnValue = void | 'stop'
export type VisitChildrenOptions<T> = BaseOptions<T> & {
  onEnter?(node: T, indexPath: IndexPath): EnterReturnValue
  onLeave?(node: T, indexPath: IndexPath): LeaveReturnValue
}
export type VisitOptions<T> = VisitChildrenOptions<T> | VisitEntriesOptions<T>

type NodeChildrenWrapper<T> = {
  node: T

  /**
   * The current traversal state of the node.
   *
   * undefined => not visited
   * -1        => skipped
   * n         => nth child
   */
  state?: number

  /**
   * Cached children, so we only call getChildren once per node
   */
  children?: T[]
}

/**
 * Visit each node in the tree, calling an optional `onEnter` and `onLeave` for each.
 *
 * From `onEnter`:
 *
 * - return nothing or `undefined` to continue
 * - return `"skip"` to skip the children of that node and the subsequent `onLeave`
 * - return `"stop"` to end traversal
 *
 * From `onLeave`:
 *
 * - return nothing or `undefined` to continue
 * - return `"stop"` to end traversal
 */
export function visit<T>(node: T, options: VisitChildrenOptions<T>): void
export function visit<T>(node: T, options: VisitEntriesOptions<T>): void
export function visit<T>(node: T, options: VisitOptions<T>): void {
  if ('getEntries' in options) {
    visitKeyed(node, options)
  } else {
    visitChildren(node, options)
  }
}

function visitChildren<T>(node: T, options: VisitChildrenOptions<T>): void {
  const { onEnter, onLeave, getChildren } = options

  let indexPath: IndexPath = []
  let stack: NodeChildrenWrapper<T>[] = [{ node }]

  const getIndexPath = options.reuseIndexPath
    ? () => indexPath
    : () => indexPath.slice()

  while (stack.length > 0) {
    let wrapper = stack[stack.length - 1]

    // Visit the wrapped node
    if (wrapper.state === undefined) {
      const enterResult = onEnter?.(wrapper.node, getIndexPath())

      if (enterResult === STOP) return

      wrapper.state = enterResult === SKIP ? -1 : 0
    }

    const children =
      wrapper.children || getChildren(wrapper.node, getIndexPath())

    if (!wrapper.children) {
      wrapper.children = children
    }

    // If the node wasn't skipped
    if (wrapper.state !== -1) {
      // Visit the next child
      if (wrapper.state < children.length) {
        let currentIndex = wrapper.state

        indexPath.push(currentIndex)
        stack.push({ node: children[currentIndex] })

        wrapper.state = currentIndex + 1

        continue
      }

      const leaveResult = onLeave?.(wrapper.node, getIndexPath())

      if (leaveResult === STOP) return
    }

    indexPath.pop()
    stack.pop()
  }
}

type VisitEntriesOptions<T> = BaseEntriesOptions<T> & {
  onEnter?(node: T, keyPath: KeyPath): EnterReturnValue
  onLeave?(node: T, keyPath: KeyPath): LeaveReturnValue
}

type NodeEntriesWrapper<T> = {
  node: T

  /**
   * The current traversal state of the node.
   *
   * undefined => not visited
   * -1        => skipped
   * n         => nth child
   */
  state?: number

  /**
   * Cached children, so we only call getChildren once per node
   */
  entries?: [string, T][]
}

/**
 * Visit each node in the tree, calling an optional `onEnter` and `onLeave` for each.
 *
 * From `onEnter`:
 *
 * - return nothing or `undefined` to continue
 * - return `"skip"` to skip the children of that node and the subsequent `onLeave`
 * - return `"stop"` to end traversal
 *
 * From `onLeave`:
 *
 * - return nothing or `undefined` to continue
 * - return `"stop"` to end traversal
 */
export function visitKeyed<T>(node: T, options: VisitEntriesOptions<T>): void {
  const { onEnter, onLeave, getEntries } = options

  let keyPath: KeyPath = []
  let stack: NodeEntriesWrapper<T>[] = [{ node }]

  const getKeyPath = options.reuseIndexPath
    ? () => keyPath
    : () => keyPath.slice()

  while (stack.length > 0) {
    let wrapper = stack[stack.length - 1]

    // Visit the wrapped node
    if (wrapper.state === undefined) {
      const enterResult = onEnter?.(wrapper.node, getKeyPath())

      if (enterResult === STOP) return

      wrapper.state = enterResult === SKIP ? -1 : 0
    }

    const entries = wrapper.entries || getEntries(wrapper.node, getKeyPath())

    if (!wrapper.entries) {
      wrapper.entries = entries
    }

    // If the node wasn't skipped
    if (wrapper.state !== -1) {
      // Visit the next child
      if (wrapper.state < entries.length) {
        let currentIndex = wrapper.state

        keyPath.push(entries[currentIndex][0])
        stack.push({ node: entries[currentIndex][1] })

        wrapper.state = currentIndex + 1

        continue
      }

      const leaveResult = onLeave?.(wrapper.node, getKeyPath())

      if (leaveResult === STOP) return
    }

    keyPath.pop()
    stack.pop()
  }
}
