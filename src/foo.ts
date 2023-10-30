export type IndexPath = number[]
export type KeyPath = string[]

// Define separate option types for each function including the path parameter
type GetEntriesOptions<T> = {
  getEntries: (node: T, keyPath: KeyPath) => T[]
  keyPath: KeyPath
}

type GetChildrenOptions<T> = {
  getChildren: (node: T, indexPath: IndexPath) => T[]
  indexPath: IndexPath
}

// Define a type that requires one of the two options
type EitherOptions<T> = GetEntriesOptions<T> | GetChildrenOptions<T>

function getChildrenUtility<T>(node: T, options: EitherOptions<T>): T[] {
  if ('getEntries' in options) {
    // If so, use the getEntries function to get the children
    return options.getEntries(node, options.keyPath) // Use the provided keyPath
  } else if ('getChildren' in options) {
    // If getChildren is available, use it to get the children
    return options.getChildren(node, options.indexPath) // Use the provided indexPath
  } else {
    // If neither option is available, throw an error or return an empty array
    throw new Error('No valid option provided to get children')
  }
}
