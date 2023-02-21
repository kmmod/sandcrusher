import * as PIXI from "pixi.js";
import { GemType, TileType } from "./types";

export class Assets {
  tiles: { [key in TileType]?: PIXI.Texture };
  gems: { [key in GemType]?: PIXI.Texture };

  constructor() {
    this.tiles = {};
    this.gems = {};
  }

  async loadTileAssets(): Promise<void> {
    this.tiles[TileType.Default] = await PIXI.Assets.load("/img/tile.png");
  }

  async loadGemAssets(): Promise<void> {
    this.gems[GemType.Red] = await PIXI.Assets.load("/img/gem-red.png");
    this.gems[GemType.Blue] = await PIXI.Assets.load("/img/gem-blue.png");
    this.gems[GemType.Green] = await PIXI.Assets.load("/img/gem-green.png");
    this.gems[GemType.Purple] = await PIXI.Assets.load("/img/gem-purple.png");
    this.gems[GemType.Yellow] = await PIXI.Assets.load("/img/gem-yellow.png");
  }

  getTileTexture(tileType: TileType): PIXI.Texture | undefined {
    console.assert(this.tiles[tileType], `Texture ${tileType} not found`);
    return this.tiles[tileType];
  }

  getGemTexture(gemType: GemType): PIXI.Texture | undefined {
    console.assert(this.gems[gemType], `Texture ${gemType} not found`);
    return this.gems[gemType];
  }
}
