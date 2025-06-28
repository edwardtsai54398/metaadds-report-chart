export type OnMetricSelectorChangeHandler = (metricKey: string, isMetricFunction: boolean) => void
export type MetricSelectorProps = {
  onChange: OnMetricSelectorChangeHandler
  isDisabled?: boolean
}