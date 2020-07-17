import { visit, IndexPath } from '../index'

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
