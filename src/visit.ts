import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'

export const SKIP = 'skip'
export const STOP = 'stop'

export type EnterReturnValue = void | 'skip' | 'stop'
export type LeaveReturnValue = void | 'stop'
export type VisitOptions<T> = BaseChildrenOptions<T> & {
  onEnter?(node: T, indexPath: IndexPath): EnterReturnValue
  onLeave?(node: T, indexPath: IndexPath): LeaveReturnValue
}
export type VisitEntriesOptions<T, PK extends PropertyKey> = BaseEntriesOptions<
  T,
  PK
> & {
  onEnter?(node: T, keyPath: PK[]): EnterReturnValue
  onLeave?(node: T, keyPath: PK[]): LeaveReturnValue
}

type NodeWrapper<T, PK extends PropertyKey> = {
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
  entries?: [PK, T][]
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
export function visit<T>(node: T, options: VisitOptions<T>): void
export function visit<T, PK extends PropertyKey>(
  node: T,
  options: VisitEntriesOptions<T, PK>
): void
export function visit<T, PK extends PropertyKey>(
  node: T,
  _options: VisitOptions<T> | VisitEntriesOptions<T, PK>
): void {
  const options = visitOptionsInterop(_options)
  const { onEnter, onLeave, getEntries } = options

  let keyPath: PK[] = []
  let stack: NodeWrapper<T, PK>[] = [{ node }]

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

function visitOptionsInterop<T, PK extends PropertyKey>(
  options: VisitOptions<T> | VisitEntriesOptions<T, PK>
): VisitEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...convertChildrenToEntries<T, PK>(options),
    ...(options.onEnter && {
      onEnter: options.onEnter as VisitEntriesOptions<T, PK>['onEnter'],
    }),
    ...(options.onLeave && {
      onLeave: options.onLeave as VisitEntriesOptions<T, PK>['onLeave'],
    }),
  }
}
