import { defineTree } from '..'

describe('cycle detection', () => {
  type N = {
    name: string
    parent: N | undefined
  }

  it('traverses acyclic structures', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    const c: N = { name: 'c', parent: a }
    const nodes: N[] = [a, b, c]

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      onDetectCycle: 'error',
    })

    // Should complete without throwing
    expect(() => Tree.flat(a)).not.toThrow()
    expect(Tree.flat(a)).toEqual([a, b, c])
  })

  it('detects simple cycles', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    // Create cycle: a -> b -> a
    a.parent = b

    const nodes: N[] = [a, b]

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      onDetectCycle: 'error',
    })

    expect(() => Tree.flat(a)).toThrow('Cycle detected in tree')
  })

  it('uses custom identifier function', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    // Create cycle: a -> b -> a
    a.parent = b

    const nodes: N[] = [a, b]

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      onDetectCycle: 'error',
      getIdentifier: (node) => node.name,
    })

    expect(() => Tree.flat(a)).toThrow('Cycle detected in tree')
  })

  it('allows duplicate nodes when cycle detection is disabled', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    // Create cycle: a -> b -> a
    a.parent = b

    const nodes: N[] = [a, b]

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      // detectCycles defaults to false
    })

    // This would normally throw with cycle detection enabled
    expect(() => {
      let count = 0
      Tree.visit(a, {
        onEnter: () => {
          // Stop after a few iterations to prevent infinite loop
          if (count++ > 5) return 'stop'
        },
      })
    }).not.toThrow()
  })

  it('can visit same node twice in different paths when not cyclic', () => {
    type Node = {
      name: string
      children?: Node[]
      indexPath: number[]
    }

    // Create a diamond-shaped structure:
    //      a
    //    /   \
    //   b     c
    //    \   /
    //      d
    const d: Node = { name: 'd', children: [], indexPath: [] }
    const b: Node = { name: 'b', children: [d], indexPath: [] }
    const c: Node = { name: 'c', children: [d], indexPath: [] }
    const a: Node = { name: 'a', children: [b, c], indexPath: [] }

    const Tree = defineTree<Node>({
      getChildren: (node) => node.children ?? [],
      onDetectCycle: 'error',
    })

    const visited: string[] = []

    // Should complete without throwing, even though d is visited twice
    expect(() => {
      Tree.visit(a, {
        onEnter: (node, indexPath) => {
          visited.push(`${node.name}:${indexPath.join(',')}`)
        },
      })
    }).not.toThrow()

    // Verify d is visited through both paths
    expect(visited).toEqual(['a:', 'b:0', 'd:0,0', 'c:1', 'd:1,0'])
  })

  it('can skip cycles when configured', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    // Create cycle: a -> b -> a
    a.parent = b

    const nodes: N[] = [a, b]
    const visited: string[] = []

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      onDetectCycle: 'skip',
    })

    // Should complete without throwing
    Tree.visit(a, {
      onEnter: (node) => {
        visited.push(node.name)
      },
    })

    // Should visit a and b, but skip the cyclic visit back to a
    expect(visited).toEqual(['a', 'b'])
  })

  it('supports custom cycle handling', () => {
    const a: N = { name: 'a', parent: undefined }
    const b: N = { name: 'b', parent: a }
    // Create cycle: a -> b -> a
    a.parent = b

    const nodes: N[] = [a, b]
    const cycleNodes: string[] = []

    const Tree = defineTree<N>({
      getChildren: (node) => nodes.filter((n) => n.parent === node),
      onDetectCycle: (node, indexPath) => {
        cycleNodes.push(`${node.name}:${indexPath.join(',')}`)
        return 'skip'
      },
    })

    const visited: string[] = []
    Tree.visit(a, {
      onEnter: (node) => {
        visited.push(node.name)
      },
    })

    // Should visit a and b, but detect cycle at second a
    expect(visited).toEqual(['a', 'b'])
    // Should record the cycle node with its path
    expect(cycleNodes).toEqual(['a:0,0'])
  })
})
