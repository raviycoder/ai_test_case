import { ComponentIcon, HomeIcon } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function BreadcrumbComp({filePath}: {filePath: string}) {
  const pathSegments = filePath.split('/').filter(segment => segment !== '');
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <HomeIcon className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pathSegments.map((segment, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {index === pathSegments.length - 1 ? (
                <BreadcrumbPage>{segment}</BreadcrumbPage>
              ) : segment}
            </BreadcrumbItem>
            {index < pathSegments.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
