export interface primaryArrayElement {
  title: string,
  value: number
}

export interface machinesArrayElement {
  title: string,
  value: number,
  path: string,
}

export enum PrimaryType {
  Order = 0,
  Shift = 1,
}
