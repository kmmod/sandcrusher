import * as PIXI from "pixi.js";
import { describe, expect, test } from "vitest";
import {
  lerpPosition,
  fractionToAmount,
  randomItems,
  waitForMs,
} from "../../src/lib/utils";

test("Timeout function properly works", async () => {
  let counter = 0;
  setTimeout(() => {
    counter += 1;
  }, 50);
  await waitForMs(10);
  expect(counter).toBe(0);
  await waitForMs(40);
  expect(counter).toBe(1);
});

describe("Random Items", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("Does not mutate the original array", () => {
    const itemsCopy = [...items];
    randomItems(items, 5);
    expect(itemsCopy).toEqual(items);
  });

  test("Returns the correct number of items", () => {
    const result = randomItems(items, 5);
    expect(result.length).toBe(5);
  });

  test("Returns all items if count is greater than items length", () => {
    const result = randomItems(items, 15);
    expect(result.length).toBe(10);
  });

  test("Returns no items if count is 0", () => {
    const result = randomItems(items, 0);
    expect(result.length).toBe(0);
  });

  test("Returns random items", () => {
    const result = randomItems(items, 8);
    expect(result).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("Lerp Position over time", () => {
  const pointA = new PIXI.Point(0, 0);
  const pointB = new PIXI.Point(100, 100);

  test("Returns the correct position at 0%", () => {
    expect(lerpPosition(pointA, pointB, 0)).toEqual(pointA);
  });

  test("Returns the correct position at 50%", () => {
    expect(lerpPosition(pointA, pointB, 0.5)).toEqual(new PIXI.Point(50, 50));
  });

  test("Returns the correct position at 100%", () => {
    expect(lerpPosition(pointA, pointB, 1)).toEqual(pointB);
  });
});

describe("Percent to amount", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("Returns the correct amount at 0%", () => {
    expect(fractionToAmount(0, items)).toBe(0);
  });

  test("Returns the correct amount at 50%", () => {
    expect(fractionToAmount(0.5, items)).toBe(5);
  });

  test("Returns the correct amount at 100%", () => {
    expect(fractionToAmount(1, items)).toBe(10);
  });
});
