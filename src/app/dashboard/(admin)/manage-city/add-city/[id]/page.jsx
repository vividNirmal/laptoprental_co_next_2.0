import AddCityPage from '@/components/page/cityModule/addCity'
import React from 'react'

export default function page({params}) {
  return (
    <AddCityPage cityId={params.id}/>
  )
}
