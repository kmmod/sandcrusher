import * as PIXI from "pixi.js";
import { Board } from "./board";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  bindDragEnd: () => void;
  bindDragMove: (event: PIXI.FederatedMouseEvent) => void;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | null;
  resizeElement: HTMLDivElement | null;
  board: Board;

  constructor(columns: number, rows: number) {
    this.app = this.setPixiApp();
    this.resizeElement = null;
    this.dragTarget = null;
    this.bindResize = () => this.resize();
    this.bindDragEnd = () => this.onDragEnd();
    this.bindDragMove = (event) => this.onDragMove(event);
    // before creating the board all the assets should be loaded
    this.board = new Board(columns, rows);
  }

  setPixiApp(): PIXI.Application {
    const options = {
      backgroundAlpha: 0.4,
    };
    return new PIXI.Application(options);
  }

  setResizeElement(container: HTMLDivElement): void {
    this.resizeElement = container;

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

    const size = this.app.renderer.width;
    this.board.updateTiles(size, size);
  }

  init(): void {
    this.renderTiles();
  }

  renderTiles(): void {
    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      this.app.stage.addChild(tile.sprite);
    });
  }

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
