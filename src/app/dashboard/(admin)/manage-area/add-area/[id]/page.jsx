import AddAreaPage from '@/components/page/areaModule/addArea'
import React from 'react'

export default function page({params}) {
  return (
    <AddAreaPage areaId={params.id} />
  )
}
