import { IndexPath } from './indexPath'
import { BaseChildrenOptions, BaseEntriesOptions } from './options'

export function getChild<T, PK extends PropertyKey>(
  node: T,
  options: BaseEntriesOptions<T, PK>,
  keyPath: PK[],
  key: PK
): T {
  if (options.getChild) {
    return options.getChild(node, keyPath, key)
  } else {
    const entries = options.getEntries(node, keyPath)
    const entry = entries.find(([k]) => k === key)
    return entry![1]
  }
}

export function convertChildrenToEntries<T, PK extends PropertyKey>(
  options: BaseChildrenOptions<T>
): BaseEntriesOptions<T, PK> {
  const { getChildren, ...rest } = options

  return {
    ...rest,
    getChild: (parent, parentKeyPath, childKey) =>
      getChildren(parent, parentKeyPath as IndexPath)[childKey as number],
    getEntries: (node, keyPath) =>
      getChildren(node, keyPath as IndexPath).map((child, index) => [
        index as PK,
        child,
      ]),
  }
}
