import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Tile } from "./tile";

export enum GemType {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Purple = "purple",
  Yellow = "yellow",
}

export class Gem {
  sprite: PIXI.Sprite;
  value: number;
  type: GemType;
  tile: Tile | undefined;

  constructor(type: GemType, texture: PIXI.Texture) {
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.type = type;
    this.value = 1;
    this.tile = undefined;
  }

  show(): void {
    this.sprite.alpha = 0;
    new TWEEDLE.Tween(this.sprite).to({ alpha: 1.0 }, 500).start();
  }
}
