import { defineTree, visit } from '..'
import { example, Node } from '../__mocks__/node'

const namesMap: Record<string, string[]> = {
  a: [],
  b: ['a'],
  b1: ['a', 'b'],
  b2: ['a', 'b'],
  c: ['a'],
  c1: ['a', 'c'],
  c2: ['a', 'c'],
}
it('visits with context', () => {
  visit(example, {
    includeTraversalContext: true,
    getChildren: (node, _, context) => {
      expect(context?.getRoot()).toEqual(example)
      expect(namesMap[node.name][namesMap[node.name].length - 1]).toEqual(
        context?.getParent()?.name
      )
      expect(namesMap[node.name]).toEqual(
        context?.getAncestors().map((node) => node.name)
      )
      return node.children ?? []
    },
  })
})

it('tree getChildren with context', () => {
  const Tree = defineTree<Node>({
    includeTraversalContext: true,
    getChildren: (node, _, context) => {
      expect(context?.getRoot()).toEqual(example)
      expect(namesMap[node.name][namesMap[node.name].length - 1]).toEqual(
        context?.getParent()?.name
      )
      expect(namesMap[node.name]).toEqual(
        context?.getAncestors().map((node) => node.name)
      )
      return node.children ?? []
    },
  })

  Tree.visit(example, {
    onEnter: (node, indexPath) => {
      // called for side effects
    },
  })

  Tree.visit(example, (node, indexPath) => {
    Tree.accessPath(example, indexPath) // called for side effects

    const found = Tree.access(example, indexPath)
    expect(found).toEqual(node)
  })
})
