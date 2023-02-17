import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Tile } from "./tile";

export enum GemType {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Purple = "purple",
}

export class Gem {
  sprite: PIXI.Sprite;
  value: number;
  type: GemType;
  fadeTween: TWEEDLE.Tween<PIXI.Sprite>;

  constructor(type: GemType, texture: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.type = type;
    this.value = 1;
    this.fadeTween = new TWEEDLE.Tween(this.sprite);
  }

  show(): void {
    this.sprite.alpha = 0;
    this.fadeTween.to({ alpha: 1.0 }, 500).start();
  }

  destroy(callback: (gem: PIXI.Sprite, _: any) => void): void {
    this.fadeTween
      .stop()
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: 0 }, 500)
      .start()
      .onComplete(callback);
  }
}
