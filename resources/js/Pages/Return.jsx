import InventoryLayout from "@/Layouts/InventoryLayout";

const Return = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }
  
  return (
    <AuthenticatedLayout user={auth.user}>
      <InventoryLayout user={auth.user} header={<NavHeader headerName="Return" />}>
        <div className="content">
          

        </div>
      </InventoryLayout>
    </AuthenticatedLayout>
  )
}

export default Return;