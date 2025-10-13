import AddFeaturedListing from '@/components/page/featuredListingModule/addFeaturedListing'
import React from 'react'

export default function page({ params }) {
  return (
    <AddFeaturedListing id={params.id}/>
  )
}
