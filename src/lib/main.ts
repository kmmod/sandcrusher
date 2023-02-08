import * as PIXI from "pixi.js";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  bindDragEnd: () => void;
  bindDragMove: (event: PIXI.FederatedMouseEvent) => void;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | null;
  resizeElement: HTMLElement | null;

  constructor() {
    this.app = this.setPixiApp();
    this.resizeElement = null;
    this.dragTarget = null;
    this.bindResize = () => this.resize();
    this.bindDragEnd = () => this.onDragEnd();
    this.bindDragMove = (event) => this.onDragMove(event);
  }

  setPixiApp(): PIXI.Application {
    const options = {
      backgroundAlpha: 0.4,
    };
    return new PIXI.Application(options);
  }

  setResizeElement(id = "game-container"): void {
    this.resizeElement = document.getElementById(id) as HTMLElement;

    window.addEventListener("resize", this.bindResize);
    this.resize();
  }

  resize(): void {
    if (!this.resizeElement) return;

    const width = this.resizeElement.clientWidth;
    const height = this.resizeElement.clientHeight;

    if (width > height) {
      this.app.renderer.resize(height, height);
    } else {
      this.app.renderer.resize(width, width);
    }
  }

  init(): void {}

  update(): void {
    this.app.ticker.add(() => {});
  }

  initGems(): void {
    const gem_red = PIXI.Sprite.from("/img/gem-red.png");
    gem_red.anchor.set(0.5);

    gem_red.x = this.app.screen.width / 2;
    gem_red.y = this.app.screen.height / 2;

    gem_red.interactive = true;

    gem_red.on("pointerdown", () => {
      this.dragTarget = gem_red;
      this.app.stage.on("pointermove", this.bindDragMove);
    });

    this.app.stage.addChild(gem_red);

    this.app.stage.on("pointerup", this.bindDragEnd);
    this.app.stage.on("pointerupoutside", this.bindDragEnd);
  }

  onDragMove(event: PIXI.FederatedMouseEvent): void {
    if (!this.dragTarget) return;
    this.dragTarget.position.set(event.global.x, event.global.y);
  }

  onDragEnd(): void {
    this.app.stage.off("pointermove", this.bindDragMove);
    this.dragTarget = null;
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
