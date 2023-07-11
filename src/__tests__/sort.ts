import { sortIndexPaths } from '../sort'

it('sorts index paths', () => {
  const result = sortIndexPaths([
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
