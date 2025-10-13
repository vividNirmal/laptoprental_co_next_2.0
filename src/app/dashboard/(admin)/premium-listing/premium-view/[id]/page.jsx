import ViewPremiumDetails from '@/components/page/premiumListingModule/viewPremiumDetails'
import React from 'react'

export default function page({ params }) {
  return (
    <ViewPremiumDetails id={params.id}/>
  )
}
