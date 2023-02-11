import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Gem, GemType } from "./gem";
import { timer } from "./utils";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  board: Board;
  assets: Assets;
  bindDragEnd: () => void;
  bindDragMove: (event: PIXI.FederatedMouseEvent) => void;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | undefined;
  resizeElement: HTMLDivElement | undefined;

  constructor(columns: number, rows: number) {
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.board = new Board(columns, rows);
    this.resizeElement = undefined;
    this.dragTarget = undefined;
    this.bindResize = () => this.resize();
    this.bindDragEnd = () => this.onDragEnd();
    this.bindDragMove = (event) => this.onDragMove(event);
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
    await this.assets.loadTileAssets();
    this.createBoard();
    await Promise.all([this.assets.loadGemAssets(), timer(1000)]);
    this.createGems();
  }

  createBoard(): void {
    const tileTexture = this.assets.getTileTexture("tile");
    this.board.createTiles(tileTexture);

    const size = this.app.renderer.width;
    this.board.updateTiles(size, size);

    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      tile.show();
      this.app.stage.addChild(tile.sprite);
    });
  }

  createGems(): void {
    for (let i = 0; i < 25; i++) {
      const randomType = Math.floor(Math.random() * 4);
      const gemType = Object.values(GemType)[randomType];

      const randomTile = Math.floor(Math.random() * this.board.tiles.length);

      const newGem = new Gem(gemType, this.assets.getGemTexture(gemType));
      if (this.board.tiles[randomTile].gem) {
        continue;
      }
      this.board.tiles[randomTile].addGem(newGem);
      newGem.show();
      this.app.stage.addChild(newGem.sprite);
    }
    // const gemRed = new Gem(GemType.Red, this.assets.getGemTexture(GemType.Red));
    // this.board.tiles[0].addGem(gemRed);
    // gemRed.show();
    // this.app.stage.addChild(gemRed.sprite);
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
