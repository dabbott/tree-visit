export type EnterReturnValue = void | 'skip' | 'stop'
export type LeaveReturnValue = void | 'stop'
export type IndexPath = number[]
export type VisitOptions<T> = {
  getChildren(node: T): T[]
  onEnter?(node: T, indexPath: IndexPath): EnterReturnValue
  onLeave?(node: T, indexPath: IndexPath): LeaveReturnValue
}

type ReturnValue = void | 'stop'
type VisitOptionsInternal<T> = {
  getChildren(node: T): T[]
  onEnter(node: T, indexPath: IndexPath): EnterReturnValue
  onLeave(node: T, indexPath: IndexPath): LeaveReturnValue
}

function visitInternal<T>(
  node: T,
  options: VisitOptionsInternal<T>,
  indexPath: IndexPath
): ReturnValue {
  const { onEnter, onLeave, getChildren } = options

  const enterResult = onEnter(node, indexPath)

  if (enterResult === 'stop') return enterResult

  if (enterResult === 'skip') return

  const children = getChildren(node)

  for (let i = 0; i < children.length; i++) {
    indexPath.push(i)

    const childResult = visitInternal(children[i], options, indexPath)

    indexPath.pop()

    if (childResult === 'stop') return childResult
  }

  return onLeave(node, indexPath)
}

export function visit<T>(node: T, options: VisitOptions<T>) {
  const normalizedOptions: VisitOptionsInternal<T> = {
    onEnter: (node: T) => {},
    onLeave: (node: T) => {},
    ...options,
  }

  return visitInternal(node, normalizedOptions, [])
}
