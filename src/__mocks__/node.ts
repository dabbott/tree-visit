import { IndexPath } from '../indexPath'

export type Node = {
  name: string
  children?: Node[]
  indexPath: IndexPath
}

export function getChildren(node: Node): Node[] {
  return node.children ?? []
}

// Create a new child object for each node to test that we're not relying on object identity
export function getChildrenUnstable(node: Node): Node[] {
  return getChildren(node).map((item) => ({ ...item }))
}

export function getLabel(node: Node): string {
  return node.name
}

export const example: Node = {
  name: 'a',
  children: [
    {
      name: 'b',
      indexPath: [0],
      children: [
        { name: 'b1', indexPath: [0, 0] },
        { name: 'b2', indexPath: [0, 1] },
      ],
    },
    {
      name: 'c',
      indexPath: [1],
      children: [
        { name: 'c1', indexPath: [1, 0] },
        { name: 'c2', indexPath: [1, 1] },
      ],
    },
  ],
  indexPath: [],
}
