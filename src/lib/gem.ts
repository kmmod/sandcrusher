import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { GemType } from "./types";

export class Gem {
  sprite: PIXI.Sprite;
  type: GemType;
  value: number;
  preview: boolean;
  scaleMod: number;
  alphaMod: number;
  fadeDuration: number;
  fadeTween: TWEEDLE.Tween<PIXI.Sprite>;
  slideDuration: number;
  slideTween: TWEEDLE.Tween<PIXI.Sprite>;
  scaleDuration: number;
  scaleTween: TWEEDLE.Tween<PIXI.Point>;
  destroyTween: TWEEDLE.Tween<PIXI.Sprite>;

  constructor(type: GemType, texture: PIXI.Texture) {
    this.sprite = this.initSprite(texture);
    this.type = type;
    this.value = 1;
    this.preview = false;
    this.scaleMod = 1;
    this.alphaMod = 1;
    this.fadeDuration = 500;
    this.slideDuration = 250;
    this.scaleDuration = 500;
    this.fadeTween = new TWEEDLE.Tween(this.sprite);
    this.slideTween = new TWEEDLE.Tween(this.sprite);
    this.scaleTween = new TWEEDLE.Tween(this.sprite.scale);
    this.destroyTween = new TWEEDLE.Tween(this.sprite);
  }

  initSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    return sprite;
  }

  setPreview(): void {
    this.preview = true;
    this.scaleMod = 0.3;
    this.alphaMod = 0.8;
  }

  setTransform(position: PIXI.Point, scale: number): void {
    this.sprite.position = position;
    this.sprite.scale.set(scale * this.scaleMod * 0.85);
  }

  enlarge(scale: number): void {
    this.preview = false;
    this.fadeTween
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: 1.0 }, this.fadeDuration)
      .start();
    this.scaleTween
      .from({ x: this.sprite.scale.x, y: this.sprite.scale.y })
      .to({ x: scale * 0.85, y: scale * 0.85 }, this.scaleDuration)
      .start();
    this.scaleMod = 1;
    this.alphaMod = 1;
  }

  slideTo(position: PIXI.Point): void {
    this.slideTween
      .stop()
      .from({ x: this.sprite.x, y: this.sprite.y })
      .to({ x: position.x, y: position.y }, this.slideDuration)
      .start();
  }

  show(): void {
    const curr_scale = this.sprite.scale.x;
    this.sprite.alpha = 0;
    this.fadeTween
      .to({ alpha: 1.0 * this.alphaMod }, this.fadeDuration)
      .start();
    this.scaleTween
      .from({ x: 0, y: 0 })
      .to({ x: curr_scale, y: curr_scale }, this.scaleDuration)
      .start();
  }

  hide(): void {
    this.fadeTween
      .stop()
      .from({ alpha: this.sprite.alpha })
      .to({ alpha: 0 }, this.fadeDuration)
      .start();
  }

  destroy_instantly(): void {
    this.sprite.destroy();
  }

  destroy(): void {
    this.destroyTween
      .from({ tint: this.sprite.tint })
      .to({ tint: 0xaaffff }, this.fadeDuration)
      .onComplete(() => this.sprite.destroy())
      .delay(this.fadeDuration * 0.25)
      .start();
  }
}
