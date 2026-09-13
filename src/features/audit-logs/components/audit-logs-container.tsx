import { DownloadIcon } from "lucide-react"

import { EntityContainer } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export function AuditLogsContainer({ exportUrl, toolbar, pagination, children }: { exportUrl: string; toolbar: React.ReactNode; pagination: React.ReactNode; children: React.ReactNode }) {
  return (
    <EntityContainer
      width="full"
      header={
        <PageHeader
          title="Nhật ký thay đổi"
          description="Theo dõi ai đã thay đổi dữ liệu nào, vào lúc nào và giá trị trước/sau. Nhật ký chỉ đọc và không thể xóa."
          actions={<Button size="sm" variant="outline" asChild><a href={exportUrl}><DownloadIcon />Xuất Excel</a></Button>}
        />
      }
      search={toolbar}
      pagination={pagination}
    >
      {children}
    </EntityContainer>
  )
}
