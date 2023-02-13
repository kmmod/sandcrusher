import { describe, expect, test } from "vitest";
import { randomItems, timer } from "../../src/lib/utils";

test("Timeout function properly works", async () => {
  let counter = 0;
  setTimeout(() => {
    counter += 1;
  }, 50);
  await timer(10);
  expect(counter).toBe(0);
  await timer(40);
  expect(counter).toBe(1);
});

describe("Random Items", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  test("Does not change the original array", () => {
    const itemsCopy = [...items];
    randomItems(items, 5);
    expect(itemsCopy).toEqual(items);
  });

  test("Returns the correct number of items", () => {
    const result = randomItems(items, 5);
    expect(result.length).toBe(5);
  });
});
