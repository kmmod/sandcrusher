import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Gem } from "./gem";

export class Tile {
  id: number;
  sprite: PIXI.Sprite;
  idleAlpha: number;
  pathAlpha: number;
  alphaTween: TWEEDLE.Tween<PIXI.Sprite>;
  // bindPointerOver: () => void;
  // bindPointerOut: () => void;
  gem: Gem | undefined;
  onGemSet: () => void | undefined;

  constructor(id: number, texture: PIXI.Texture) {
    this.id = id;
    this.sprite = this.createSprite(texture);
    this.idleAlpha = 0.6;
    this.pathAlpha = 1.0;
    this.alphaTween = new TWEEDLE.Tween(this.sprite);
    // this.bindPointerOver = () => this.onPointerOver();
    // this.bindPointerOut = () => this.onPointerOut();
    // this.sprite.on("pointerover", this.bindPointerOver);
    // this.sprite.on("pointerout", this.bindPointerOut);
    this.gem = undefined;
    this.onGemSet = () => undefined;
  }

  createSprite(texture: PIXI.Texture): PIXI.Sprite {
    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.alpha = 0.5;
    sprite.interactive = true;
    return sprite;
  }

  addClickListener(
    callback: (event: PIXI.FederatedPointerEvent) => void
  ): void {
    this.sprite.on("pointerdown", callback);
  }

  addHoverListener(callback: () => void): void {
    this.sprite.on("pointerover", callback);
  }

  addGemSetListener(callback: () => void): void {
    this.onGemSet = callback;
  }

  isTaken(): boolean {
    return this.gem !== undefined && !this.gem.preview;
  }

  addGem(gem: Gem): void {
    if (this.gem?.preview) {
      this.addGemFromPreview();
      gem.destroy_instantly();
    } else {
      this.addNewGem(gem);
    }
  }

  addPreviewGem(gem: Gem): void {
    this.gem = gem;
    this.gem.setPreview();
    this.gem.setTransform(this.sprite.position, this.sprite.scale.x);
    this.gem.show();
  }

  setGem(gem: Gem): void {
    if (this.gem?.preview) this.gem.destroy_instantly();
    this.gem = gem;
    this.gem.slideTo(this.sprite.position);
  }

  addGemFromPreview(): void {
    if (!this.gem) return;
    this.gem.enlarge(this.sprite.scale.x);
  }

  addNewGem(gem: Gem): void {
    this.gem = gem;
    this.gem.setTransform(this.sprite.position, this.sprite.scale.x);
    this.gem.show();
  }

  updateGemTransform() {
    if (!this.gem) return;
    this.gem.setTransform(this.sprite.position, this.sprite.scale.x);
  }

  resetGemPosition(): void {
    if (!this.gem) return;
    this.onPathOut();
    new TWEEDLE.Tween(this.gem.sprite)
      .to({ x: this.sprite.x, y: this.sprite.y }, 200)
      .start();
  }

  removeGem(): void {
    this.gem = undefined;
  }

  destroyGem(): void {
    this.gem?.destroy();
    this.gem = undefined;
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

  onPathOver(): void {
    const initAlpha = this.sprite.alpha;
    this.alphaTween
      .from({ alpha: initAlpha })
      .to({ alpha: this.pathAlpha }, 100)
      .delay(0)
      .start();
  }

  onPathOut(): void {
    const initAlpha = this.sprite.alpha;
    this.alphaTween
      .from({ alpha: initAlpha })
      .to({ alpha: this.idleAlpha }, 250)
      .delay(0)
      .start();
  }

  setScale(scale: number): void {
    this.sprite.scale.set(scale);
  }

  setPosition(x: number, y: number): void {
    this.sprite.position.set(x, y);
  }
}
