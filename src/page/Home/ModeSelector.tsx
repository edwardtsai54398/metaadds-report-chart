import {useState} from 'react'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import CateLabel from '@/components/ui/CateLabel'
import type {ModeSelectorProps, ModeValue} from '@/type/ModeSelectorType'

function ModeSelector({onValueChange}:ModeSelectorProps) {
  const [value, setValue] = useState<ModeValue>('multi-metric@one-ad')
  const handleValueChange = (val:ModeValue) => {
    onValueChange(val)
    setValue(val)
  }
  return(
    <>
      <CateLabel>模式</CateLabel>
      <RadioGroup defaultValue="time" value={value} onValueChange={handleValueChange} className="flex">
          <div className="flex items-center me-10">
            <RadioGroupItem value="multi-metric@one-ad" id="multi-metric@one-ad" className="me-3" />
            <Label htmlFor="multi-metric@one-ad">我要看一個廣告中的多個指標</Label>
          </div>
      </RadioGroup>
    </>
    
  )

}
export default ModeSelector