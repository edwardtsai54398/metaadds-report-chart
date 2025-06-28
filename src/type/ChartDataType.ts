export type ChartDataRow = {
  date: string
} & {
  [K in Exclude<string, 'date'>]: number
}
export type ChartData = ChartDataRow[]