import * as PIXI from "pixi.js";

export const waitForMs = async (duration: number) => {
  return await new Promise((resolve) => setTimeout(resolve, duration));
};

export const randomItems = <T>(items: T[], count: number): T[] => {
  // Using Schwartzian transform to randomize the array and then slice it to
  // the desired count.
  // https://en.wikipedia.org/wiki/Schwartzian_transform
  const shuffled = items
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
  return shuffled.slice(0, count);
};

export const lerpPosition = (
  a: PIXI.Point,
  b: PIXI.Point,
  t: number
): PIXI.Point => {
  return new PIXI.Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};

export const fractionToAmount = <T>(percent: number, items: T[]): number => {
  return Math.floor(items.length * percent);
};
