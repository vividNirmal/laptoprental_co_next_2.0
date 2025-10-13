import AddCategory from '@/components/page/categoryModule/addCategory'
import React from 'react'

export default function page({params}) {
  return (
    <AddCategory categoryId={params.id}/>
  )
}
