import { ancestorPaths } from '../ancestors'
import { sortPaths } from '../sort'

it('sorts index paths', () => {
  const result = sortPaths([
    [2, 1],
    [0, 0],
    [0, 1],
    [1, 0],
    [1],
    [0, 2, 0],
    [0],
  ])

  expect(result).toEqual([[0], [0, 0], [0, 1], [0, 2, 0], [1], [1, 0], [2, 1]])
})

it('sorts key paths', () => {
  const result = sortPaths([
    ['c'],
    ['b'],
    ['a', 'c'],
    ['a', 'b', 'c'],
    ['a', 'b'],
  ])

  expect(result).toEqual([
    ['a', 'b'],
    ['a', 'b', 'c'],
    ['a', 'c'],
    ['b'],
    ['c'],
  ])
})

it('gets ancestors', () => {
  const result = ancestorPaths([
    ['a', 'b', 'c'],
    ['a', 'b'],
    ['a', 'bba'],
    ['a', 'bba', 'c'],
    ['a', 'aba', 'c'],
    ['a', 'c'],
  ])

  expect(result).toEqual([
    ['a', 'aba', 'c'],
    ['a', 'b'],
    ['a', 'bba'],
    ['a', 'c'],
  ])
})
