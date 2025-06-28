import {createContext} from 'react'
import type { Column } from '@/type/AppType'

export const AllowColumns = createContext<Column[] | null>(null)