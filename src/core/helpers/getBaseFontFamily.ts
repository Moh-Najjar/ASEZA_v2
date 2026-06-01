export const getBaseFontFamily = (): string => {
  const rootStyle = getComputedStyle(document.documentElement);
  return (
    rootStyle.getPropertyValue("--font-base").trim() ||
    '"Cairo", "Tajawal", "Arial", sans-serif'
  );
};
