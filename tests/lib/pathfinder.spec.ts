import { describe, expect, test } from "vitest";
import * as PIXI from "pixi.js";
import { PathFinder } from "../../src/lib/pathfinder";
import { Tile } from "../../src/lib/tile";
import { Options } from "../../src/lib/types";

describe("PathFinder", () => {
  const pathFinder = new PathFinder(Options.Columns);
  const texture = PIXI.Texture.from("/img/tile.png");
  const startTile = new Tile(0, texture);
  const endTile = new Tile(1, texture);

  test("findPath", () => {
    pathFinder.findPath(startTile, endTile);
    expect(pathFinder.path).toBeInstanceOf(Array);
  });
});
