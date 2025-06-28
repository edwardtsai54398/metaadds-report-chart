import { createContext, useContext } from "react";
import CateLabel from "@/components/ui/CateLabel";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {OnAdSelectorChangeHandler, SelectorInAdsSelectorProps, AdsSelectorProps} from '@/type/AdsSelectorType'

const OptionsContext = createContext<string[]>([])

const SingleSelector = ({onChange, isDisabled = false}: SelectorInAdsSelectorProps) => {
  const options = useContext(OptionsContext)
  const handleChange = (val: string) => {
    onChange([val])
  }
  return(
    <Select onValueChange={handleChange} disabled={isDisabled}>
      <SelectTrigger className="max-w-full">
        <SelectValue placeholder="選擇廣告" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.length > 0 ? null : (<SelectLabel>沒有廣告</SelectLabel>)}
          {options.map((o, i) => (
              <SelectItem key={i} value={o}>{o}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}


const AdsSelector = ({adsArray, onChange, isDisabled = false}: AdsSelectorProps) => {
  const handleChange: OnAdSelectorChangeHandler = (val) => {
    onChange(val)
  }
  return (
    <OptionsContext.Provider value={adsArray}>
      <CateLabel>廣告</CateLabel>
      <SingleSelector onChange={handleChange} isDisabled={isDisabled}/>
    </OptionsContext.Provider>
  )
}

export default AdsSelector