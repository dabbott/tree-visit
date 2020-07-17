import { IndexPath } from './indexPath'

export type BaseOptions<T> = {
  getChildren: (node: T, indexPath: IndexPath) => T[]
}
