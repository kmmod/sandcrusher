import * as PIXI from "pixi.js";

export class Assets {
  tiles: { [name: string]: PIXI.Texture };
  gems: { [name: string]: PIXI.Texture };

  constructor() {
    this.tiles = {};
    this.gems = {};
  }

  async loadTileAssets(): Promise<void> {
    this.tiles.tile = await PIXI.Assets.load("/img/tile.png");
  }

  async loadGemAssets(): Promise<void> {
    this.gems.red = await PIXI.Assets.load("/img/gem-red.png");
    this.gems.blue = await PIXI.Assets.load("/img/gem-blue.png");
    this.gems.green = await PIXI.Assets.load("/img/gem-green.png");
    this.gems.purple = await PIXI.Assets.load("/img/gem-purple.png");
    this.gems.yellow = await PIXI.Assets.load("/img/gem-yellow.png");
  }

  getTileTexture(name: string): PIXI.Texture {
    console.assert(this.tiles[name], `Texture ${name} not found`);
    return this.tiles[name];
  }

  getGemTexture(name: string): PIXI.Texture {
    console.assert(this.gems[name], `Texture ${name} not found`);
    return this.gems[name];
  }
}
