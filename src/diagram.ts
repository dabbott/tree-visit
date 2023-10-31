import { boxDiagram } from './diagram/boxDiagram'
import { directoryDiagram } from './diagram/directoryDiagram'
import { IndexPath } from './indexPath'
import { BaseChildrenOptions } from './options'

export type DiagramType = 'directory' | 'box'

export type DiagramOptions<T> = BaseChildrenOptions<T> & {
  getLabel: (node: T, indexPath: IndexPath) => string
  type?: DiagramType
  flattenSingleChildNodes?: boolean
}

/**
 * Generate a diagram of the tree, as a string.
 */
export function diagram<T>(node: T, options: DiagramOptions<T>): string {
  if (options.type === 'box') {
    return boxDiagram(node, options)
  }

  return directoryDiagram(node, options)
}
