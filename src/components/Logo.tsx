export default function Logo({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${light ? 'text-white' : 'text-ink-900'} ${className}`}>
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 2 30 29H2L16 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity=".5" />
        <path d="M16 12l7 13H9l7-13Z" fill={light ? '#e8fc03' : '#6d4bc9'} />
      </svg>
      <span className="font-semibold text-[1.0625rem] tracking-[0.22em] leading-none">VANGUARD</span>
    </span>
  );
}
