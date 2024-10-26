import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 animate-pulse">
        <div className="aspect-video w-full bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
  )
}

export { Skeleton }
