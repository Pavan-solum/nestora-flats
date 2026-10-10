export function CardSkeleton() {
  return (
    <div className="surface overflow-hidden">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-10 w-full" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div>
      <section className="container-shell hero-grid section-space !pt-6 !pb-8">
        <div className="space-y-4 py-2">
          <div className="skeleton h-7 w-40" />
          <div className="skeleton h-14 w-4/5" />
          <div className="skeleton h-6 w-2/3" />
          <div className="flex gap-2">
            <div className="skeleton h-8 w-24" />
            <div className="skeleton h-8 w-28" />
            <div className="skeleton h-8 w-32" />
          </div>
          <div className="skeleton h-11 w-40" />
        </div>
        <div className="skeleton aspect-[4/5] md:aspect-[5/6]" />
      </section>
      <section className="container-shell section-space">
        <div className="skeleton mb-6 h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
}

export function FlatSkeleton() {
  return (
    <div className="container-shell section-space !pt-8">
      <div className="skeleton mb-4 h-8 w-32" />
      <div className="skeleton mb-3 h-12 w-2/3" />
      <div className="skeleton mb-6 h-5 w-1/2" />
      <div className="skeleton aspect-[4/3] sm:aspect-[16/10]" />
    </div>
  );
}
