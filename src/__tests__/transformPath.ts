import { transformPath } from '../transformPath'

it('handles insert before', () => {
  const result = transformPath([1], 'insert', [0])

  expect(result).toEqual([2])
})

it('handles insert at same index', () => {
  const result = transformPath([1], 'insert', [1])

  expect(result).toEqual([2])
})

it('handles insert at ancestor', () => {
  const result = transformPath([1, 2], 'insert', [1])

  expect(result).toEqual([2, 2])
})

it('handles insert of ancestor sibling', () => {
  const result = transformPath([1, 1, 1], 'insert', [1, 0])

  expect(result).toEqual([1, 2, 1])
})

it('handles nested insert before', () => {
  const result = transformPath([0, 1], 'insert', [0, 0])

  expect(result).toEqual([0, 2])
})

it('ignores insert when the other path is longer', () => {
  const result = transformPath([0, 1], 'insert', [0, 1, 0])

  expect(result).toEqual([0, 1])
})

it('ignores insert when the other path is after', () => {
  const result = transformPath([0, 1], 'insert', [0, 2])

  expect(result).toEqual([0, 1])
})

it('ignores root insert', () => {
  const result = transformPath([], 'insert', [])

  expect(result.length).toEqual(0)

  const result2 = transformPath([], 'insert', [0])

  expect(result2.length).toEqual(0)

  const result3 = transformPath([0, 1], 'insert', [])

  expect(result3).toEqual([0, 1])
})

it('handles remove', () => {
  const result = transformPath([1], 'remove', [0])

  expect(result).toEqual([0])
})

it('handles nested remove', () => {
  const result = transformPath([0, 1], 'remove', [0, 0])

  expect(result).toEqual([0, 0])
})

it('handles remove of ancestor sibling', () => {
  const result = transformPath([1, 1, 1], 'remove', [1, 0])

  expect(result).toEqual([1, 0, 1])
})

it('ignores remove when the other path is longer', () => {
  const result = transformPath([0, 1], 'remove', [0, 1, 0])

  expect(result).toEqual([0, 1])
})

it('ignores remove when the other path is after', () => {
  const result = transformPath([0, 1], 'remove', [0, 2])

  expect(result).toEqual([0, 1])
})

it('detects removal of self', () => {
  const result = transformPath([0, 1], 'remove', [0, 1])

  expect(result).toEqual(undefined)
})

it('detects removal of ancestor', () => {
  const result = transformPath([0, 1], 'remove', [])

  expect(result).toEqual(undefined)
})

it('detects removal of root', () => {
  const result = transformPath([0, 1], 'remove', [])

  expect(result).toEqual(undefined)
})
