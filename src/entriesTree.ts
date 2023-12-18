import { diagram } from './diagram'
import { find } from './find'
import { IndexPath } from './indexPath'

export type BaseEntriesOptions<T, PK extends PropertyKey> = {
  getEntries: (node: T, keyPath: PK[]) => [PK, T][]
  getChild?: (parent: T, parentKeyPath: PK[], childKey: PK) => T
}

export type FindEntriesOptions<T, PK extends PropertyKey> = {
  /**
   * Return `true` to include this node in the results.
   */
  predicate: (node: T, keyPath: PK[]) => boolean
}

export type DiagramEntriesOptions<T, PK extends PropertyKey> = {
  getLabel: (node: T, keyPath: PK[]) => string
}

// For each slice of the index path get the mapped key and create a new path from them
export function resolveIndexPath<PK extends PropertyKey>(
  map: Map<string, PK>,
  indexPath: IndexPath
): PK[] {
  const path: PK[] = []
  let current = ''

  for (let i = 0; i < indexPath.length; i++) {
    if (i > 0) current += '.'
    current += indexPath[i]
    const key = map.get(current)
    path.push(key!)
  }

  return path
}

function createEntriesAdapter<T, PK extends PropertyKey>(
  options: BaseEntriesOptions<T, PK>
) {
  let map = new Map<string, PK>()

  function getChildren([key, node]: [PK, T], indexPath: IndexPath) {
    map.set(indexPath.join('.'), key)

    const path = resolveIndexPath(map, indexPath)

    return options.getEntries(node, path)
  }

  function getNodePath(indexPath: IndexPath, key: PK) {
    return indexPath.length > 0
      ? [...resolveIndexPath(map, indexPath.slice(0, -1)), key]
      : []
  }

  return {
    getChildren,
    getNodePath,
  }
}

export function defineEntriesTree<T, PK extends PropertyKey>(
  options: BaseEntriesOptions<T, PK>
) {
  function entriesFind(node: T, findOptions: FindEntriesOptions<T, PK>) {
    const { getChildren, getNodePath } = createEntriesAdapter(options)

    const result = find(['' as PK, node], {
      getChildren,
      predicate: ([key, node], indexPath: IndexPath) => {
        return findOptions.predicate(node, getNodePath(indexPath, key))
      },
    })

    return result && result[1]
  }

  function entriesDiagram(
    node: T,
    diagramOptions: DiagramEntriesOptions<T, PK>
  ) {
    const { getChildren, getNodePath } = createEntriesAdapter(options)

    return diagram(['' as PK, node], {
      getChildren,
      getLabel: ([key, node], indexPath: IndexPath) => {
        return diagramOptions.getLabel(node, getNodePath(indexPath, key))
      },
    })
  }

  return { diagram: entriesDiagram, find: entriesFind }
}
