import { useContext } from "react";
import { AllowColumns } from '@/context/AppContext' 
import CateLabel from "@/components/ui/CateLabel";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MetricSelectorProps } from '@/type/MetricSelectorType'



const MetricSelector = ({onChange, isDisabled = false}: MetricSelectorProps) => {
  const allowColumns = useContext(AllowColumns)
  const handleChange = (val: string) => {
    const selectedMetric = allowColumns!.find(c => c.key === val)
    if(selectedMetric){
      onChange(val, selectedMetric.isFunction)
    } else {
      throw new Error(`Cannot find metric "${val}" in allowColumns`)
    }
    
  }
  return (
    <>
      <CateLabel>指標</CateLabel>
      <Select onValueChange={handleChange} disabled={isDisabled}>
        <SelectTrigger className="max-w-full">
          <SelectValue placeholder="選擇指標" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allowColumns && allowColumns.filter(c => c.isMetric)
            .map(c => (
              <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}
export default MetricSelector