type NonSymbolPropertyKey = Exclude<PropertyKey, symbol>

export function compareIndexPaths<PK extends PropertyKey>(
  a: PK[],
  b: PK[]
): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    // If either is a symbol, ignore
    if (typeof a[i] === 'symbol' || typeof b[i] === 'symbol') continue

    if ((a[i] as NonSymbolPropertyKey) < (b[i] as NonSymbolPropertyKey))
      return -1
    if ((a[i] as NonSymbolPropertyKey) > (b[i] as NonSymbolPropertyKey))
      return 1
  }

  // If all preceding numbers are equal, the shorter array comes first
  return a.length - b.length
}

export function sortIndexPaths<PK extends PropertyKey>(
  indexPaths: PK[][]
): PK[][] {
  return indexPaths.sort(compareIndexPaths)
}
