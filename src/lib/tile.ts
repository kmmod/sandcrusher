import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";

export class Tile {
  id: number;
  sprite: PIXI.Sprite;
  idleAlpha: number;
  hoverAlpha: number;
  alphaTween: TWEEDLE.Tween<PIXI.Sprite>;
  bindPointerOver: () => void;
  bindPointerOut: () => void;

  constructor(id: number, texture: PIXI.Texture) {
    this.id = id;
    this.sprite = this.createSprite(texture);
    this.idleAlpha = 0.6;
    this.hoverAlpha = 0.8;
    this.alphaTween = new TWEEDLE.Tween(this.sprite);
    this.bindPointerOver = () => this.onPointerOver();
    this.bindPointerOut = () => this.onPointerOut();
    this.sprite.on("pointerover", this.bindPointerOver);
    this.sprite.on("pointerout", this.bindPointerOut);
  }

  createSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.alpha = 0.5;
    sprite.interactive = true;
    return sprite;
  }

  show(): void {
    this.sprite.alpha = 0;
    const delay = Math.random() * 500;
    const duration = 1000 - delay;

    this.alphaTween
      .to({ alpha: this.idleAlpha }, duration)
      .delay(delay)
      .start();
  }

  onPointerOver(): void {
    this.alphaTween.stop();
    this.alphaTween
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: this.hoverAlpha }, 200)
      .delay(0)
      .start();
  }

  onPointerOut(): void {
    this.alphaTween.stop();
    this.alphaTween
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: this.idleAlpha }, 1000)
      .start();
  }

  setScale(scale: number): void {
    this.sprite.scale.set(scale);
  }

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }
}
