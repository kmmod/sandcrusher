import * as PIXI from "pixi.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Assets } from "../../src/lib/assets";

import { Board } from "../../src/lib/board";
import { Gem } from "../../src/lib/gem";
import { Interactions } from "../../src/lib/interactions";
import { PathFinder } from "../../src/lib/pathfinder";
import { Tile } from "../../src/lib/tile";
import { GemType } from "../../src/lib/types";

let board: Board;

beforeEach(() => {
  const columns = 10;
  const stage = new PIXI.Container();
  const pathFinder = new PathFinder(columns);
  const assets = new Assets();
  const interactions = new Interactions(pathFinder);

  board = new Board(columns, columns, stage, assets, interactions, pathFinder);

  board.tiles = new Array(columns * columns).fill(null).map((_, i) => {
    return new Tile(i, PIXI.Texture.EMPTY);
  });
});

describe("Tiles getter functions validation", () => {
  const gem = new Gem(GemType.Red, PIXI.Texture.EMPTY);

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

describe("Matcehs are properly detected", () => {
  const gemRed = new Gem(GemType.Red, PIXI.Texture.EMPTY);
  const gemGreen = new Gem(GemType.Green, PIXI.Texture.EMPTY);

  test("Returns empty array if there is no match", () => {
    const matches = board.getMatches(board.tiles[0]);
    expect(matches).toBeInstanceOf(Array);
    expect(matches.length).toBe(0);
  });

  test("Returns empty array if match is incomplete", () => {
    // [ R, R ]
    // [ R, _ ]
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

  test("Sliding window does not overflow the board", () => {
    // [ R, _, _, _, _, _, _, _, _, R ]
    // [ R, _, _, _, _, _, _, _, _, R ]
    // [ R, _, _, _, _, _, _, _, _, R ]

    board.tiles[0].addGem(gemRed);
    board.tiles[9].addGem(gemRed);
    board.tiles[10].addGem(gemRed);
    board.tiles[19].addGem(gemRed);
    board.tiles[20].addGem(gemRed);
    board.tiles[29].addGem(gemRed);

    const matches0 = board.getMatches(board.tiles[0]);
    const matches1 = board.getMatches(board.tiles[9]);

    expect(matches0.length).toBe(0);
    expect(matches1.length).toBe(0);
  });
});
