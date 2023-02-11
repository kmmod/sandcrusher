import * as PIXI from "pixi.js";
import { Tile } from "./tile";

export class Board {
  columns: number;
  rows: number;
  tiles: Tile[];

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.tiles = []
  }

  createTiles(tileTexture: PIXI.Texture): void {
    this.tiles = new Array(this.columns * this.rows)
      .fill(null)
      .map((_, i) => new Tile(i, tileTexture));
  }

  updateTiles(width: number, height: number): void {
    const stepX = width / this.columns;
    const stepY = height / this.rows;

    this.tiles.forEach((tile) => {
      const x = (tile.id % this.columns) * stepX + stepX / 2;
      const y = Math.floor(tile.id / this.columns) * stepY + stepY / 2;
      tile.setScale(stepX / tile.sprite.texture.width);
      tile.setPosition(x, y);
    });
  }

  getTiles(): Tile[] {
    return this.tiles;
  }
}
