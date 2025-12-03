import * as React from "react";

const LANDSCAPE_HEIGHT_BREAKPOINT = 500;

export function useIsLandscape() {
  const [isLandscape, setIsLandscape] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkLandscape = () => {
      const isLandscapeMode = window.innerWidth > window.innerHeight && window.innerHeight <= LANDSCAPE_HEIGHT_BREAKPOINT;
      setIsLandscape(isLandscapeMode);
    };

    checkLandscape();
    
    window.addEventListener("resize", checkLandscape);
    window.addEventListener("orientationchange", checkLandscape);
    
    return () => {
      window.removeEventListener("resize", checkLandscape);
      window.removeEventListener("orientationchange", checkLandscape);
    };
  }, []);

  return isLandscape;
}
