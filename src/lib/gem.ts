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
  type: GemType;
  value: number;
  fadeDuration: number;
  fadeTween: TWEEDLE.Tween<PIXI.Sprite>;

  constructor(type: GemType, texture: PIXI.Texture) {
    this.sprite = this.initSprite(texture);
    this.type = type;
    this.value = 1;
    this.fadeDuration = 500;
    this.fadeTween = new TWEEDLE.Tween(this.sprite);
  }

  initSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    return sprite;
  }

  show(): void {
    this.sprite.alpha = 0;
    this.fadeTween.to({ alpha: 1.0 }, this.fadeDuration).start();
  }

  hide(): void {
    this.fadeTween
      .stop()
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: 0 }, this.fadeDuration)
      .start();
  }
}
