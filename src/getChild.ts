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

  const result: BaseEntriesOptions<T, number> = {
    ...rest,
    getEntries: (node, keyPath) =>
      getChildren(node, keyPath).map((child, index) => [index, child]),
    getChild: (parent, parentKeyPath, childKey) =>
      getChildren(parent, parentKeyPath)[childKey],
  }

  return result as BaseEntriesOptions<T, any> as BaseEntriesOptions<T, PK>
}
