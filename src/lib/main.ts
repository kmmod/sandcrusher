import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Gem, GemType } from "./gem";
import { Interactions } from "./interactions";
import { Tile } from "./tile";
import { fractionToAmount, randomItems, waitForMs } from "./utils";

enum Options {
  Columns = 8,
  Rows = 8,
  GemCount = 4,
  NewGemsPerTurn = 3,
  InitGemsFraction = 0.2,
}

export class Game {
  bindResize: () => void;
  bindOnGemSet: (tile: Tile) => void;
  app: PIXI.Application<PIXI.ICanvas>;
  assets: Assets;
  board: Board;
  interactions: Interactions;
  resizeElement: HTMLDivElement | undefined;

  constructor(columns: number = Options.Columns, rows: number = Options.Rows) {
    this.bindResize = () => this.resize();
    this.bindOnGemSet = (tile: Tile) => this.onGemSet(tile);
    this.resizeElement = undefined;
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.board = new Board(columns, rows);
    this.interactions = new Interactions(this.bindOnGemSet);
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
    await Promise.all([this.assets.loadGemAssets(), waitForMs(1000)]);
    const initialGemsCount = fractionToAmount(
      Options.InitGemsFraction,
      this.board.getTiles()
    );
    this.addGems(initialGemsCount);
    this.interactions.initStageInteractions(this.app.stage);
    this.interactions.update(this.app);
  }

  // TODO: Think about moving this to the Board class
  createTiles(): void {
    const tileTexture = this.assets.getTileTexture("tile");
    this.board.createTiles(tileTexture);

    const tiles = this.board.getTiles();

    tiles.forEach((tile) => {
      tile.show();
      tile.sprite.on("pointerdown", (event: PIXI.FederatedPointerEvent) =>
        this.interactions.onTileClicked(event, tile)
      );
      tile.sprite.on("pointerover", () => this.interactions.onTileHover(tile));
      this.app.stage.addChild(tile.sprite);
    });

    this.resize();
  }

  // TODO: Think about moving this to the Board class
  addGems(count: number): void {
    const randomTiles = randomItems(this.board.getEmptyTiles(), count);

    randomTiles.forEach((tile: Tile) => {
      const newGem = this.randomGem();
      tile.addGem(newGem, true);
      const matches = this.board.getMatches(tile);
      this.removeGems(matches);

      newGem.show();
      this.app.stage.addChild(newGem.sprite);
    });
  }
  //
  // TODO: Think about moving this to the Gem class
  randomGem(): Gem {
    const randomType = Math.floor(Math.random() * Options.GemCount);
    const gemType = Object.values(GemType)[randomType];
    const gemTexture = this.assets.getGemTexture(gemType);
    return new Gem(gemType, gemTexture);
  }

  onGemSet(tile: Tile): void {
    const matches = this.board.getMatches(tile);
    if (matches.length === 0) {
      this.addGems(Options.NewGemsPerTurn);
    } else {
      this.removeGems(matches);
    }
  }

  removeGems(tiles: Tile[]): void {
    tiles.forEach((tile: Tile) => this.removeGem(tile));
  }

  async removeGem(tile: Tile): Promise<void> {
    if (!tile.gem) return;
    tile.gem.hide();
    await waitForMs(tile.gem.fadeDuration);
    this.app.stage.removeChild(tile.gem.sprite);
    tile.removeGem();
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
