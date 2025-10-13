import AddPremiumUser from '@/components/page/premiumListingModule/addPremiumUser'
import React from 'react'

export default function page({params}) {
  return (
    <AddPremiumUser premiumListingId={params.id}/>
  )
}
