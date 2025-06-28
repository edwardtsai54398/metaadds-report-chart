import type { AllDataMap } from "./ImportBtnType"
export type Column = {
        fileStr: string
        label: string
        key: string
        type: 'number' | 'string'
        unit: 'int' | 'percent' | 'TWD'
        isFunction: boolean
        isMetric: boolean
        function: {
          args: string[]
          return: string
        } | null
      }

export type MetricFunc = (dataMap: AllDataMap, adName: string, dateArray: string[] | 'all', ageArray: string[] | 'all') => number