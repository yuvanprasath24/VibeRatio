const RATIOS = [16 / 9, 4 / 3, 1, 3 / 4, 16 / 10];

export function SkeletonCard({ index }: { index: number }) {
  const ratio = RATIOS[index % RATIOS.length];
  return (
    <div
      className="skeleton-block w-full break-inside-avoid rounded-xl"
      style={{ aspectRatio: `${ratio}` }}
    />
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}