import { assert, expect, test } from "vitest";
import { add } from "../src/lib/utils";

test("adds", () => {
  assert.equal(1 + 1, 2);
});

test("adds 2", () => {
  expect(add(1, 1)).toBe(2);
});
