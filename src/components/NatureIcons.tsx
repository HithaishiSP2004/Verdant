import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const LeafIcon: React.FC<IconProps> = ({ size = 24, className = 'text-emerald-400', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2z" />
    <path d="M9 22v-4" />
    <path d="M11 15c2.5-1 4.5-3.5 5.5-6" />
  </svg>
);

export const AcornIcon: React.FC<IconProps> = ({ size = 24, className = 'text-amber-600', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 2v2" />
    <path d="M7 6c-2 0-3 1.5-3 3.5C4 11.5 5 13 8 13h8c3 0 4-1.5 4-3.5C20 7.5 19 6 17 6H7z" />
    <path d="M5 13c0 4 3 8 7 8s7-4 7-8" />
    <path d="M9 6c0 1.5 1.5 3 3 3s3-1.5 3-3" />
  </svg>
);

export const RiverIcon: React.FC<IconProps> = ({ size = 24, className = 'text-sky-400', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 6c3-1.5 5-1.5 8 0s5 1.5 8 0 4-1.5 4-1.5" />
    <path d="M2 12c3-1.5 5-1.5 8 0s5 1.5 8 0 4-1.5 4-1.5" />
    <path d="M2 18c3-1.5 5-1.5 8 0s5 1.5 8 0 4-1.5 4-1.5" />
  </svg>
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, className = 'text-yellow-400', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const FlowerIcon: React.FC<IconProps> = ({ size = 24, className = 'text-rose-400', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 4c1.5-2.5 4.5-2.5 4.5 0S14.5 8 12 9" />
    <path d="M12 4c-1.5-2.5-4.5-2.5-4.5 0S9.5 8 12 9" />
    <path d="M12 20c1.5 2.5 4.5 2.5 4.5 0S14.5 16 12 15" />
    <path d="M12 20c-1.5 2.5-4.5 2.5-4.5 0S9.5 16 12 15" />
    <path d="M4 12c-2.5-1.5-2.5-4.5 0-4.5S8 9.5 9 12" />
    <path d="M4 12c-2.5 1.5-2.5 4.5 0 4.5S8 14.5 9 12" />
    <path d="M20 12c2.5-1.5 2.5-4.5 0-4.5S16 9.5 15 12" />
    <path d="M20 12c2.5 1.5 2.5 4.5 0 4.5S16 14.5 15 12" />
  </svg>
);

export const ButterflyIcon: React.FC<IconProps> = ({ size = 24, className = 'text-violet-400', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 4v16" />
    <path d="M12 8c2-3 8-4 8 2s-3 6-8 4c-5 2-8 2-8-4s6-5 8-2Z" />
    <path d="M12 12c3-1 8 0 8 4s-4 4-8 0c-4 4-8 4-8 0s5-5 8-4Z" />
  </svg>
);

export const OwlIcon: React.FC<IconProps> = ({ size = 24, className = 'text-amber-200', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <circle cx="8" cy="10" r="2" />
    <circle cx="16" cy="10" r="2" />
    <path d="M12 11v3" />
    <path d="M10 12.5h4" />
    <path d="M6 4c1-1 3 0 4 2" />
    <path d="M18 4c-1-1-3 0-4 2" />
  </svg>
);

export const MountainIcon: React.FC<IconProps> = ({ size = 24, className = 'text-slate-300', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    <path d="m12 11 3-2 3.5 3" />
  </svg>
);

export const SaplingIcon: React.FC<IconProps> = ({ size = 24, className = 'text-emerald-500', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22V10" />
    <path d="M12 14c4-1 6-4 6-7 0 0-3 0-6 3" />
    <path d="M12 16c-4-1-6-4-6-7 0 0 3 0 6 3" />
    <path d="M4 22h16" />
  </svg>
);
