import { Node, example } from '../__mocks__/node'
import { access, accessPath } from '../access'
import { defineTree } from '../defineTree'
import { find, findAll, findAllIndexPaths, findIndexPath } from '../find'
import { flat } from '../flat'
import { flatMap } from '../flatMap'
import { map, mapEntries } from '../map'
import { reduce } from '../reduce'
import { visit } from '../visit'

const getEntries = (node: Node) =>
  (node.children || []).map((n): [string, Node] => [n.name, n])

describe('keyed access', () => {
  it('accesses by key', () => {
    expect(
      access(example, {
        getEntries,
        path: ['b', 'b2'],
      }).name
    ).toEqual('b2')
  })

  it('accesses path by key', () => {
    expect(
      accessPath(example, {
        getEntries,
        path: ['b', 'b2'],
      }).map((n) => n.name)
    ).toEqual(['a', 'b', 'b2'])
  })

  it('visits by key', () => {
    const result: string[] = []

    visit(example, {
      getEntries,
      onEnter(node) {
        result.push(node.name)
      },
    })

    expect(result).toEqual(['a', 'b', 'b1', 'b2', 'c', 'c1', 'c2'])
  })

  it('finds by key', () => {
    expect(
      find(example, {
        getEntries,
        predicate: (node) => node.name === 'b2',
      })?.name
    ).toEqual('b2')
  })

  it('finds all by key', () => {
    expect(
      findAll(example, {
        getEntries,
        predicate: (node) => node.name.startsWith('b'),
      }).map((n) => n.name)
    ).toEqual(['b', 'b1', 'b2'])
  })

  it('finds index path by key', () => {
    expect(
      findIndexPath(example, {
        getEntries,
        predicate: (node) => node.name === 'b2',
      })
    ).toEqual(['b', 'b2'])
  })

  it('finds all index paths by key', () => {
    expect(
      findAllIndexPaths(example, {
        getEntries,
        predicate: (node) => node.name.startsWith('b'),
      })
    ).toEqual([['b'], ['b', 'b1'], ['b', 'b2']])
  })

  it('flattens', () => {
    expect(flat(example, { getEntries }).map((n) => n.name)).toEqual([
      'a',
      'b',
      'b1',
      'b2',
      'c',
      'c1',
      'c2',
    ])
  })

  it('flatmaps', () => {
    expect(
      flatMap(example, {
        getEntries,
        transform: (node) => (node.name.startsWith('b') ? [node.name] : []),
      })
    ).toEqual(['b', 'b1', 'b2'])
  })

  it('reduces', () => {
    expect(
      reduce(example, {
        getEntries,
        nextResult: (result, node) => result + node.name + '|',
        initialResult: '|',
      })
    ).toEqual('|a|b|b1|b2|c|c1|c2|')
  })

  it('maps', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = map(example, {
      getEntries,
      transform: (node, transformedEntries) => ({
        id: node.name + '*',
        items: transformedEntries,
      }),
    })

    expect(
      flatMap(result, {
        getChildren: (node) => node.items,
        transform: (n) => [n.id],
      })
    ).toEqual(['a*', 'b*', 'b1*', 'b2*', 'c*', 'c1*', 'c2*'])
  })

  it('maps entries', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = mapEntries(example, {
      getEntries,
      transform: (node, transformedEntries) => ({
        id: node.name + '*',
        items: transformedEntries.map(([key, node]) => node),
      }),
    })

    expect(
      flatMap(result, {
        getChildren: (node) => node.items,
        transform: (n) => [n.id],
      })
    ).toEqual(['a*', 'b*', 'b1*', 'b2*', 'c*', 'c1*', 'c2*'])
  })
})

describe('keyed partially applied', () => {
  const {
    diagram,
    access,
    find,
    findAll,
    findIndexPath,
    findAllIndexPaths,
    flat,
    flatMap,
    reduce,
    map,
  } = defineTree({
    getEntries,
  }).withOptions({
    getLabel: (node, keyPath) =>
      node.name + ': ' + [example.name, ...keyPath].join('/'),
  })

  it('renders diagram', () => {
    expect(diagram(example)).toMatchSnapshot()
  })

  it('accesses', () => {
    expect(access(example, ['b', 'b2']).name).toEqual('b2')
  })

  it('finds', () => {
    expect(find(example, (node) => node.name === 'b2')?.name).toEqual('b2')

    expect(
      find(example, {
        predicate: (node) => node.name === 'b2',
      })?.name
    ).toEqual('b2')
  })

  it('finds all', () => {
    expect(
      findAll(example, (node) => node.name.startsWith('b')).map((n) => n.name)
    ).toEqual(['b', 'b1', 'b2'])

    expect(
      findAll(example, {
        predicate: (node) => node.name.startsWith('b'),
      }).map((n) => n.name)
    ).toEqual(['b', 'b1', 'b2'])
  })

  it('finds index path', () => {
    expect(findIndexPath(example, (node) => node.name === 'b2')).toEqual([
      'b',
      'b2',
    ])

    expect(
      findIndexPath(example, {
        predicate: (node) => node.name === 'b2',
      })
    ).toEqual(['b', 'b2'])
  })

  it('finds all index paths', () => {
    expect(
      findAllIndexPaths(example, (node) => node.name.startsWith('b'))
    ).toEqual([['b'], ['b', 'b1'], ['b', 'b2']])

    expect(
      findAllIndexPaths(example, {
        predicate: (node) => node.name.startsWith('b'),
      })
    ).toEqual([['b'], ['b', 'b1'], ['b', 'b2']])
  })

  it('flattens', () => {
    expect(flat(example).map((n) => n.name)).toEqual([
      'a',
      'b',
      'b1',
      'b2',
      'c',
      'c1',
      'c2',
    ])
  })

  it('flatmaps', () => {
    expect(
      flatMap(example, (node) => (node.name.startsWith('b') ? [node.name] : []))
    ).toEqual(['b', 'b1', 'b2'])
  })

  it('reduces', () => {
    expect(
      reduce(example, (result, node) => result + node.name + '|', '|')
    ).toEqual('|a|b|b1|b2|c|c1|c2|')
  })

  it('maps', () => {
    type ResultNode = { id: string; items: ResultNode[] }

    const result: ResultNode = map(example, (node, transformedEntries) => ({
      id: node.name + '*',
      items: transformedEntries,
    }))

    expect(
      defineTree({ getChildren: (node: ResultNode) => node.items }).flatMap(
        result,
        (n) => [n.id]
      )
    ).toEqual(['a*', 'b*', 'b1*', 'b2*', 'c*', 'c1*', 'c2*'])
  })
})
