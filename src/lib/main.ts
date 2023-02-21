import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Interactions } from "./interactions";
import { Options } from "./types";

export class Game {
  bindResize: () => void;
  app: PIXI.Application<PIXI.ICanvas>;
  assets: Assets;
  board: Board;
  interactions: Interactions;
  resizeElement: HTMLDivElement | undefined;

  constructor(columns: number = Options.Columns, rows: number = Options.Rows) {
    this.bindResize = () => this.resize();
    this.resizeElement = undefined;
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.interactions = new Interactions();
    this.board = new Board(
      columns,
      rows,
      this.app.stage,
      this.assets,
      this.interactions
    );
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
    await this.board.initTiles();
    await this.board.initGems();
    this.interactions.initStageInteractions(this.app.stage);
    this.interactions.update(this.app);
    this.resize();
  }

  // onGemSet(tile: Tile): void {
  //   const matches = this.board.getMatches(tile);
  //   if (matches.length === 0) {
  //     const nextTiles = this.board.getNextTiles();
  //     // if (nextTiles.length === 0) DEFEAT
  //     this.addGems(nextTiles);
  //     this.board.setNextTiles(this.randomGems());
  //     this.addGemsPreview(this.board.getNextTiles());
  //   } else {
  //     this.removeGems(matches);
  //   }
  // }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }
}
