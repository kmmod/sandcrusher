import * as PIXI from "pixi.js";

export const timer = async (duration: number) => {
  return await new Promise((resolve) => setTimeout(resolve, duration));
};

export const randomItems = <T>(items: T[], count: number): T[] => {
  // TODO: it seems this randomize funcion may return not as random items as 
  // one could wish for. Need to rethink this.
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
};

export const lerpPosition = (
  a: PIXI.Point,
  b: PIXI.Point,
  t: number
): PIXI.Point => {
  return new PIXI.Point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
};

export const percentToAmount = <T>(percent: number, items: T[]): number => {
  return Math.floor(items.length * percent);
};
