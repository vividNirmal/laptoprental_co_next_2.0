import AddAdminUser from '@/components/page/AdminUser/AddAdminUser'

export default function page({params}) {
  return (
    <AddAdminUser adminId={params.id}/>
  )
}
