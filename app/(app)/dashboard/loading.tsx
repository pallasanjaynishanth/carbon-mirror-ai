export default function Loading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="shimmer h-4 w-32 rounded mb-2" />
        <div className="shimmer h-8 w-64 rounded" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border h-24 shimmer" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border h-48 shimmer" />
          <div className="bg-card rounded-xl border border-border h-64 shimmer" />
        </div>
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border h-40 shimmer" />
          <div className="bg-card rounded-xl border border-border h-40 shimmer" />
        </div>
      </div>
    </div>
  )
}
