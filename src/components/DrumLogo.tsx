interface DrumLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
}

export default function DrumLogo({
  size = "md",
  showGlow = false,
  className = "",
}: DrumLogoProps) {
  const sizeConfig = {
    sm: {
      container: "w-12 h-12",
      drum: "w-8 h-6",
      stick: "w-4 h-0.5",
      leg: "w-0.5 h-3",
      top: "-top-0.5",
      bottom: "-bottom-1.5",
    },
    md: {
      container: "w-16 h-16",
      drum: "w-10 h-8",
      stick: "w-5 h-0.5",
      leg: "w-0.5 h-4",
      top: "-top-0.5",
      bottom: "-bottom-2",
    },
    lg: {
      container: "w-24 h-24",
      drum: "w-16 h-12",
      stick: "w-6 h-0.5",
      leg: "w-0.5 h-5",
      top: "-top-1",
      bottom: "-bottom-2.5",
    },
    xl: {
      container: "w-48 h-48",
      drum: "w-32 h-24",
      stick: "w-12 h-1",
      leg: "w-1 h-7",
      top: "-top-2",
      bottom: "-bottom-3.5",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className={`relative ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 bg-gradient-to-r from-drumio-purple/20 to-drumio-purple/10 rounded-full blur-2xl scale-110"></div>
      )}

      <div
        className={`${config.container} bg-gradient-to-br from-drumio-purple to-purple-600 rounded-full flex items-center justify-center relative`}
      >
        {/* Drum body */}
        <div className={`${config.drum} bg-black rounded-lg relative`}>
          {/* Drumsticks */}
          <div
            className={`absolute ${config.top} left-1/2 transform -translate-x-1/2 -rotate-12`}
          >
            <div className={`${config.stick} bg-amber-200 rounded-full`}></div>
            <div
              className={`${config.stick} bg-amber-200 rounded-full mt-0.5 ml-1`}
            ></div>
          </div>

          {/* Drum legs */}
          <div
            className={`absolute ${config.bottom} left-1 ${config.leg} bg-black`}
          ></div>
          <div
            className={`absolute ${config.bottom} right-1 ${config.leg} bg-black`}
          ></div>
        </div>
      </div>
    </div>
  );
}