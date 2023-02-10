export const timer = async (duration: number) => {
  return await new Promise((resolve) => setTimeout(resolve, duration));
};
