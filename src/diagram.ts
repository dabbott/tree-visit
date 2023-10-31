import { boxDiagram } from './diagram/boxDiagram'
import { directoryDiagram } from './diagram/directoryDiagram'
import { IndexPath } from './indexPath'
import {
  BaseChildrenOptions,
  BaseEntriesOptions,
  convertChildrenToEntries,
} from './options'

export type DiagramType = 'directory' | 'box'

type CommonDiagramOptions = {
  type?: DiagramType
  flattenSingleChildNodes?: boolean
}

export type DiagramChildrenOptions<T> = BaseChildrenOptions<T> &
  CommonDiagramOptions & {
    getLabel: (node: T, indexPath: IndexPath) => string
  }

export type DiagramEntriesOptions<
  T,
  PK extends PropertyKey
> = BaseEntriesOptions<T, PK> &
  CommonDiagramOptions & {
    getLabel: (node: T, keyPath: PK[]) => string
  }

export type DiagramOptions<T, PK extends PropertyKey> =
  | DiagramChildrenOptions<T>
  | DiagramEntriesOptions<T, PK>

/**
 * Generate a diagram of the tree, as a string.
 */
export function diagram<T>(node: T, options: DiagramChildrenOptions<T>): string
export function diagram<T, PK extends PropertyKey>(
  node: T,
  options: DiagramEntriesOptions<T, PK>
): string
export function diagram<T, PK extends PropertyKey>(
  node: T,
  _options: DiagramOptions<T, PK>
): string {
  const options = diagramOptionsInterop<T, PK>(_options)

  if (options.type === 'box') {
    return boxDiagram(node, options)
  }

  return directoryDiagram(node, options)
}

function diagramOptionsInterop<T, PK extends PropertyKey>(
  options: DiagramOptions<T, PK>
): DiagramEntriesOptions<T, PK> {
  if ('getEntries' in options) return options

  return {
    ...options,
    ...convertChildrenToEntries<T, PK>(options),
    getLabel: options.getLabel as DiagramEntriesOptions<T, PK>['getLabel'],
  }
}
