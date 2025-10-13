import AddJobCategory from '@/components/page/JobCategoryModule/addJobCategory'
import React from 'react'

export default function page({params}) {
  return (
    <AddJobCategory categoryId={params.id}/>
  )
}
