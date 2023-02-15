import { describe, expect, test, vi } from "vitest";
import * as PIXI from "pixi.js";
import { Game } from "../../src/lib/main";

describe("Game initialization", () => {
  const game = new Game(10, 10);
  const divElement = document.createElement("div");
  vi.spyOn(divElement, "clientWidth", "get").mockReturnValue(1000);
  vi.spyOn(divElement, "clientHeight", "get").mockReturnValue(1000);

  game.setResizeElement(divElement);

  test("Has a resize element", () => {
    expect(game.resizeElement).toBe(divElement);
  });

  test("Renderer is resized", () => {
    game.resize();
    expect(game.app.renderer.width).toBe(1000);
    expect(game.app.renderer.height).toBe(1000);
  });

  test("Has a PIXI renderer", () => {
    expect(game.setPixiApp()).toBeInstanceOf(PIXI.Application);
    expect(game.app).toBeInstanceOf(PIXI.Application);
  });

  test("Loads tile and gems and adds interactions", async () => {
    const sprite: PIXI.Texture = PIXI.Texture.from("/img/tile.png");
    PIXI.Assets.load = vi.fn().mockResolvedValue(sprite);

    await game.init();

    expect(game.board.tiles.length).toBe(100);
    expect(game.board.tiles.filter((tile) => tile.gem).length).toBe(15);
  });
});
