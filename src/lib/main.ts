import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Gem, GemType } from "./gem";
import { Tile } from "./tile";
import { lerpPosition, percentToAmount, randomItems, timer } from "./utils";

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
    const initialGemsCount = percentToAmount(0.2, this.board.getTiles());
    this.addGems(initialGemsCount);
    this.addStageInteractions();
    this.update();
  }

  // TODO: Think about moving this to separate class.
  addStageInteractions(): void {
    this.app.stage.on("pointerup", this.bindDragEnd);
    this.app.stage.on("pointerupoutside", this.bindDragEnd);
    // TODO: Do we need both pointer and touch events? Should pointer events
    // passed as FederatedPointerEvent be enough?
    this.app.stage.on("pointermove", (event: PIXI.FederatedMouseEvent) => {
      this.inputPosition.x = event.global.x;
      this.inputPosition.y = event.global.y;
    });
    this.app.stage.on("touchmove", (event: PIXI.FederatedPointerEvent) => {
      this.inputPosition.x = event.global.x;
      this.inputPosition.y = event.global.y;
    });
  }

  // TODO: Think about moving this to the Board class
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

  // TODO: Think about moving this to the Board class - think about creating
  // InteractionManager class or StageController class to move interaction
  // logic to.
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

  // TODO: Think about moving this to the Board class
  // TODO: NOT USED LOL
  // removeGems(tiles: Tile[]): void {
  //   tiles.forEach((tile) => {
  //     const gem = tile.gem;
  //     if (!gem) return;
  //
  //     const deleteMe = (gem: PIXI.Sprite, _: any) => {
  //       console.log(gem, _);
  //     };
  //
  //     gem.destroy(deleteMe);
  //     tile.removeGem();
  //     // this.app.stage.removeChild(gem.sprite);
  //   });
  // }

  removeGemFromBoard(gem: PIXI.Sprite, _: any): void {
    this.app.stage.removeChild(gem);
  }

  // TODO: This could belong to interaction manager class.
  onGemAdded(tile: Tile): void {
    const tiles = this.board.getMatches(tile);

    tiles.forEach((tile: Tile) => {
      if (!tile.gem) return;

      // const deleteMe = (gem: PIXI.Sprite, _: any) => {
      //   console.log(gem, _);
      // };

      const deleteMe = (gem: PIXI.Sprite, _: any) =>
        this.removeGemFromBoard(gem, _);

      const gem: Gem = tile.gem;

      gem.destroy(deleteMe);
      tile.removeGem();
      // this.app.stage.removeChild(gem.sprite);
    });

    //   if (tiles.length === 0) {
    //     this.addGems(3)
    //   };
  }

  // TODO: Think about moving this to the Gem class
  randomGem(): Gem {
    const gemCount = 4;
    const randomType = Math.floor(Math.random() * gemCount);
    const gemType = Object.values(GemType)[randomType];
    const gemTexture = this.assets.getGemTexture(gemType);
    return new Gem(gemType, gemTexture);
  }

  // TODO: StageController class?
  pointerDown(event: PIXI.FederatedPointerEvent, tile: Tile): void {
    // TODO: Input position assignment repeated in pointermove event.
    // Should we move it to a separate method? Is there a way to simplify
    // assigment - check PIXI docs for setting Point values.
    this.inputPosition.x = event.global.x;
    this.inputPosition.y = event.global.y;
    if (!tile.gem) return;
    this.currentSetTile = tile;
    this.dragElement = tile.gem.sprite;
    // TODO: Set sprite Z index to the top.
  }

  // TODO: StageController class?
  pointerOver(tile: Tile): void {
    this.currentHoverTile = tile;
  }

  // TODO: StageController class?
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

  // TODO: StageController class?
  onDragEnd(): void {
    if (this.dragElement && this.currentSetTile?.gem) {
      if (this.currentHoverTile?.gem) {
        this.currentSetTile.resetGemPosition();
      } else if (this.currentHoverTile) {
        this.currentHoverTile.addGem(this.currentSetTile.gem, false);
        this.currentSetTile.removeGem();

        const tiles = this.board.getMatches(this.currentHoverTile);
        this.onGemAdded(this.currentHoverTile);
        if (tiles.length === 0) {
          this.addGems(3);
        }
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
