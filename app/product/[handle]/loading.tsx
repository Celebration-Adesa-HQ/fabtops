'use client';

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Gallery Skeleton */}
          <div className="space-y-6">
            <div className="aspect-[4/5] w-full bg-brand-dark/5 rounded-[2.5rem] animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-brand-dark/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-10 py-6">
            <div className="space-y-4">
              <div className="h-4 w-24 bg-brand-dark/5 rounded-full animate-pulse" />
              <div className="h-12 w-full bg-brand-dark/5 rounded-2xl animate-pulse" />
              <div className="h-6 w-32 bg-brand-dark/5 rounded-full animate-pulse" />
            </div>

            <div className="space-y-4">
              <div className="h-4 w-16 bg-brand-dark/5 rounded-full animate-pulse" />
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-brand-dark/5 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            <div className="h-20 w-full bg-brand-dark/10 rounded-2xl animate-pulse" />
            
            <div className="space-y-4 pt-10 border-t border-brand-dark/5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 w-full bg-brand-dark/5 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
