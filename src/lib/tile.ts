import * as PIXI from "pixi.js";

export class Tile {
  id: number;
  sprite: PIXI.Sprite;

  constructor(id: number, texture: PIXI.Texture) {
    this.id = id;
    this.sprite = this.createSprite(texture);
  }

  createSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    return sprite;
  }

  setScale(scale: number): void {
    this.sprite.scale.set(scale);
  }

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }
}
