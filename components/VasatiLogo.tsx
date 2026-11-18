import React from 'react';

interface VasatiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'colored' | 'white';
  className?: string;
  horizontal?: boolean;
}

export const VasatiLogo: React.FC<VasatiLogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'colored',
  className = '',
  horizontal = false,
}) => {
  const isWhite = variant === 'white';
  const purple = isWhite ? '#FFFFFF' : '#5B0BB5';
  const orange = isWhite ? '#FFB000' : '#FF8A00';

  // Dimension scaling
  const dims = {
    sm: { imgW: 42, imgH: 27, fontSize: 'text-lg', taglineSize: 'text-[9px]', pinW: 8, pinH: 10 },
    md: { imgW: 64, imgH: 41, fontSize: 'text-2xl', taglineSize: 'text-[11px]', pinW: 10, pinH: 12 },
    lg: { imgW: 110, imgH: 70, fontSize: 'text-4xl', taglineSize: 'text-[13px]', pinW: 13, pinH: 16 },
    xl: { imgW: 155, imgH: 99, fontSize: 'text-5xl', taglineSize: 'text-[15px]', pinW: 16, pinH: 20 },
  }[size];

  if (horizontal) {
    return (
      <div className={`flex items-center gap-2.5 select-none ${className}`}>
        {/* Official 3D VASATI Ribbon Logo */}
        <div className={`shrink-0 overflow-hidden ${isWhite ? 'bg-white/95 p-1 rounded-xl shadow-sm' : ''}`}>
          <img
            src="/vasati-logo.jpg"
            alt="VASATI"
            width={dims.imgW}
            height={dims.imgH}
            className="object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
            style={{ width: dims.imgW, height: dims.imgH }}
          />
        </div>

        {/* Wordmark & Tagline */}
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight font-black leading-none">
            <span
              className={`font-serif tracking-tight font-bold ${dims.fontSize}`}
              style={{ color: purple }}
            >
              Vasat
            </span>
            <div className="relative inline-flex flex-col items-center">
              <svg
                width={dims.pinW}
                height={dims.pinH}
                viewBox="0 0 12 16"
                fill="none"
                className="mb-[1px]"
              >
                <path
                  d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 7.10457 7.10457 8 6 8Z"
                  fill={orange}
                />
              </svg>
              <span
                className={`font-serif font-bold ${dims.fontSize} leading-none`}
                style={{ color: purple }}
              >
                ı
              </span>
            </div>
          </div>

          {showTagline && (
            <span
              className={`font-medium tracking-wide uppercase ${dims.taglineSize} mt-0.5`}
              style={{ color: isWhite ? '#E2E8F0' : '#241044' }}
            >
              Your Space. Our Priority.
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Official 3D VASATI Ribbon Logo */}
      <div className={`overflow-hidden ${isWhite ? 'bg-white/95 p-1.5 rounded-2xl shadow-sm mb-1' : ''}`}>
        <img
          src="/vasati-logo.jpg"
          alt="VASATI Official Logo"
          width={dims.imgW}
          height={dims.imgH}
          className="object-contain mix-blend-multiply transition-transform duration-300 hover:scale-105"
          style={{ width: dims.imgW, height: dims.imgH }}
        />
      </div>

      {/* Brand Name with Orange Pin Dot on 'i' */}
      <div className="flex items-center tracking-tight font-black mt-1">
        <span
          className={`font-serif tracking-tight font-bold ${dims.fontSize}`}
          style={{ color: purple }}
        >
          Vasat
        </span>
        {/* 'i' with orange location pin as dot */}
        <div className="relative inline-flex flex-col items-center">
          <svg
            width={dims.pinW}
            height={dims.pinH}
            viewBox="0 0 12 16"
            fill="none"
            className="mb-[1px]"
          >
            <path
              d="M6 0C2.68629 0 0 2.68629 0 6C0 10.5 6 16 6 16C6 16 12 10.5 12 6C12 2.68629 9.31371 0 6 0ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 7.10457 7.10457 8 6 8Z"
              fill={orange}
            />
          </svg>
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
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-5 h-[1.5px] rounded-full" style={{ backgroundColor: orange }} />
          <span
            className={`font-medium tracking-wide uppercase ${dims.taglineSize}`}
            style={{ color: isWhite ? '#E2E8F0' : '#241044' }}
          >
            Your Space. Our Priority.
          </span>
          <span className="w-5 h-[1.5px] rounded-full" style={{ backgroundColor: orange }} />
        </div>
      )}
    </div>
  );
};
