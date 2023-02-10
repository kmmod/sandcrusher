import { expect, test } from "vitest";
import { timer } from "../../src/lib/utils";

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
