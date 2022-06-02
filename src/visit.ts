import { access } from './access'
import { IndexPath } from './indexPath'
import { BaseOptions } from './options'

export const SKIP = 'skip'
export const STOP = 'stop'

export type EnterReturnValue = void | 'skip' | 'stop'
export type LeaveReturnValue = void | 'stop'
export type VisitOptions<T> = BaseOptions<T> & {
  onEnter?(node: T, indexPath: IndexPath): EnterReturnValue
  onLeave?(node: T, indexPath: IndexPath): LeaveReturnValue
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
export function visit<T>(node: T, options: VisitOptions<T>): void {
  const normalizedOptions: Required<VisitOptions<T>> = {
    onEnter: () => {},
    ...options,
    onLeave: options.onLeave ?? (() => {}),
  }

  visitInternal(node, normalizedOptions)
}

type NodeWrapper<T> = {
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

function visitInternal<T>(
  root: T,
  options: Required<VisitOptions<T>>
): void | 'stop' {
  const { onEnter, onLeave, getChildren } = options

  let indexPath: IndexPath = []
  let stack: NodeWrapper<T>[] = [{ node: root }]

  while (stack.length > 0) {
    let wrapper = stack[stack.length - 1]

    // Visit the wrapped node
    if (wrapper.state === undefined) {
      const enterResult = onEnter(wrapper.node, indexPath)

      if (enterResult === STOP) return enterResult

      wrapper.state = enterResult === SKIP ? -1 : 0
    }

    const children = wrapper.children || getChildren(wrapper.node, indexPath)

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

      const leaveResult = onLeave(wrapper.node, indexPath)

      if (leaveResult === STOP) return leaveResult
    }

    indexPath.pop()
    stack.pop()
  }
}
