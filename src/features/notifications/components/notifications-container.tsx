import { EntityContainer } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"

export function NotificationsContainer({
  toolbar,
  pagination,
  children,
}: {
  toolbar: React.ReactNode
  pagination?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <EntityContainer
      header={
        <PageHeader
          title="Email & thông báo"
          description="Theo dõi trạng thái gửi và đưa email lỗi trở lại hàng đợi."
        />
      }
      search={toolbar}
      pagination={pagination}
    >
      {children}
    </EntityContainer>
  )
}
