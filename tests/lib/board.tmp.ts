import * as PIXI from "pixi.js";
import { describe, expect, test, vi } from "vitest";
import { Assets } from "../../src/lib/assets";
import { Board } from "../../src/lib/board";
import { Gem } from "../../src/lib/gem";
import { Interactions } from "../../src/lib/interactions";
import { Tile } from "../../src/lib/tile";
import { GemType } from "../../src/lib/types";

describe("Board is properly created", () => {
  const app = new PIXI.Application();
  const assets = new Assets();
  const interactions = new Interactions();
  const board = new Board(10, 10, app.stage, assets, interactions);
  const tile = PIXI.Texture.from("/img/tile.png");
  board.initTiles();

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
  const app = new PIXI.Application();
  const assets = new Assets();
  const interactions = new Interactions();
  const board = new Board(10, 10, app.stage, assets, interactions);
  const tile = PIXI.Texture.from("/img/tile.png");
  board.initTiles();

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

describe("Board returns tiles properly", () => {
  const app = new PIXI.Application();
  const assets = new Assets();
  const interactions = new Interactions();
  const board = new Board(10, 10, app.stage, assets, interactions);
  const tile = PIXI.Texture.from("/img/tile.png");
  const gemTexture = PIXI.Texture.from("/img/gem.png");
  const gem = new Gem(GemType.Red, gemTexture);
  board.initTiles();

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
  const app = new PIXI.Application();
  const assets = new Assets();
  const interactions = new Interactions();
  const board = new Board(10, 10, app.stage, assets, interactions);
  const tile = PIXI.Texture.from("/img/tile.png");
  const gemTexture = PIXI.Texture.from("/img/gem.png");
  const gemRed = new Gem(GemType.Red, gemTexture);
  const gemGreen = new Gem(GemType.Green, gemTexture);
  board.initTiles();

  test("Returns empty array if there is no match", () => {
    const matches = board.getMatches(board.tiles[0]);
    expect(matches).toBeInstanceOf(Array);
    expect(matches.length).toBe(0);
  });

  test("Returns empty array if match is incomplete", () => {
    // [ R, R ]
    // [ R, . ]
    board.tiles[0].addGem(gemRed);
    board.tiles[1].addGem(gemRed);
    board.tiles[10].addGem(gemRed);
    const matches = board.getMatches(board.tiles[0]);
    expect(matches.length).toBe(0);
  });

  test("Returns tiles array if match is complete", () => {
    // [ R, R ]
    // [ R, R ]
    board.tiles[0].addGem(gemRed);
    board.tiles[1].addGem(gemRed);
    board.tiles[10].addGem(gemRed);
    board.tiles[11].addGem(gemRed);
    const matches = board.getMatches(board.tiles[0]);
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

  test("Sliding window returns gems of same type only", () => {
    // [ R, R, R, R ]
    // [ G, R, R, R ]
    board.tiles[0].addGem(gemRed);
    board.tiles[1].addGem(gemRed);
    board.tiles[2].addGem(gemRed);
    board.tiles[3].addGem(gemRed);
    board.tiles[10].addGem(gemGreen);
    board.tiles[11].addGem(gemRed);
    board.tiles[12].addGem(gemRed);
    board.tiles[13].addGem(gemRed);

    const matches0 = board.getMatches(board.tiles[0]);
    const matches1 = board.getMatches(board.tiles[1]);
    const matches2 = board.getMatches(board.tiles[2]);

    expect(matches0.length).toBe(0);
    expect(matches1.length).toBe(4);
    expect(matches2.length).toBe(6);
  });
});