import {useState, useEffect, useRef} from 'react'
import './App.css'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import ModeSelector from './page/Home/ModeSelector'
import type { AllDataMap, OnCsvLoadHandler, AdValidDatesMap } from '@/type/ImportBtnType'
import type { OnAdSelectorChangeHandler } from './type/AdsSelectorType'
import type { Column } from './type/AppType'
import type { OnMetricSelectorChangeHandler } from './type/MetricSelectorType'
import type {AllowDateArraySet, DateSelectorChangeHandler, DateSelectorChangeEvent} from './type/DateSelectorType'
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartData, ChartDataRow } from '@/type/ChartDataType'
import ImportBtn from './page/Home/ImportBtn'
import AdsSelector from './page/Home/AdsSelector'
import {AllowColumns} from './context/AppContext'
import { Button } from './components/ui/button'
import MetricSelector from './page/Home/MetricSelector'
import DateSelector from './page/Home/DateSelector'
import ChartLine from './page/Home/ChartLine'
import dayjs from 'dayjs'

type GetMetricSumFunc = (allDataMap: AllDataMap, adName: string, metricKey: string, dateArray: string[], ageArray: string[]) => number
type GetFunctionMetricSumFunc = (allDataMap: AllDataMap, adName: string, dateArray: string[], ageArray: string[]) => number

const generateMetricCalcFunc = (args: string[], returnString: string): GetFunctionMetricSumFunc => {
  return (allDataMap, adName, dateArray, ageArray = []) => {
    const valueMap: Record<string, number> = {}
    let newReturnString = returnString
    args.forEach((arg)=> {
      valueMap[arg] = getMetricSum(allDataMap, adName, arg, dateArray, ageArray)
      newReturnString = newReturnString.replaceAll(arg, valueMap[arg].toString())
      if(returnString === '(TOTAL_COST / CART_COUNT)'){
        console.log(arg, valueMap[arg], newReturnString);
      }
    })
    return new Function(`return ${newReturnString};`)()
    // return `return ${newReturnString}`
  }
}

const getMetricSum: GetMetricSumFunc = (allDataMap, adName, metricKey, dateArray, ageArray = []) => {
  let sum = 0
  if(dateArray.length > 0){
    const increaseValue = (key: string) => {
      
      if(allDataMap.has(key)){
        // console.log(`${key} => ${allDataMap.get(key)}`);
        sum += allDataMap.get(key)!
      } else{
        console.error(`${key} NOT FOUND`);
      }
    }
    dateArray.forEach(date => {
      const key = `${date}@${adName}@${metricKey}`
      if(ageArray.length > 0){
        ageArray.forEach(age => {
          increaseValue(key + `@${age}`)
        })
      } else {
        increaseValue(key)
      }
    })
  }

  return sum
}

const getROASSum: GetMetricSumFunc = (allDataMap, adName, metricKey = 'ROAS', dateArray, ageArray = []) => {
  if(metricKey !== 'ROAS'){
    throw new Error('getROASSum can only support merticKey: ROAS.')
  }
  let pricePerBuy: number | null = null
  let totalIncome = 0
  const totalCost = getMetricSum(allDataMap, adName, 'TOTAL_COST', dateArray, ageArray)
  
  for(const date of dateArray){
    if(typeof pricePerBuy === 'number') break
    const baseKey = `${date}@${adName}`
    const findPricePerBuy = (age: string | undefined = undefined) => {
      const dataROAS = allDataMap.get(`${baseKey}@ROAS${age ? `@${age}` : ''}`)!
        const cost = allDataMap.get(`${baseKey}@TOTAL_COST${age ? `@${age}` : ''}`)!
        const income = (dataROAS / 100) * cost
        if(income > 0){
          pricePerBuy = income / allDataMap.get(`${baseKey}@BUY_COUNT${age ? `@${age}` : ''}`)!
        }
    }
    if(ageArray.length > 0){
      for(const age of ageArray){
        if(typeof pricePerBuy === 'number') break
        findPricePerBuy(age)
      }
    } else {
      findPricePerBuy()
    }
  }
  if(pricePerBuy === null) return 0
  console.log(`${adName} pricePerBuy: ${pricePerBuy}`);
  
  
  dateArray.forEach(date => {
    const key = `${date}@${adName}@BUY_COUNT`
    const increaseIncome = (age: string |undefined = undefined) => {
      const finalKey = `${key}${age ? `@${age}` : ''}`
      totalIncome += (pricePerBuy as number * (allDataMap.has(finalKey) ? allDataMap.get(finalKey) : 0)!)
    }
    if(ageArray.length > 0){
      ageArray.forEach(age => {
        increaseIncome(age)
      })
    } else {
      increaseIncome()
    }
  })
  return (totalIncome / totalCost) * 100
}

const isMetricColumn = (obj: Record<string, string | boolean | object>) => {
  return (
    typeof obj === 'object' &&
    typeof obj.fileStr === 'string' &&
    typeof obj.label === 'string' &&
    typeof obj.key === 'string' &&
    (obj.type === 'string' || obj.type === 'number') &&
    typeof obj.type === 'string' &&
    typeof obj.isFunction === 'boolean' &&
    typeof obj.isMetric === 'boolean' 
  )
}

function App() {
  //總資料
  const [allDataMap, setAllDataMap] = useState<AllDataMap>(new Map([]))
  //可選擇的值
  const [adsNameArray, setAdsNameArray] = useState<string[]>([])
  const [allowColumns, setAllowColumns] = useState<Column[] | null>(null)
  const [ageSet, setAgeSet] = useState<Set<string>>(new Set())
  const [dateSet, setDateSet] = useState<AllowDateArraySet>(new Set())
  const [adValidDatesMap, setAdValidDatesMap] = useState<AdValidDatesMap>(new Map())
  //某些需要計算的 metric 的函式，如CTR、CVR
  const metricFuncMapNeedToCalcRef = useRef<Map<string, GetFunctionMetricSumFunc>>(new Map())
  //選擇的值
  const [selectedDateArray, setSeletedDate] = useState<DateSelectorChangeEvent>([])
  const [selectedAd, setSelectedAd] = useState<string>('')
  const [selectedMetric, setSelectedMetric] = useState<string>('')
  //圖表資料
  const [chartData, setChartData] = useState<ChartData>([])
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})
  
  //取得固定已知的 csv 欄位
  useEffect(() => {
    if(!allowColumns){
      fetch('/public/columns.json')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setAllowColumns(data.columns)
        //建立需要計算的指標的 function
        const metricCalcMap = new Map<string, GetFunctionMetricSumFunc>()
        data.columns.forEach(col => {
          if(!isMetricColumn(col)) return
          const column = col as Column
          if(!column.isMetric) return
          if(column.isFunction && column.function?.args && column.function?.return){
            metricCalcMap.set(column.key, generateMetricCalcFunc(column.function.args, column.function.return))
          }

        })
        console.log('metricCalcMap', metricCalcMap);
        
        metricFuncMapNeedToCalcRef.current = metricCalcMap
      })
    }
  }, [allowColumns])
  const handleCsvLoaded: OnCsvLoadHandler = ({allData, adValidDatesMap}) => {
    console.log('handleCsvLoaded', allData);
    setAllDataMap(allData)
    setAdValidDatesMap(adValidDatesMap)
  }
  const handleDateSelectorChange: DateSelectorChangeHandler = (dateArray) => {
    console.log('handleDateSelectorChange', dateArray);
    
    setSeletedDate(dateArray)
  }
  const handleAdsSelectorChange: OnAdSelectorChangeHandler = (ads) => {
    console.log('handleAdsSelectorChange', ads);
    if(ads.length === 1){
      setSelectedAd(ads[0])
      const validDates = adValidDatesMap.get(ads[0])
      if(validDates){
        setDateSet(validDates)
        setSeletedDate(Array.from(validDates).sort())
      }
    }
    if(selectedMetric === '') return
    const selectedColumn = allowColumns!.find(c => c.key === selectedMetric)
    if(selectedColumn){
      const isMetricFunction = selectedColumn.isFunction
      if(!isMetricFunction){
        console.log(getMetricSum(allDataMap, ads[0], selectedMetric, selectedDateArray, Array.from(ageSet)));
      }
    }
  }
  const handleMetricChange: OnMetricSelectorChangeHandler = (metricKey, isMetricFunction) => {
    setSelectedMetric(metricKey)
    //以下為開發試算
    if(selectedAd === '') return
    const date = ['2025-05-11']
    const ages = Array.from(ageSet)
    if(!isMetricFunction){
      console.log(getMetricSum(allDataMap, selectedAd, metricKey, date, ages));
    } else  {
      const getSum = metricFuncMapNeedToCalcRef.current.get(metricKey)
      
      if(!getSum) return
      
      console.log(getSum(allDataMap, selectedAd, date, ages));
    }
  }
  const generateChart = () => {
    const data: ChartData = []
    const config: ChartConfig = {}
    selectedDateArray.forEach(date => {
      let value = 0
      if(selectedMetric === 'ROAS'){
        console.log(getROASSum(allDataMap, selectedAd, 'ROAS', [date], Array.from(ageSet)));
      
        value = getROASSum(allDataMap, selectedAd, 'ROAS', [date], Array.from(ageSet))
      } else if(metricFuncMapNeedToCalcRef.current.has(selectedMetric)){
        //該指標是需要計算的
        const getSumFunc = metricFuncMapNeedToCalcRef.current.get(selectedMetric)!
        value = getSumFunc(allDataMap, selectedAd, [date], Array.from(ageSet))
        if(value === Infinity){
          console.log(`${selectedMetric} of ${selectedAd}(${date}) is Infinity`);
        }
      } else {
        value = getMetricSum(allDataMap, selectedAd, selectedMetric, [date], Array.from(ageSet))
      }
      if(isNaN(value)) {
        console.error(`${date}@${selectedAd} value is NaN`);
        return
      }
      data.push({
        date,
        [selectedMetric]: value
      } as ChartDataRow)
    })
    config[selectedMetric] = {
      label: allowColumns!.find(c => c.key === selectedMetric)!.label,
    }
    console.log('generateChart', data, config);
    
    setChartData(data)
    setChartConfig(config)
  }
  
  return (
    <AllowColumns.Provider value={allowColumns}>
      <ResizablePanelGroup
        direction="horizontal"
        className="rounded-lg md:min-w-[450px]"
      >
        <ResizablePanel defaultSize={30} maxSize={40}>
          <div className="h-screen p-6 flex flex-col">
            <ImportBtn setAdsNameArray={setAdsNameArray} setAgeSet={setAgeSet} setDateSet={setDateSet} onCsvLoad={handleCsvLoaded}/>
            <div className="mb-6">
              <ModeSelector />
            </div>
            <div className="mb-6">
              <DateSelector allowDateArray={dateSet} onChange={handleDateSelectorChange}/>
            </div>
            <div className="mb-6">
              <AdsSelector adsArray={adsNameArray} onChange={handleAdsSelectorChange} isDisabled={allDataMap.size === 0}/>
            </div>
            {allowColumns?.length && (
              <div className="mb-6">
                <MetricSelector onChange={handleMetricChange} isDisabled={allDataMap.size === 0}/>
              </div>
            )}
            {ageSet.size > 0 && (
              <div className="mb-6">
                {/* has age */}
              </div>
            )}
            <div className="mt-auto flex justify-end">
              <Button onClick={generateChart}>生成圖表</Button>
            </div>
            
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={70}>
              <div className="flex flex-col h-full items-center justify-center p-6">
                {chartData.length && Object.keys(chartConfig).length ? (
                  <div className="mb-5 font-md">
                    <span className="font-bold">{selectedAd} </span>
                    ({dayjs(chartData[0].date).format('MM/DD')} ~ {dayjs(chartData[chartData.length - 1].date).format('MM/DD')})
                    </div>
                ) : null}
                <ChartLine data={chartData} config={chartConfig}/>
              </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </AllowColumns.Provider>
  )
}

export default App
