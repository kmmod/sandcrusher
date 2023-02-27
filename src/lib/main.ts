import * as PIXI from "pixi.js";
import { Setter } from "solid-js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Board } from "./board";
import { Interactions } from "./interactions";
import { PathFinder } from "./pathfinder";
import { Options } from "./types";

export class Game {
  columns: number;
  rows: number;
  bindResize: () => void;
  app: PIXI.Application<PIXI.ICanvas>;
  assets: Assets;
  board: Board;
  interactions: Interactions;
  resizeElement: HTMLDivElement | undefined;
  pathFinder: any;

  constructor(
    columns: number = Options.Columns,
    rows: number = Options.Rows,
  ) {
    this.columns = columns;
    this.rows = rows;
    this.bindResize = () => this.resize();
    this.resizeElement = undefined;
    this.app = this.setPixiApp();
    this.assets = new Assets();
    this.pathFinder = new PathFinder(columns);
    this.interactions = new Interactions(this.pathFinder);
    this.board = new Board(
      this.columns,
      this.rows,
      this.app.stage,
      this.assets,
      this.interactions,
      this.pathFinder,
    );
  }

  setPixiApp(): PIXI.Application {
    const options = {
      backgroundAlpha: 0,
      antialias: true,
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

  addScoreListener(listener: (score: number) => void): void {
    this.board.addScoreUpdateListener(listener);
  }

  removeScoreListener(setScore: Setter<number>) {
    this.board.removeScoreUpdateListener(setScore);
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
    this.resize();
    await this.board.initGems();
    this.interactions.initStageInteractions(this.app.stage);
    this.interactions.update(this.app);
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }

  resetBoard(): void {
    this.board.reset();
  }
}
