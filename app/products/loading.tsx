export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-12">
        <div className="w-24 h-3 bg-[#1A1A1A] rounded animate-pulse mb-3" />
        <div className="w-48 h-8 bg-[#1A1A1A] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-square bg-[#111] rounded-lg animate-pulse mb-4" />
            <div className="h-4 bg-[#111] rounded animate-pulse mb-2 w-3/4" />
            <div className="h-3 bg-[#111] rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
