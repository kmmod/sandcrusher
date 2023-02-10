import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";

export class Tile {
  id: number;
  sprite: PIXI.Sprite;
  idleAlpha: number;

  constructor(id: number, texture: PIXI.Texture) {
    this.id = id;
    this.sprite = this.createSprite(texture);
    this.idleAlpha = 0.5;
  }

  createSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.alpha = 0.5;
    return sprite;
  }

  show(): void {
    this.sprite.alpha = 0;
    const delay = Math.random() * 500;
    const duration = 1000 - delay;
    new TWEEDLE.Tween(this.sprite)
      .to({ alpha: this.idleAlpha }, duration)
      .delay(delay)
      .start();
  }

  setScale(scale: number): void {
    this.sprite.scale.set(scale);
  }

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }
}
