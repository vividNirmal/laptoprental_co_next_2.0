import AddChatbot from '@/components/page/chatbotsUserModule/addChatbot'
import React from 'react'

export default async function page({ params }) {
  const { id } = await params;
  return ( 
    <AddChatbot id={id}/>
  )
}
