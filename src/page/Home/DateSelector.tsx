import {useState, useEffect} from 'react'
import { DateRangePicker } from 'rsuite';
import type { DateRange, DisabledDateFunction } from 'rsuite/esm/DateRangePicker';
import 'rsuite/DatePicker/styles/index.css'
import CateLabel from "@/components/ui/CateLabel";
import type { AllowDateArraySet, DateSelectorChangeHandler } from '@/type/DateSelectorType'

type DateSelectorProps = {
  allowDateArray: AllowDateArraySet
  isDisabled?: boolean
  onChange: DateSelectorChangeHandler
}


const DateSelector = ({allowDateArray = new Set(), isDisabled = false, onChange}: DateSelectorProps) => {
  const dateFormat = 'yyyy-MM-dd'
  const [selectedDateRange, setDateRange] = useState<DateRange | null>(null)
  const handleDatePickerChange = (val: DateRange | null) => {
    console.log('handleDatePickerChange', val);
    setDateRange(val)
    if(!val?.length) return
    const sortedDateArray = Array.from(allowDateArray).sort()
    const startDate = val[0].toLocaleDateString('en-CA', {
      timeZone: 'Asia/Taipei'
    })
    const endDate = val[1].toLocaleDateString('en-CA', {
      timeZone: 'Asia/Taipei'
    })
    console.log('start', startDate);
    console.log('end', endDate);
    console.log(sortedDateArray);
    
    
    const startIndex = sortedDateArray.indexOf(startDate)
    const endIndex = sortedDateArray.indexOf(endDate)
    if(startIndex === -1 || endIndex === -1) return
    const selectedDateArray = sortedDateArray.slice(startIndex, endIndex + 1)
    onChange(selectedDateArray)
  }
  const disabledDateFunc: DisabledDateFunction = (date) => {
    const taipeiDate = date.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Taipei' // 指定時區為台北
    })
    
    return !allowDateArray.has(taipeiDate)
  }
  useEffect(() => {
    if(allowDateArray.size > 0){
      const sortedDateArray = Array.from(allowDateArray).sort()
      const allowStartDate = new Date(sortedDateArray[0])
      const allowEndDate = new Date(sortedDateArray[sortedDateArray.length - 1])
      setDateRange([allowStartDate, allowEndDate])
    }
  }, [allowDateArray])
  return (
    <>
    <CateLabel>期間</CateLabel>
    <DateRangePicker 
      showOneCalendar 
      showHeader={false}
      ranges={[]}
      editable={false} 
      weekStart={0} 
      format={dateFormat} 
      placeholder={'選擇期間'} 
      value={selectedDateRange}
      disabled={isDisabled || allowDateArray.size === 0}
      onChange={handleDatePickerChange}
      shouldDisableDate={disabledDateFunc}
    />
    </>
  )
}

export default DateSelector