export const timer = async (duration: number) => {
  return await new Promise((resolve) => setTimeout(resolve, duration));
};

export const randomItems = <T>(items: T[], count: number): T[] => {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
};
