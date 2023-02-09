import { describe, expect, test, vi } from "vitest";
import { Board } from "../../src/lib/board";
import { Game } from "../../src/lib/main";

test("Game instance is properly initialized", () => {
  const game = new Game(10, 10);
  expect(game.app).toBeDefined();
  expect(game.app.renderer).toBeDefined();
  expect(game.bindDragEnd).toBeDefined();
  expect(game.bindDragMove).toBeDefined();
  expect(game.bindResize).toBeDefined();
  expect(game.dragTarget).toBeNull();
  expect(game.resizeElement).toBeNull();
  expect(game.board).toBeInstanceOf(Board);
});

describe("Game initialization", () => {
  const game = new Game(10, 10);
  const divElement = document.createElement("div");
  vi.spyOn(divElement, "clientWidth", "get").mockReturnValue(1000);
  vi.spyOn(divElement, "clientHeight", "get").mockReturnValue(1000);

  game.setResizeElement(divElement);

  test("Game has a resize element", () => {
    expect(game.resizeElement).toBe(divElement);
  });

  test("Game renderer is resized", () => {
    expect(game.app.renderer.width).toBe(1000);
    expect(game.app.renderer.height).toBe(1000);
  });

  game.init();

  test("Tiles are rendered", () => {
    expect(game.app.stage.children.length).toBe(100);
  })
});
