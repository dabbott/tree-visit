import {
  Node,
  createCountGetChildren,
  createNode,
  example,
  getChildren,
  getLabel,
} from '../__mocks__/node'
import { diagram } from '../diagram'
import { insert } from '../insert'
import { move } from '../move'
import { remove } from '../remove'
import { replace } from '../replace'
import { withOptions } from '../withOptions'

describe('insert', () => {
  it('inserts node at start', () => {
    const result = insert(example, {
      at: [0],
      nodes: [{ name: 'x', indexPath: [] }],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts node in middle', () => {
    const result = insert(example, {
      at: [1],
      nodes: [{ name: 'x', indexPath: [] }],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts node at end', () => {
    const result = insert(example, {
      at: [2],
      nodes: [{ name: 'x', indexPath: [] }],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts nested node', () => {
    const result = insert(example, {
      at: [1, 1],
      nodes: [{ name: 'x', indexPath: [] }],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('inserts multiple nodes', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = insert(example, {
      at: [0, 1],
      nodes: [
        { name: 'x', indexPath: [] },
        { name: 'y', indexPath: [] },
        { name: 'z', indexPath: [] },
      ],
      create: createNode,
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toEqual(2)
  })
})

describe('remove', () => {
  it('removes node at start', () => {
    const result = remove(example, {
      indexPaths: [[0]],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes node at end', () => {
    const result = remove(example, {
      indexPaths: [[1]],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes nested node', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = remove(example, {
      indexPaths: [[1, 1]],
      create: createNode,
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toEqual(2)
  })

  it('removes multiple nodes', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = remove(example, {
      indexPaths: [[1], [0, 1], [0, 0]],
      create: createNode,
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toEqual(2)
  })

  it('removes multiple nodes with common ancestor', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = remove(example, {
      indexPaths: [[0, 1], [0]],
      create: createNode,
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toEqual(1)
  })
})

describe('replace', () => {
  it('replaces root', () => {
    const result = replace(example, {
      at: [],
      node: { name: 'x', indexPath: [] },
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('replaces child', () => {
    const result = replace(example, {
      at: [1],
      node: { name: 'x', indexPath: [] },
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('replaces nested', () => {
    const result = replace(example, {
      at: [0, 1],
      node: { name: 'x', indexPath: [] },
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })
})

describe('move', () => {
  it('moves node to the same place', () => {
    const result1 = move(example, {
      indexPaths: [[0]],
      to: [0],
      create: createNode,
      getChildren,
    })

    expect(result1).toEqual(example)

    const result2 = move(example, {
      indexPaths: [[1]],
      to: [1],
      create: createNode,
      getChildren,
    })

    expect(result2).toEqual(example)
  })

  it('moves node from 1 to 0', () => {
    const { getChildrenWithCount, getCount } = createCountGetChildren()

    const result = move(example, {
      indexPaths: [[1]],
      to: [0],
      create: createNode,
      getChildren: getChildrenWithCount,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
    expect(getCount()).toEqual(2)
  })

  it('moves node from 0 to 1', () => {
    const result = move(example, {
      indexPaths: [[0]],
      to: [1],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('moves node from 0.0 to 1', () => {
    const result = move(example, {
      indexPaths: [[0, 0]],
      to: [1],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('moves node from 0.0 to 1.0', () => {
    const result = move(example, {
      indexPaths: [[0, 0]],
      to: [1, 0],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('moves node using old index', () => {
    const example: Node = {
      name: 'a',
      children: [
        {
          name: 'b',
          indexPath: [0],
        },
        {
          name: 'c',
          indexPath: [1],
        },
        {
          name: 'd',
          indexPath: [2],
        },
        {
          name: 'e',
          indexPath: [3],
        },
        {
          name: 'f',
          indexPath: [4],
        },
      ],
      indexPath: [],
    }

    const result = move(example, {
      indexPaths: [[0], [1]],
      to: [3],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('moves node to non-existent index', () => {
    const result = move(example, {
      indexPaths: [[0, 1]],
      to: [1, 7],
      create: createNode,
      getChildren,
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })
})

describe('partially applied', () => {
  const Tree = withOptions({
    getChildren,
    create: createNode,
  })

  it('inserts node', () => {
    const result = Tree.insert(example, {
      at: [1],
      nodes: [{ name: 'x', indexPath: [] }],
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('removes node', () => {
    const result = Tree.remove(example, {
      indexPaths: [[1]],
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('moves node', () => {
    const result = Tree.move(example, {
      indexPaths: [[1, 1]],
      to: [0],
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('replaces node', () => {
    const result = Tree.replace(example, {
      at: [1],
      node: { name: 'x', indexPath: [] },
    })

    expect(diagram(result, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('mutate in place', () => {
    // Clone the example mock so we can mutate it
    const clone = Tree.map<Node>(example, (node, children) => {
      return { ...node, ...(children.length > 0 && { children }) }
    })

    expect(clone).toEqual(example)

    const result = insert(clone, {
      at: [1],
      nodes: [{ name: 'x', indexPath: [] }],
      getChildren,
      create: (node: Node, children: Node[]) => {
        node.children = children
        return node
      },
    })

    expect(result).toBe(clone)
    expect(Tree.access(result, [1])).toEqual({
      name: 'x',
      indexPath: [],
    })
  })
})
