import { access, accessPath, ancestors, get } from '../access'
import { defineTree } from '../defineTree'
import { diagram } from '../diagram'
import { find, findAll, findAllPaths, findPath } from '../find'
import { flat } from '../flat'
import { IndexPath, visit } from '../index'
import { flatMap, map } from '../map'
import { reduce } from '../reduce'

type Node = {
  name: string
  children?: Node[]
  indexPath: IndexPath
}

function getChildren(node: Node): Node[] {
  return node.children ?? []
}

// Create a new child object for each node to test that we're not relying on object identity
function getChildrenUnstable(node: Node): Node[] {
  return getChildren(node).map((item) => ({ ...item }))
}

const b1: Node = { name: 'b1', indexPath: [0, 0] }
const b2: Node = { name: 'b2', indexPath: [0, 1] }
const c1: Node = { name: 'c1', indexPath: [1, 0] }
const c2: Node = { name: 'c2', indexPath: [1, 1] }
const b: Node = { name: 'b', indexPath: [0], children: [b1, b2] }
const c: Node = { name: 'c', indexPath: [1], children: [c1, c2] }
const a: Node = { name: 'a', children: [b, c], indexPath: [] }
const example = a

type TypeA = Node & {
  type: 'a'
}
type TypeB = Node & {
  type: 'b'
}

// We use this union of types to check if we successfully narrow the
// type to a specific one of them using type predicates. TypeScript will
// throw an error when compiling if we try to check e.g. type === 'a' on
// an object of TypeB
type TypedExample = TypeA | TypeB

function getTypedChildren(typedNode: TypedExample): TypedExample[] {
  return getChildren(typedNode).map((item) => ({ type: 'b', ...item }))
}

const typedExample: TypedExample = {
  type: 'a',
  ...example,
}

function createNestedNode(depth: number): Node {
  let count = 0

  let root: Node = { name: `${count++}`, indexPath: [], children: [] }
  let current = root

  for (let i = 0; i < depth - 1; i++) {
    let child: Node = {
      name: `${count++}`,
      indexPath: [...current.indexPath, 0],
      children: [],
    }

    current.children?.push(child)

    current = child
  }

  return root
}

it('traverses normally', () => {
  let enterNames: string[] = []
  let leaveNames: string[] = []
  let getChildrenCount = 0

  let countGetChildren = (node: Node) => {
    getChildrenCount++
    return getChildren(node)
  }

  visit(example, {
    onEnter: (child, indexPath) => {
      expect(indexPath).toEqual(child.indexPath)
      enterNames.push(child.name)
    },
    onLeave: (child, indexPath) => {
      expect(indexPath).toEqual(child.indexPath)
      leaveNames.push(child.name)
    },
    getChildren: countGetChildren,
  })

  expect(getChildrenCount).toEqual(7)
  expect(enterNames).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  expect(leaveNames).toEqual(['b1', 'b2', 'b', 'c1', 'c2', 'c', 'a'])
})

describe('reuseIndexPath option', () => {
  it('allocates new index paths', () => {
    let indexPaths: IndexPath[] = []

    visit(example, {
      onEnter: (_child, indexPath) => {
        indexPaths.push(indexPath)
      },
      getChildren,
    })

    expect(indexPaths).toEqual([[], [0], [0, 0], [0, 1], [1], [1, 0], [1, 1]])
  })

  it('reuses index paths', () => {
    let indexPaths: IndexPath[] = []

    visit(example, {
      onEnter: (_child, indexPath) => {
        indexPaths.push(indexPath)
      },
      getChildren,
      reuseIndexPath: true,
    })

    expect(indexPaths).toEqual([[], [], [], [], [], [], []])
  })
})

it('traverses deeply nested nodes', () => {
  let enterNames: string[] = []

  const nestedNode = createNestedNode(6000)

  visit(nestedNode, {
    onEnter: (child) => {
      enterNames.push(child.name)
    },
    getChildren,
  })

  expect(enterNames.length).toEqual(6000)
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

describe('get', () => {
  it('returns node', () => {
    expect(get(example, [0, 1], { getChildren })).toEqual(b2)
  })

  it('returns undefined if node is not found', () => {
    expect(get(example, [0, 1, 0, 2], { getChildren })).toEqual(undefined)
  })
})

describe('ancestors', () => {
  it('returns ancestors', () => {
    expect(ancestors(example, [0, 1], { getChildren })).toEqual([a, b])
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

  it('finds a typed node', () => {
    const node = find<TypedExample, TypeA>(typedExample, {
      getChildren: getTypedChildren,
      predicate: (node): node is TypeA => node.type === 'a',
    })

    // This will throw a compiler error if not working correctly
    expect(node && node.type === 'a').toEqual(true)
  })

  it('finds all nodes', () => {
    const nodes = findAll(example, {
      getChildren,
      predicate: (node) => node.name.startsWith('b'),
    })

    expect(nodes.map((node) => node.name)).toEqual(['b', 'b1', 'b2'])
  })

  it('finds all typed nodes', () => {
    const nodes = findAll<TypedExample, TypeA>(typedExample, {
      getChildren: getTypedChildren,
      predicate: (node): node is TypeA => node.type === 'a',
    })

    // This will throw a compiler error if not working correctly
    expect(nodes[0].type === 'a').toEqual(true)
  })

  it('finds a node index path', () => {
    const indexPath = findPath(example, {
      getChildren,
      predicate: (node, indexPath) => indexPath.join() === [0, 1].join(),
    })

    expect(indexPath).toEqual([0, 1])
  })

  it('finds all node index paths', () => {
    const indexPaths = findAllPaths(example, {
      getChildren,
      predicate: (node) => node.name.startsWith('b'),
    })

    expect(indexPaths).toEqual([[0], [0, 0], [0, 1]])

    const nodes = indexPaths.map((indexPath) =>
      access(example, indexPath, { getChildren })
    )

    expect(nodes.map((node) => node.name)).toEqual(['b', 'b1', 'b2'])
  })
})

describe('flat', () => {
  it('flattens a tree', () => {
    const nodes = flat(example, {
      getChildren,
    })

    expect(nodes.map((node) => node.name)).toEqual([
      'a',
      'b',
      'b1',
      'b2',
      'c',
      'c1',
      'c2',
    ])
  })
})

describe('flatMap', () => {
  it('flatMaps a tree', () => {
    const x = { name: 'x' }

    const items = flatMap(example, {
      getChildren,
      transform: (node, transformedChildren, indexPath) => {
        if (node.name.includes('1')) return []

        return [
          {
            ...node,
            ...(transformedChildren.length > 0 && {
              children: transformedChildren,
            }),
          },
          x,
        ]
      },
    })

    expect(items).toEqual({
      children: [
        { children: [b2, x], indexPath: [0], name: 'b' },
        x,
        { children: [c2, x], indexPath: [1], name: 'c' },
        x,
      ],
      indexPath: [],
      name: 'a',
    })
  })
})

describe('reduce', () => {
  it('reduces a tree', () => {
    const result = reduce(example, {
      getChildren,
      initialResult: 0,
      nextResult: (result) => result + 1,
    })

    expect(result).toEqual(7)
  })
})

describe('map', () => {
  it('maps a tree', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = map(example, {
      getChildren,
      transform: (node, children) => ({
        id: node.name,
        items: children,
      }),
    })

    expect(
      flat(result, {
        getChildren: (node) => node.items,
      }).map((node) => node.id)
    ).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  })

  it('maps a tree and omits nodes', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = map(example, {
      getChildren,
      transform: (node, children) => ({
        id: node.name,
        items: children.filter(
          (child) => child.id !== 'b1' && child.id !== 'c'
        ),
      }),
    })

    expect(
      flat(result, {
        getChildren: (node) => node.items,
      }).map((node) => node.id)
    ).toEqual(['a', 'b', 'b2'])
  })

  it('maps a tree with unstable object identity', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = map(example, {
      getChildren: getChildrenUnstable,
      transform: (node, children) => ({
        id: node.name,
        items: children,
      }),
    })

    expect(
      flat(result, {
        getChildren: (node) => node.items,
      }).map((node) => node.id)
    ).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  })
})

describe('diagram', () => {
  const getLabel = (node: Node): string => node.name
  const getMultilineLabel = (node: Node): string =>
    `name: ${node.name}\npath: ${node.indexPath.join('.')}`

  it('generates folder diagram', () => {
    expect(diagram(example, { getChildren, getLabel })).toMatchSnapshot()

    expect(
      diagram(example, { getChildren, getLabel, flattenSingleChildNodes: true })
    ).toMatchSnapshot()
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

    expect(
      diagram(singleChild, {
        getChildren,
        getLabel,
        flattenSingleChildNodes: true,
      })
    ).toMatchSnapshot()
  })

  it('generates folder diagram with non-root single child case', () => {
    const singleChild: Node = {
      name: 'a',
      children: [
        {
          name: 'b',
          indexPath: [0],
          children: [{ name: 'b1', indexPath: [0, 0] }],
        },
        {
          name: 'c',
          indexPath: [1],
          children: [{ name: 'c1', indexPath: [1, 0] }],
        },
      ],
      indexPath: [],
    }

    expect(diagram(singleChild, { getChildren, getLabel })).toMatchSnapshot()

    expect(
      diagram(singleChild, {
        getChildren,
        getLabel,
        flattenSingleChildNodes: true,
      })
    ).toMatchSnapshot()
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

    expect(
      diagram(singleChild, {
        getChildren,
        getLabel,
        flattenSingleChildNodes: true,
      })
    ).toMatchSnapshot()
  })

  it('generates folder diagram with multiline label', () => {
    expect(
      diagram(example, { getChildren, getLabel: getMultilineLabel })
    ).toMatchSnapshot()

    expect(
      diagram(example, {
        getChildren,
        getLabel: getMultilineLabel,
        flattenSingleChildNodes: true,
      })
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

    expect(
      diagram(singleChild, { getChildren, getLabel: getMultilineLabel })
    ).toMatchSnapshot()
  })

  it('generates box diagram', () => {
    expect(
      diagram(example, { type: 'box', getChildren, getLabel })
    ).toMatchSnapshot()
  })

  it('generates multiline box diagram', () => {
    expect(
      diagram(example, {
        type: 'box',
        getChildren,
        getLabel: (node: Node): string =>
          node.name === 'b'
            ? `name: ${node.name}\npath: ${node.indexPath.join('.')}`
            : `name: ${node.name}`,
      })
    ).toMatchSnapshot()
  })

  it('generates uneven box diagram', () => {
    const node: Node = {
      name: 'a',
      children: [
        {
          name: 'hello',
          indexPath: [0],
        },
        {
          name: 'c',
          indexPath: [1],
        },
      ],
      indexPath: [],
    }

    expect(
      diagram(node, { type: 'box', getChildren, getLabel })
    ).toMatchSnapshot()
  })

  it('generates single child box', () => {
    const node: Node = {
      name: 'a',
      children: [
        {
          name: 'okay',
          indexPath: [0],
        },
      ],
      indexPath: [],
    }

    expect(
      diagram(node, { type: 'box', getChildren, getLabel })
    ).toMatchSnapshot()
  })
})

describe('withOptions', () => {
  it('binds options', () => {
    const { find, access, visit, reduce, flatMap, map, ...Tree } =
      defineTree(getChildren)

    expect(Tree.getChildren(example, []).map((node) => node.name)).toEqual([
      'b',
      'c',
    ])

    expect(
      Tree.getChildren(example.children![0], []).map((node) => node.name)
    ).toEqual(['b1', 'b2'])

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

    expect(Tree.get(example, [0, 0])).toEqual(b1)

    expect(Tree.ancestors(example, [0, 0])).toEqual([a, b])

    expect(
      reduce(
        example,
        (result, node) => (result ? result + ' ' + node.name : node.name),
        ''
      )
    ).toEqual('a b b1 b2 c c1 c2')

    const x = { name: 'x' }

    const items = flatMap(example, (node, transformedChildren, indexPath) => {
      if (node.name.includes('1')) return []

      return [
        {
          ...node,
          ...(transformedChildren.length > 0 && {
            children: transformedChildren,
          }),
        },
        x,
      ]
    })

    expect(items).toEqual({
      children: [
        { children: [b2, x], indexPath: [0], name: 'b' },
        x,
        { children: [c2, x], indexPath: [1], name: 'c' },
        x,
      ],
      indexPath: [],
      name: 'a',
    })

    expect(
      map<{ id: string }>(example, (node, transformedChildren) => ({
        id: `${node.name}:${transformedChildren.length}`,
      })).id
    ).toEqual('a:2')
  })

  it('supports typed finding', () => {
    const { find, findAll } = defineTree(getTypedChildren)

    expect(
      find<TypeA>(typedExample, {
        predicate: (node): node is TypeA => node.type === 'a',
      })?.type === 'a'
    ).toEqual(true)

    expect(
      findAll<TypeA>(typedExample, {
        predicate: (node): node is TypeA => node.type === 'a',
      })[0]?.type === 'a'
    ).toEqual(true)
  })

  it('supports overloaded calls', () => {
    const {
      find,
      findAllPaths: findAllIndexPaths,
      visit,
      diagram,
      flat,
    } = defineTree(getChildren)

    let enterNames: string[] = []

    visit(example, (child) => {
      enterNames.push(child.name)
    })

    expect(enterNames).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])

    expect(flat(example).map((node) => node.name)).toEqual([
      'a',
      'b',
      'b1',
      'b2',
      'c',
      'c1',
      'c2',
    ])

    expect(find(example, (node) => node.name === 'b1')?.name).toEqual('b1')

    expect(
      findAllIndexPaths(example, (node) => node.name.startsWith('b'))
    ).toEqual([[0], [0, 0], [0, 1]])

    expect(diagram(example, (node) => node.name)).toMatchSnapshot()

    expect(
      diagram(example, {
        getLabel: (node) => node.name,
      })
    ).toMatchSnapshot()
  })

  it('type checks', () => {
    const Tree = defineTree(getChildren)
    const TreeWithOptions = Tree.withOptions({ getLabel: (node) => node.name })

    expect(() => {
      // @ts-expect-error
      Tree.diagram(example)
    }).toThrow()

    expect(() => {
      // @ts-expect-error
      Tree.diagram(example, {})
    }).toThrow()

    TreeWithOptions.diagram(example)
    TreeWithOptions.diagram(example, {})
    TreeWithOptions.diagram(example, (node) => node.name)
  })
})
