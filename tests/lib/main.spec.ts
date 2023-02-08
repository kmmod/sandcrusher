import { assert, expect, test } from "vitest";
import { Game } from "../../src/lib/main";

test("Game instance is properly initialized", () => {
  const game = new Game();

  expect(game.app).toBeDefined();
  expect(game.app.renderer).toBeDefined();
  expect(game.bindDragEnd).toBeDefined();
  expect(game.bindDragMove).toBeDefined();
  expect(game.bindResize).toBeDefined();
  expect(game.dragTarget).toBeNull();
  expect(game.resizeElement).toBeNull();
});
