import { useStore } from '../store/useStore'

export function SkeletonCard({ lines = 3 }) {
  const { isDark } = useStore()
  return (
    <div className="rounded-3xl p-5 animate-pulse"
      style={{ background: isDark ? '#111827' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}>
      <div className="h-4 rounded-xl w-2/3 mb-3"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 rounded-xl mb-2 ${i % 2 === 0 ? 'w-full' : 'w-3/4'}`}
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  )
}
