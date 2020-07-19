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
    onLeave: () => {},
    ...options,
  }

  visitInternal(node, normalizedOptions, [])
}

function visitInternal<T>(
  node: T,
  options: Required<VisitOptions<T>>,
  indexPath: IndexPath
): void | 'stop' {
  const { onEnter, onLeave, getChildren } = options

  const enterResult = onEnter(node, indexPath)

  if (enterResult === STOP) return enterResult

  if (enterResult === SKIP) return

  const children = getChildren(node, indexPath)

  for (let i = 0; i < children.length; i++) {
    indexPath.push(i)

    const childResult = visitInternal(children[i], options, indexPath)

    indexPath.pop()

    if (childResult === STOP) return childResult
  }

  return onLeave(node, indexPath)
}
