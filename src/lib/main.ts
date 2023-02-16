import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Gem, GemType } from "./gem";
import { Tile } from "./tile";
import { lerpPosition, randomItems, timer } from "./utils";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  assets: Assets;
  board: Board;
  inputPosition: PIXI.Point;
  dragElement: PIXI.Sprite | undefined;
  resizeElement: HTMLDivElement | undefined;
  currentSetTile: Tile | undefined;
  currentHoverTile: Tile | undefined;
  bindResize: () => void;
  bindDragEnd: () => void;

  constructor(columns: number, rows: number) {
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.board = new Board(columns, rows);
    this.inputPosition = new PIXI.Point(0, 0);
    this.dragElement = undefined;
    this.resizeElement = undefined;
    this.currentSetTile = undefined;
    this.currentHoverTile = undefined;
    this.bindResize = () => this.resize();
    this.bindDragEnd = () => this.onDragEnd();
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
    this.board.resizeTiles(size, size);
  }

  async init(): Promise<void> {
    await this.assets.loadTileAssets();
    this.createTiles();
    await Promise.all([this.assets.loadGemAssets(), timer(1000)]);
    this.addGems(15);
    this.addStageInteractions();
    this.update();
  }

  addStageInteractions(): void {
    this.app.stage.on("pointerup", this.bindDragEnd);
    this.app.stage.on("pointerupoutside", this.bindDragEnd);
    this.app.stage.on("pointermove", (event: PIXI.FederatedMouseEvent) => {
      this.inputPosition.x = event.global.x;
      this.inputPosition.y = event.global.y;
    });
    this.app.stage.on("touchmove", (event: PIXI.FederatedPointerEvent) => {
      this.inputPosition.x = event.global.x;
      this.inputPosition.y = event.global.y;
    });
  }

  createTiles(): void {
    const tileTexture = this.assets.getTileTexture("tile");
    this.board.createTiles(tileTexture);

    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      tile.show();
      tile.sprite.on("pointerdown", (event: PIXI.FederatedPointerEvent) =>
        this.pointerDown(event, tile)
      );
      tile.sprite.on("pointerover", () => this.pointerOver(tile));
      this.app.stage.addChild(tile.sprite);
    });

    this.resize();
  }

  addGems(count: number): void {
    const randomTiles = randomItems(this.board.getEmptyTiles(), count);

    randomTiles.forEach((tile: Tile) => {
      const newGem = this.randomGem();
      tile.addGem(newGem, true);
      this.onGemAdded(tile);

      newGem.show();
      this.app.stage.addChild(newGem.sprite);
    });
  }

  removeGems(tiles: Tile[]): void {
    tiles.forEach((tile) => {
      const gem = tile.gem;
      if (!gem) return;

      tile.removeGem();
      this.app.stage.removeChild(gem.sprite);
    });
  }

  onGemAdded(tile: Tile): void {
    const tiles = this.board.getMatches(tile);

    tiles.forEach((tile: Tile) => {
      if (!tile.gem) return;
      const gem: Gem = tile.gem;
      tile.removeGem();
      this.app.stage.removeChild(gem.sprite);
    });
  }

  randomGem(): Gem {
    const gemCount = 4;
    const randomType = Math.floor(Math.random() * gemCount);
    const gemType = Object.values(GemType)[randomType];
    const gemTexture = this.assets.getGemTexture(gemType);
    return new Gem(gemType, gemTexture);
  }

  pointerDown(event: PIXI.FederatedPointerEvent, tile: Tile): void {
    this.inputPosition.x = event.global.x;
    this.inputPosition.y = event.global.y;
    if (!tile.gem) return;
    this.currentSetTile = tile;
    this.dragElement = tile.gem.sprite;
  }

  pointerOver(tile: Tile): void {
    this.currentHoverTile = tile;
  }

  update(): void {
    this.app.ticker.add((delta) => {
      if (this.dragElement) {
        const interpolatedPoint = lerpPosition(
          this.dragElement.position,
          this.inputPosition,
          delta * 0.5
        );

        this.dragElement.position.set(interpolatedPoint.x, interpolatedPoint.y);
      }
    });
  }

  onDragEnd(): void {
    if (this.dragElement && this.currentSetTile?.gem) {
      if (this.currentHoverTile?.gem) {
        this.currentSetTile.resetGemPosition();
      } else if (this.currentHoverTile) {
        this.currentHoverTile.addGem(this.currentSetTile.gem, false);
        this.currentSetTile.removeGem();
        this.onGemAdded(this.currentHoverTile);
        this.addGems(3);
      } else {
        console.warn("Not valid interaction");
      }
    }

    this.currentSetTile = undefined;
    this.dragElement = undefined;
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
