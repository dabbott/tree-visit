import { Node, example } from '../__mocks__/node'
import { access, accessPath } from '../access'
import { defineTree } from '../defineTree'
import { find, findAll } from '../find'
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
})

describe('keyed partially applied', () => {
  const { diagram, access, find, findAll } = defineTree({
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
})
