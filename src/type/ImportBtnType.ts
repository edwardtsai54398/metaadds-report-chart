import type {AllowDateArraySet} from './DateSelectorType'
export type AllDataMap = Map<string, number>

export type AdValidDatesMap = Map<string, AllowDateArraySet>

export type OnCsvLoadHandler = ({allData, adValidDatesMap}: {allData: AllDataMap, adValidDatesMap: AdValidDatesMap}) => void