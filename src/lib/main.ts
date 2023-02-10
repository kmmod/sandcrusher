import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Board } from "./board";
import { timer } from "./utils";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  bindDragEnd: () => void;
  bindDragMove: (event: PIXI.FederatedMouseEvent) => void;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | undefined;
  resizeElement: HTMLDivElement | undefined;
  board: Board | undefined;
  columns: number;
  rows: number;
  assets: { textures: { [name: string]: PIXI.Texture } };

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.app = this.setPixiApp();
    this.resizeElement = undefined;
    this.dragTarget = undefined;
    this.bindResize = () => this.resize();
    this.bindDragEnd = () => this.onDragEnd();
    this.bindDragMove = (event) => this.onDragMove(event);
    this.board = undefined;
    this.assets = { textures: {} };
  }

  setPixiApp(): PIXI.Application {
    const options = {
      backgroundAlpha: 0,
    };

    const app = new PIXI.Application(options);
    app.ticker.add(() => TWEEDLE.Group.shared.update());

    return app;
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

    if (this.board) {
      const size = this.app.renderer.width;
      this.board.updateTiles(size, size);
    }
  }

  async init(): Promise<void> {
    await this.loadAssets();
    this.createBoard();
    await timer(1000);
    this.createGems();
  }

  async loadAssets(): Promise<void> {
    const tile = await PIXI.Assets.load("/img/tile.png");
    const gem_red = await PIXI.Assets.load("/img/gem-red.png");
    const gem_blue = await PIXI.Assets.load("/img/gem-blue.png");
    const gem_green = await PIXI.Assets.load("/img/gem-green.png");
    const gem_purple = await PIXI.Assets.load("/img/gem-purple.png");
    const gem_yellow = await PIXI.Assets.load("/img/gem-yellow.png");

    const textures = {
      tile,
      gem_red,
      gem_blue,
      gem_green,
      gem_purple,
      gem_yellow,
    };

    this.assets = {
      textures,
    };
  }

  createBoard(): void {
    this.board = new Board(this.columns, this.rows);

    const size = this.app.renderer.width;
    this.board.updateTiles(size, size);

    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      tile.show();
      this.app.stage.addChild(tile.sprite);
    });
  }

  createGems(): void {
    // init gem handler
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
    this.dragTarget = undefined;
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
