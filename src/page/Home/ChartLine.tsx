import {useContext} from 'react'
import { CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {AllowColumns} from '@/context/AppContext' 
import type { ChartConfig } from '@/components/ui/chart'
import type { ChartData } from "@/type/ChartDataType"
import type { Column } from '@/type/AppType'
import dayjs from 'dayjs'

export const description = "A line chart"


const colorArray = [
  'var(--color-blue-300)',
  'var(--color-blue-500)',
]


type ChartLineProps = {
  data: ChartData
  config: ChartConfig
}

function ChartLine({config = {}, data}: ChartLineProps) {
  const allowColumns = useContext(AllowColumns)

  const getMetircLabel = (metricKey: string) => {
    const metricObj = allowColumns?.find(c => c.key === metricKey) as Column
    return metricObj.label
  }
  const calcYAxisTicksDomain = ([dataMin , dataMax]: [number, number]):[number, number] => {
    if(typeof dataMin !== 'number' || typeof dataMax !== 'number'){
      throw new Error(`calcYAxisTicksDomain: dataMin is not a number, or dataMax is not a number.`)
    }
    let max = dataMax

    if(dataMax === Infinity){
      max = 0
      data.forEach(d=>{
        Object.keys(config).forEach(c => {
          if(d[c] as number > max && d[c] !== Infinity){
            max = d[c]
            console.log('calcYAxisTicksDomain', max);
            
          }
        })
      })
      const digits = Math.floor(Math.log10(max)); // 取位數 - 1，例如1063 -> 3（千位）
      const base = 10 ** digits;                  // 10的對應位數次方，例如 1000
      max = max === 0 ? 0 : Math.ceil(max / base) * base;

    }
    return [0, Number(max.toFixed(2))]
  }
  if(data.length === 0 || Object.keys(config).length === 0)
    return (<div>Empty</div>)
  
  const metricKeys = Object.keys(config)
  let yAxisLabel = ''
  metricKeys.forEach((key, i) => {
    const metric = config[key]
    if(!('color' in metric)){
      metric.color = colorArray[i] || colorArray[0]
    }
    if(yAxisLabel === ''){
      const metricObj = allowColumns?.find(c => c.key === key) as Column
      switch(metricObj.unit){
        case 'int':
          yAxisLabel = '次數'
          break
        case 'TWD':
          yAxisLabel = 'TWD'
          break
        case 'percent':
          yAxisLabel = '%'
          break
      }
    }
  })
  
  
  return (
    <>
    <div style={{width:'80%', height: '450px'}}>
      <ChartContainer config={config} >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{
                left: 0,
                right: 12,
              }}
            >
              <CartesianGrid />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickMargin={8}
                padding={{ left: 30, right: 30 }}
                
                tickFormatter={(date: string) => dayjs(date).format('MM/DD')}
              >
              </XAxis>
              <YAxis 
                tickCount={8} 
                domain={calcYAxisTicksDomain}
                allowDecimals={false}
                padding={{ top: 30}} 
                tickLine={false} 
                label={{ value: yAxisLabel, position: 'top', offset: -10 }}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Legend formatter={getMetircLabel}/>
              {Object.keys(config).map(key => (
                <Line
                  dataKey={key}
                  key={key}
                  type="monotone"
                  stroke={config[key].color}
                  strokeWidth={2}
                  dot={{
                    stroke: config[key].color
                  }}
                  activeDot={{
                    r: 5,
                  }}
                >
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    formatter={(value: number) => value.toFixed(yAxisLabel === '%' ? 1 : 0)}
                  />
                </Line>
              ))}
              
            </LineChart>
          </ChartContainer>
    </div>
        </>
  )
}

 

export default ChartLine