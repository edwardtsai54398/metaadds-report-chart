export type OnAdSelectorChangeHandler = (val: string[]) => void
export type SelectorInAdsSelectorProps = {
  onChange: OnAdSelectorChangeHandler
  isDisabled?: boolean
}

export type AdsSelectorProps = {
  adsArray: string[]
  onChange: OnAdSelectorChangeHandler
  isDisabled?: boolean
}