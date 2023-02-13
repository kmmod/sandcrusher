import * as PIXI from "pixi.js";
import { describe, expect, test, vi } from "vitest";
import { Board } from "../../src/lib/board";
import { Tile } from "../../src/lib/tile";

describe("Board is properly created", () => {
  const board = new Board(10, 10);
  const tile = PIXI.Texture.from("/img/tile.png");
  board.createTiles(tile);

  test("Board accepts width and height", () => {
    expect(board.columns).toBe(10);
    expect(board.rows).toBe(10);
  });

  test("Board has a grid of tiles", () => {
    expect(board.tiles).toBeInstanceOf(Array);
    expect(board.tiles.length).toBe(100);
  });

  test("Each tile is an instance of Tile object", () => {
    expect(board.tiles[0]).toBeInstanceOf(Tile);
  });

  let id = 0;
  let lastSprite: PIXI.Sprite = PIXI.Sprite.from("/img/tile.png");
  test.each(board.tiles)(
    "Tile $id has a unique id and a unique sprite",
    (tile) => {
      expect(tile.id).toBe(id);
      expect(tile.sprite).toBeInstanceOf(PIXI.Sprite);
      expect(tile.sprite).not.toBe(lastSprite);
      id += 1;
      lastSprite = tile.sprite;
    }
  );
});

describe("Board is properly updated", () => {
  const board = new Board(10, 10);
  const tile = PIXI.Texture.from("/img/tile.png");
  board.createTiles(tile);

  const width = 1000;
  const height = 1000;
  const textureSize = new PIXI.Point(256, 256);

  vi.spyOn(board.tiles[0].sprite.texture, "width", "get").mockReturnValue(
    textureSize.x
  );

  board.updateTiles(width, height);

  test("Board tiles are properly updated", () => {
    expect(board.tiles[0].sprite.position.x).toBe(50);
    expect(board.tiles[0].sprite.position.y).toBe(50);
    expect(board.tiles[0].sprite.scale.x).toBe(
      width / board.columns / textureSize.x
    );
  });
});
