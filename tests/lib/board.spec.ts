import * as PIXI from "pixi.js";
import { describe, expect, test, vi } from "vitest";
import { Board } from "../../src/lib/board";
import { Gem, GemType } from "../../src/lib/gem";
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

describe("Board tiles are properly resized", () => {
  const board = new Board(10, 10);
  const tile = PIXI.Texture.from("/img/tile.png");
  board.createTiles(tile);

  const width = 1000;
  const height = 1000;
  const textureSize = new PIXI.Point(256, 256);

  vi.spyOn(board.tiles[0].sprite.texture, "width", "get").mockReturnValue(
    textureSize.x
  );

  board.resizeTiles(width, height);

  test("Tile is resized", () => {
    expect(board.tiles[0].sprite.position.x).toBe(50);
    expect(board.tiles[0].sprite.position.y).toBe(50);
    expect(board.tiles[0].sprite.scale.x).toBe(
      width / board.columns / textureSize.x
    );
  });
});

describe("Board return tiles properly", () => {
  const board = new Board(10, 10);
  const tile = PIXI.Texture.from("/img/tile.png");
  const gemTexture = PIXI.Texture.from("/img/gem.png");
  const gem = new Gem(GemType.Red, gemTexture);
  board.createTiles(tile);

  test("Returns all tiles", () => {
    expect(board.getTiles()).toBe(board.tiles);
  });

  test("Returns all empty tiles if there is no gem", () => {
    expect(board.getEmptyTiles().length).toBe(board.tiles.length);
  });

  test("Returns correct amount of empty tiles", () => {
    board.tiles[0].addGem(gem);
    expect(board.getEmptyTiles().length).toBe(board.tiles.length - 1);
  });
});

describe("Matches are properly checked", () => {
  const board = new Board(10, 10);
  const tile = PIXI.Texture.from("/img/tile.png");
  const gemTexture = PIXI.Texture.from("/img/gem.png");
  const gem = new Gem(GemType.Red, gemTexture);
  board.createTiles(tile);

  test("Returns empty array if there is no match", () => {
    const matches = board.checkMatches(board.tiles[0]);
    expect(matches).toBeInstanceOf(Array);
    expect(matches.length).toBe(0);
  });

  test("Returns empty array if match is incomplete", () => {
    board.tiles[0].addGem(gem);
    board.tiles[1].addGem(gem);
    board.tiles[10].addGem(gem);
    const matches = board.checkMatches(board.tiles[0]);
    expect(matches.length).toBe(0);
  });

  test("Returns tiles array if match is complete", () => {
    board.tiles[0].addGem(gem);
    board.tiles[1].addGem(gem);
    board.tiles[10].addGem(gem);
    board.tiles[11].addGem(gem);
    const matches = board.checkMatches(board.tiles[0]);
    expect(matches.length).toBe(4);
    expect(matches).toEqual(
      expect.arrayContaining([
        board.tiles[0],
        board.tiles[1],
        board.tiles[10],
        board.tiles[11],
      ])
    );
  });
});
