import { IndexPath } from './indexPath'
import { BaseOptions } from './options'
import { boxDiagram } from './diagram/boxDiagram'
import { directoryDiagram } from './diagram/directoryDiagram'

export type DiagramType = 'directory' | 'box'

export type DiagramOptions<T> = BaseOptions<T> & {
  getLabel: (node: T, indexPath: IndexPath) => string
  type?: DiagramType
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
