export const computeClampVwPx = (
  minPx: number,
  vw: number,
  maxPx: number,
): number => {
  const viewportWidth = getViewportWidth();

  var preferredPx;

  if (viewportWidth < 1920) {
    preferredPx = (vw / 100) * viewportWidth; // convert vw to px
  } else {
    preferredPx = (vw / 150) * viewportWidth; // convert vw to px
  }
  const clamped = Math.max(minPx, Math.min(maxPx, preferredPx));
  return Math.round(clamped);
};

const getViewportWidth = (): number => {
  if (typeof window === "undefined" || typeof window.innerWidth !== "number") {
    return 1024; // fallback for SSR
  }
  return window.innerWidth;
};
