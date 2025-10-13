import AddStatePage from '@/components/page/stateModule/addState'
import React from 'react'

export default function page({ params }) {
  return <AddStatePage stateId={params.id} />
}
