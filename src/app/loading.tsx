export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-8">
      <header className="mb-8 text-center">
        <div className="mx-auto h-9 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-5 w-72 animate-pulse rounded bg-gray-100" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="aspect-square w-full animate-pulse bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
