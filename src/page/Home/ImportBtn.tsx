import React, {useRef, useState, useContext,useEffect} from 'react'
import { Button } from '@/components/ui/button'
import type { OnCsvLoadHandler } from '@/type/ImportBtnType'
import {AllowColumns} from '@/context/AppContext' 
import type { Column } from '@/type/AppType'
import type { AllowDateArraySet } from '@/type/DateSelectorType'


type importBtnProps = {
  setAdsNameArray: React.Dispatch<React.SetStateAction<string[]>>
  setAgeSet: React.Dispatch<React.SetStateAction<Set<string>>>
  setDateSet: React.Dispatch<React.SetStateAction<AllowDateArraySet>>
  onCsvLoad: OnCsvLoadHandler
}

const ImportBtn = ({setAdsNameArray, setAgeSet, setDateSet, onCsvLoad}: importBtnProps) => {
  const inputRenewKey = Date.now()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string>('')
  const allowColumns = useContext(AllowColumns)
  const columnFileStrMapRef = useRef<Map<string, Column>>(new Map())
  const metricKeyArrayRef = useRef<string[]>([])
  useEffect(() => {
    if(allowColumns){
      const map = new Map<string, Column>()
      const metricKeys: string[] = []
      allowColumns.forEach(col => {
        map.set(col.fileStr, col)
        if(col.isMetric){
          metricKeys.push(col.key)
        }
      })
      columnFileStrMapRef.current = map
      metricKeyArrayRef.current = metricKeys
      console.log('columnFileStrMap',columnFileStrMapRef);
      console.log('metricKeyArray',metricKeyArrayRef);
    }
  }, [allowColumns])
  
  
  // const [validDatePreriod, setValidDatePeriod] = useState<string[]>([])


  const handleImportClick = () => {
    console.log(inputRef.current);
    if(inputRef.current){
      inputRef.current.click()
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = e.nativeEvent.target as HTMLInputElement | null
    console.log('handleFileChange', eventTarget);
    if(eventTarget && eventTarget.files && eventTarget.files.length > 0){
      if(typeof eventTarget.value === 'string'){
        setFileName(eventTarget.value)
      }
      const reader = new FileReader()

      reader.onload = (loadEvent: ProgressEvent<FileReader>) => {
        const result = loadEvent.target?.result
        if(typeof result === 'string'){
          organizeCsvData(result)
          
        }
      }
      reader.readAsText(eventTarget.files[0])
    }
    
  }
  const organizeCsvData = (csvString: string) => {//時間複雜度(n: 列數, k:全部欄位數, q:metric欄位數)
    const resultArray = csvString.split('\r\n')
    const headerArray = resultArray.shift()?.split(',') //O(n)
    setAdsNameArray([])
    setAgeSet(new Set())
    setDateSet(new Set())
    console.log('CSV content:', resultArray);
    // const dateRegex = new RegExp('^20[0-9]{2}-')
    if(!headerArray){
      throw new Error('沒有解析出項目')
    }
    const allData = new Map<string, number>()
    const adValidDatesMap = new Map<string, Set<string>>()
    const hasAgeData = headerArray.includes('年齡')
    resultArray.shift()
    resultArray.forEach((row) => {
      const rowArray = row.split(',')
      let startDate = ''
      let endDate = ''
      let adName = ''
      let age = ''
      let date = ''
      for(const [j, data] of rowArray.entries()){
        const headerKey = headerArray[j]
        const metricObj = columnFileStrMapRef.current.get(headerKey)
        if(metricObj){
          switch(metricObj.key){
            case 'AD_NAME':
              adName = data
              setAdsNameArray(prev => {
                let result = prev.includes(data) ? prev : [...prev, data]
                result = result.sort((a,b) => a > b ? 1 : -1)
                return result
              })
              break
            case 'START_DATE':
              startDate = data
              break
            case 'END_DATE':
              endDate = data
              break
            case 'AGE': 
              age = data
              setAgeSet(prev => new Set(prev).add(age))
          }
        }
        if(adName !== '' && startDate !== '' && endDate !== '' && (age !== '' || !hasAgeData)) break
      }
      date = startDate === endDate ? startDate : `${startDate}~${endDate}`
      const set = adValidDatesMap.get(adName)
      if(!set){
        adValidDatesMap.set(adName, new Set([date]))
      } else {
        set.add(date)
        adValidDatesMap.set(adName, set)
      }
      setDateSet(prev => new Set(prev).add(date))
      rowArray.forEach((data:string, j) => { //O(n*k)
        const headerKey = headerArray[j]
        const metricObj = columnFileStrMapRef.current.get(headerKey)
        if(metricObj && metricObj.type === 'number' && metricObj.isMetric){
          const key = `${date}@${adName}@${metricObj.key}${hasAgeData ? `@${age}` : ''}`
          const value = Number(data)
          allData.set(key, value)
        }
      })
    })
    // console.log(allData);
    onCsvLoad({allData, adValidDatesMap})
    console.log('adValidDatesMap',adValidDatesMap);
    
  }

  return(
    <div className="flex justify-end">
      <div>
        <Button onClick={handleImportClick} style={{maxWidth: '150px'}}>
          {
            fileName !== '' ? 
              (
                <span className="grow-1 max-w-full block" style={{textOverflow: 'ellipsis'}}>{fileName.replace('C:\\fakepath\\', '')}</span>
              ) : 
              '匯入'
          }
        </Button>
        <input 
          ref={inputRef} 
          key={inputRenewKey}
          type="file" 
          name="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>
    </div>
  )
}

export default ImportBtn