import AddCountryPage from '@/components/page/countryModule/addCountry'
import React from 'react'

export default function page({ params }) {
  return <AddCountryPage countryId={params.id} />
}
