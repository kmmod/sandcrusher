import * as PIXI from "pixi.js";
import { Gem, GemType } from "./gem";
import { Options } from "./main";
import { Tile } from "./tile";
import { randomItems } from "./utils";

export class Board {
  columns: number;
  rows: number;
  tiles: Tile[];
  nextTiles: Tile[];

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.tiles = [];
    this.nextTiles = [];
  }

  createTiles(tileTexture: PIXI.Texture): void {
    this.tiles = new Array(this.columns * this.rows)
      .fill(null)
      .map((_, i) => new Tile(i, tileTexture));
  }

  resizeTiles(width: number, height: number): void {
    const stepX = width / this.columns;
    const stepY = height / this.rows;

    this.tiles.forEach((tile) => {
      const x = (tile.id % this.columns) * stepX + stepX / 2;
      const y = Math.floor(tile.id / this.columns) * stepY + stepY / 2;
      tile.setScale(stepX / tile.sprite.texture.width);
      tile.setPosition(x, y);
    });
  }

  setNextTiles(nextGems: Gem[]): void {
    console.assert(
      nextGems.length === Options.NewGemsPerTurn,
      "Wrong amount of gems"
    );
    this.nextTiles = randomItems(this.getEmptyTiles(), Options.NewGemsPerTurn);
    this.nextTiles.forEach((tile: Tile) =>
      tile.addGem(nextGems.pop()!, true, true)
    );
  }

  getNextTiles(): Tile[] {
    return this.nextTiles;
  }

  getTiles(): Tile[] {
    return this.tiles;
  }

  getEmptyTiles(): Tile[] {
    return this.tiles.filter((tile) => tile.gem === undefined);
  }

  getMatches(tile: Tile): Tile[] {
    // Returns array of tiles for removal if there is a match
    // Otherwise returns empty array
    if (tile.gem === undefined) return [];

    const gemType = tile.gem.type;

    const corners = [
      tile.id - this.columns - 1,
      tile.id - this.columns,
      tile.id - 1,
      tile.id,
    ];

    const candidates = corners.flatMap((cornerId) =>
      this.slidingWindow(cornerId, gemType)
    );

    return [...new Set(candidates)];
  }

  private slidingWindow(cornerId: number, gemType: GemType) {
    // Look for matches in 2x2 square around cornerTile
    const tilesGrid = [
      this.tiles[cornerId],
      this.tiles[cornerId + 1],
      this.tiles[cornerId + this.columns],
      this.tiles[cornerId + this.columns + 1],
    ];

    const tiles = tilesGrid.filter((tile) => tile?.gem?.type === gemType);

    return tiles.length === 4 ? tiles : [];
  }
}
