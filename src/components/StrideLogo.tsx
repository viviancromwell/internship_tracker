export function StrideLogo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="28" r="6" fill="currentColor" opacity="0.4" />
      <line x1="16" y1="24" x2="24" y2="16" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" opacity="0.5" />
      <circle cx="28" cy="12" r="6" fill="currentColor" />
    </svg>
  );
}
