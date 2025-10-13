import AddListingPage from '@/components/page/listingModule/addListing'
import React from 'react'

export default function page({ params }) {
  return (
    <AddListingPage listingId={params.id}/>
  )
}
