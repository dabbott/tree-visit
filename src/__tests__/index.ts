import { visit, IndexPath } from '../index'
import { access, accessPath } from '../access'
import { find, findIndexPath, findAll } from '../find'
import { withOptions } from '../withOptions'
import { diagram, DiagramOptions } from '../diagram'

type Node = {
  name: string
  children?: Node[]
  indexPath: IndexPath
}

function getChildren(node: Node): Node[] {
  return node.children ?? []
}

const example: Node = {
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

it('traverses normally', () => {
  let enterNames: string[] = []
  let leaveNames: string[] = []

  visit(example, {
    onEnter: (child, indexPath) => {
      expect(indexPath).toEqual(child.indexPath)
      enterNames.push(child.name)
    },
    onLeave: (child, indexPath) => {
      expect(indexPath).toEqual(child.indexPath)
      leaveNames.push(child.name)
    },
    getChildren,
  })

  expect(enterNames).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  expect(leaveNames).toEqual(['b1', 'b2', 'b', 'c1', 'c2', 'c', 'a'])
})

it('skips in onEnter', () => {
  let enterNames: string[] = []
  let leaveNames: string[] = []

  visit(example, {
    onEnter: (child) => {
      enterNames.push(child.name)
      if (child.name === 'b') return 'skip'
    },
    onLeave: (child) => {
      leaveNames.push(child.name)
    },
    getChildren,
  })

  expect(enterNames).toEqual(['a', 'b', 'c', 'c1', 'c2'])
  expect(leaveNames).toEqual(['c1', 'c2', 'c', 'a'])
})

it('stops in onEnter', () => {
  let enterNames: string[] = []
  let leaveNames: string[] = []

  visit(example, {
    onEnter: (child) => {
      enterNames.push(child.name)
      if (child.name === 'b') return 'stop'
    },
    onLeave: (child) => {
      leaveNames.push(child.name)
    },
    getChildren,
  })

  expect(enterNames).toEqual(['a', 'b'])
  expect(leaveNames).toEqual([])
})

it('stops in onLeave', () => {
  let enterNames: string[] = []
  let leaveNames: string[] = []

  visit(example, {
    onEnter: (child) => {
      enterNames.push(child.name)
    },
    onLeave: (child) => {
      leaveNames.push(child.name)
      if (child.name === 'b') return 'stop'
    },
    getChildren,
  })

  expect(enterNames).toEqual(['a', 'b', 'b1', 'b2'])
  expect(leaveNames).toEqual(['b1', 'b2', 'b'])
})

describe('access', () => {
  it('accesses node at index path', () => {
    visit(example, {
      onEnter: (child, indexPath) => {
        const found = access(example, indexPath, { getChildren })
        expect(found.name).toEqual(child.name)
      },
      getChildren,
    })
  })

  it('accesses node path', () => {
    expect(
      accessPath(example, [0, 1], { getChildren }).map((node) => node.name)
    ).toEqual(['a', 'b', 'b2'])
  })
})

describe('find', () => {
  it('finds a node', () => {
    const node = find(example, {
      getChildren,
      predicate: (node) => node.name === 'b1',
    })

    expect(node?.name).toEqual('b1')
  })

  it('finds all nodes', () => {
    const nodes = findAll(example, {
      getChildren,
      predicate: (node) => node.name.startsWith('b'),
    })

    expect(nodes.map((node) => node.name)).toEqual(['b', 'b1', 'b2'])
  })

  it('finds a node index path', () => {
    const indexPath = findIndexPath(example, {
      getChildren,
      predicate: (node, indexPath) => indexPath.join() === [0, 1].join(),
    })

    expect(indexPath).toEqual([0, 1])
  })
})

describe('diagram', () => {
  const getLabel = (node: Node): string => node.name
  const getMultilineLabel = (node: Node): string =>
    `name: ${node.name}\npath: ${node.indexPath.join('.')}`

  it('generates folder diagram', () => {
    expect(diagram(example, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('generates folder diagram with single child case', () => {
    const singleChild: Node = {
      name: 'a',
      children: [
        {
          name: 'b',
          indexPath: [0],
          children: [{ name: 'b1', indexPath: [0, 0] }],
        },
      ],
      indexPath: [],
    }

    expect(diagram(singleChild, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('generates folder diagram with hidden root', () => {
    const singleChild: Node = {
      name: '',
      children: [
        {
          name: 'b',
          indexPath: [0],
          children: [{ name: 'b1', indexPath: [0, 0] }],
        },
      ],
      indexPath: [],
    }

    expect(diagram(singleChild, { getChildren, getLabel })).toMatchSnapshot()
  })

  it('generates folder diagram with multiline label', () => {
    expect(
      diagram(example, { getChildren, getLabel: getMultilineLabel })
    ).toMatchSnapshot()
  })

  it('generates folder diagram with multiline label and single child case', () => {
    const singleChild: Node = {
      name: 'a',
      children: [
        {
          name: 'b',
          indexPath: [0],
          children: [{ name: 'b1', indexPath: [0, 0] }],
        },
      ],
      indexPath: [],
    }

    expect(
      diagram(singleChild, { getChildren, getLabel: getMultilineLabel })
    ).toMatchSnapshot()
  })
})

describe('withOptions', () => {
  it('binds options', () => {
    const { find, access, visit } = withOptions({ getChildren })

    let enterNames: string[] = []

    visit(example, {
      onEnter: (child) => {
        enterNames.push(child.name)
      },
    })

    expect(enterNames).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])

    expect(
      find(example, {
        predicate: (node) => node.name === 'b1',
      })?.name
    ).toEqual('b1')

    expect(access(example, [0, 0]).name).toEqual('b1')
  })

  it('supports overloaded calls', () => {
    const { find, visit, diagram } = withOptions({ getChildren })

    let enterNames: string[] = []

    visit(example, (child) => {
      enterNames.push(child.name)
    })

    expect(enterNames).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])

    expect(find(example, (node) => node.name === 'b1')?.name).toEqual('b1')

    expect(diagram(example, (node) => node.name)).toMatchSnapshot()
  })
})
