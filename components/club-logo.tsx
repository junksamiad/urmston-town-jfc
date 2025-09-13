interface ClubLogoProps {
  className?: string
  size?: number
}

export function ClubLogo({ className, size = 40 }: ClubLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="#244cbc"
        stroke="#ffffff"
        strokeWidth="2"
      />
      
      {/* Football/Soccer ball pattern */}
      <circle cx="50" cy="50" r="35" fill="#ffffff" />
      
      {/* Pentagon in center */}
      <polygon
        points="50,20 62,30 58,45 42,45 38,30"
        fill="#244cbc"
      />
      
      {/* Connecting lines to create football pattern */}
      <path
        d="M50,20 L38,30 M50,20 L62,30 M38,30 L42,45 M62,30 L58,45 M42,45 L58,45"
        stroke="#244cbc"
        strokeWidth="1"
        fill="none"
      />
      
      {/* Additional hexagon segments */}
      <path
        d="M38,30 L25,35 L28,50 L42,45 M62,30 L75,35 L72,50 L58,45 M42,45 L28,50 L32,65 L50,68 M58,45 L72,50 L68,65 L50,68"
        stroke="#244cbc"
        strokeWidth="1"
        fill="none"
      />
      
      {/* Club initials */}
      <text
        x="50"
        y="85"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="8"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        UTJFC
      </text>
    </svg>
  )
}