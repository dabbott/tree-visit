export type EnterReturnValue = void | 'skip' | 'stop'
export type LeaveReturnValue = void | 'stop'
export type VisitOptions<T> = {
  getChildren(node: T): T[]
  onEnter?(node: T): EnterReturnValue
  onLeave?(node: T): LeaveReturnValue
}

type ReturnValue = void | 'stop'
type VisitOptionsInternal<T> = {
  getChildren(node: T): T[]
  onEnter(node: T): EnterReturnValue
  onLeave(node: T): LeaveReturnValue
}

function visitInternal<T>(
  node: T,
  options: VisitOptionsInternal<T>
): ReturnValue {
  const { onEnter, onLeave, getChildren } = options

  const enterResult = onEnter(node)

  if (enterResult === 'stop') return enterResult

  if (enterResult === 'skip') return

  const children = getChildren(node)

  for (let child of children) {
    const childResult = visitInternal(child, options)

    if (childResult === 'stop') return childResult
  }

  return onLeave(node)
}

export function visit<T>(node: T, options: VisitOptions<T>) {
  const normalizedOptions: VisitOptionsInternal<T> = {
    onEnter: (node: T) => {},
    onLeave: (node: T) => {},
    ...options,
  }

  return visitInternal(node, normalizedOptions)
}
