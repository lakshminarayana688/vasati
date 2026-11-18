import React from 'react';

interface VasatiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'colored' | 'white';
  className?: string;
}

export const VasatiLogo: React.FC<VasatiLogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'colored',
  className = '',
}) => {
  const isWhite = variant === 'white';
  const purple = isWhite ? '#FFFFFF' : '#5C16C5';
  const orange = isWhite ? '#FFA447' : '#FF7A00';

  // Dimension scaling
  const dims = {
    sm: { iconW: 32, iconH: 26, fontSize: 'text-xl', taglineSize: 'text-[9px]', spacing: 'gap-1' },
    md: { iconW: 46, iconH: 38, fontSize: 'text-2xl', taglineSize: 'text-[11px]', spacing: 'gap-1.5' },
    lg: { iconW: 68, iconH: 56, fontSize: 'text-4xl', taglineSize: 'text-[13px]', spacing: 'gap-2' },
    xl: { iconW: 92, iconH: 76, fontSize: 'text-5xl', taglineSize: 'text-[15px]', spacing: 'gap-2.5' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Stylized VASATI Geometric Icon */}
      <svg
        width={dims.iconW}
        height={dims.iconH}
        viewBox="0 0 100 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Left Purple Wing */}
        <path
          d="M10 25C24 45 40 68 50 78C45 60 38 40 28 20C24 14 18 18 10 25Z"
          fill={purple}
        />
        {/* Right Purple Wing */}
        <path
          d="M90 25C76 45 60 68 50 78C55 60 62 40 72 20C76 14 82 18 90 25Z"
          fill={purple}
        />
        {/* Central Orange Roof Peak */}
        <path
          d="M50 14L28 36L36 43L50 28L64 43L72 36L50 14Z"
          fill={orange}
        />
        {/* 4 Window Squares inside Roof */}
        <rect x="44" y="34" width="4.5" height="4.5" rx="0.8" fill={purple} />
        <rect x="51.5" y="34" width="4.5" height="4.5" rx="0.8" fill={purple} />
        <rect x="44" y="41.5" width="4.5" height="4.5" rx="0.8" fill={purple} />
        <rect x="51.5" y="41.5" width="4.5" height="4.5" rx="0.8" fill={purple} />
      </svg>

      {/* Brand Name with Orange Pin Dot on 'i' */}
      <div className="flex items-center tracking-tight font-black mt-0.5">
        <span
          className={`font-serif tracking-tight font-bold ${dims.fontSize}`}
          style={{ color: purple }}
        >
          Vasat
        </span>
        {/* 'i' with orange location pin as dot */}
        <div className="relative inline-flex flex-col items-center">
          {/* Orange location pin */}
          <svg
            width={size === 'xl' ? 14 : size === 'lg' ? 11 : size === 'md' ? 9 : 7}
            height={size === 'xl' ? 18 : size === 'lg' ? 14 : size === 'md' ? 11 : 9}
            viewBox="0 0 12 16"
            fill="none"
            className="mb-[1px]"
          >
            <path
              d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 7.10457 7.10457 8 6 8Z"
              fill={orange}
            />
          </svg>
          {/* Stem of 'i' */}
          <span
            className={`font-serif font-bold ${dims.fontSize} leading-none`}
            style={{ color: purple }}
          >
            ı
          </span>
        </div>
      </div>

      {/* Tagline: — Your Space. Our Priority. — */}
      {showTagline && (
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-5 h-[1.5px] rounded-full" style={{ backgroundColor: orange }} />
          <span
            className={`font-medium tracking-wide uppercase ${dims.taglineSize}`}
            style={{ color: isWhite ? '#FFFFFF' : '#4A154B' }}
          >
            Your Space. Our Priority.
          </span>
          <span className="w-5 h-[1.5px] rounded-full" style={{ backgroundColor: orange }} />
        </div>
      )}
    </div>
  );
};

