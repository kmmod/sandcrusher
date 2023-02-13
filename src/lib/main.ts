import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Gem, GemType } from "./gem";
import { Tile } from "./tile";
import { randomItems, timer } from "./utils";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  board: Board;
  assets: Assets;
  bindDragEnd: () => void;
  bindDragMove: (event: PIXI.FederatedMouseEvent) => void;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | undefined;
  resizeElement: HTMLDivElement | undefined;
  currentSetTile: Tile | undefined;
  currentHoverTile: Tile | undefined;

  constructor(columns: number, rows: number) {
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.board = new Board(columns, rows);
    this.resizeElement = undefined;
    this.dragTarget = undefined;
    this.currentSetTile = undefined;
    this.currentHoverTile = undefined;
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

    const size = this.app.renderer.width;
    this.board.updateTiles(size, size);
  }

  async init(): Promise<void> {
    await this.assets.loadTileAssets();
    this.createBoard();
    await Promise.all([this.assets.loadGemAssets(), timer(1000)]);
    this.createGems();
    this.createInteractions();
  }

  createBoard(): void {
    const tileTexture = this.assets.getTileTexture("tile");
    this.board.createTiles(tileTexture);

    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      tile.show();
      tile.sprite.on("pointerdown", () => this.pointerDown(tile));
      tile.sprite.on("pointerover", () => this.pointerOver(tile));
      this.app.stage.addChild(tile.sprite);
    });

    this.resize();
  }

  createGems(): void {
    const randomTiles = randomItems(this.board.tiles, 15);
    randomTiles.forEach((tile: Tile) => {
      const randomType = Math.floor(Math.random() * 4);
      const gemType = Object.values(GemType)[randomType];
      const newGem = new Gem(gemType, this.assets.getGemTexture(gemType));
      tile.addGem(newGem);

      newGem.show();
      this.app.stage.addChild(newGem.sprite);
    });
  }

  createInteractions(): void {
    this.app.stage.on("pointerup", this.bindDragEnd);
    this.app.stage.on("pointerupoutside", this.bindDragEnd);
  }

  pointerDown(tile: Tile): void {
    if (!tile.gem) return;
    this.currentSetTile = tile;
    this.dragTarget = tile.gem.sprite;
    this.app.stage.on("pointermove", this.bindDragMove);
    console.log(tile);
  }

  pointerOver(tile: Tile): void {
    this.currentHoverTile = tile;
    console.log(tile);
  }

  update(): void {
    this.app.ticker.add(() => {});
  }

  onDragMove(event: PIXI.FederatedMouseEvent): void {
    if (!this.dragTarget) return;
    this.dragTarget.position.set(event.global.x, event.global.y);
  }

  onDragEnd(): void {
    this.app.stage.off("pointermove", this.bindDragMove);
    if (
      this.dragTarget &&
      this.currentSetTile &&
      this.currentHoverTile &&
      this.currentHoverTile.gem === undefined
    ) {
      this.currentHoverTile.addGem(this.currentSetTile!.gem!);
      this.currentSetTile!.removeGem();
    } else if (
      this.dragTarget &&
      this.currentHoverTile &&
      this.currentHoverTile.gem
    ) {
      this.dragTarget.position.set(
        this.currentSetTile!.sprite.position.x,
        this.currentSetTile!.sprite.position.y
      );
    }
    this.currentSetTile = undefined;
    this.dragTarget = undefined;
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
