'use client';

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20">
          <div className="h-20 w-1/2 bg-brand-dark/5 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-7 md:gap-y-14 xl:grid-cols-4 2xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] w-full bg-brand-dark/5 animate-pulse" />
              <div className="h-3 w-1/3 bg-brand-dark/5 rounded-full animate-pulse" />
              <div className="h-5 w-4/5 bg-brand-dark/5 rounded-full animate-pulse" />
              <div className="h-4 w-2/5 bg-brand-dark/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
