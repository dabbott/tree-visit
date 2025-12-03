import { IndexPath } from './indexPath.js'
import { BaseOptions } from './options.js'
import { boxDiagram } from './diagram/boxDiagram.js'
import { directoryDiagram } from './diagram/directoryDiagram.js'

export type DiagramType = 'directory' | 'box'

export type DiagramOptions<T> = BaseOptions<T> & {
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
