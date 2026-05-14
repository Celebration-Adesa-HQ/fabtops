'use client';

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-brand-light pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-20">
          <div className="h-20 w-1/2 bg-brand-dark/5 rounded-2xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="aspect-[16/9] w-full bg-brand-dark/5 rounded-[2rem] animate-pulse" />
              <div className="h-8 w-2/3 bg-brand-dark/5 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
