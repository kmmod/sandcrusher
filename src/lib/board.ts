import * as PIXI from "pixi.js";
import * as TWEEDLE from "tweedle.js";
import { Assets } from "./assets";
import { Gem } from "./gem";
import { Interactions } from "./interactions";
import { PathFinder, Node } from "./pathfinder";
import { Tile } from "./tile";
import { GemType, TileType, Options } from "./types";
import { fractionToAmount, randomItems } from "./utils";

export class Board {
  columns: number;
  rows: number;
  stage: PIXI.Container<PIXI.DisplayObject>;
  assets: Assets;
  interactions: Interactions;
  tiles: Tile[];
  nextTiles: Tile[];
  pathFinder: PathFinder;
  pathTrace: PIXI.Graphics;
  pathTraceTween: TWEEDLE.Tween<PIXI.Graphics>;
  updateScore: any;

  constructor(
    columns: number,
    rows: number,
    stage: PIXI.Container,
    assets: Assets,
    interactions: Interactions,
    pathFinder: PathFinder,
    updateScore: any
  ) {
    this.columns = columns;
    this.rows = rows;
    this.stage = stage;
    this.assets = assets;
    this.interactions = interactions;
    this.pathFinder = pathFinder;
    this.tiles = [];
    this.nextTiles = [];
    this.pathTrace = new PIXI.Graphics();
    this.pathTraceTween = new TWEEDLE.Tween(this.pathTrace);
    this.updateScore = updateScore;
  }

  resizeTiles(width: number, height: number): void {
    const stepX = width / this.columns;
    const stepY = height / this.rows;

    this.tiles.forEach((tile) => {
      const x = (tile.id % this.columns) * stepX + stepX / 2;
      const y = Math.floor(tile.id / this.columns) * stepY + stepY / 2;
      tile.setScale(stepX / tile.sprite.texture.width);
      tile.setPosition(x, y);
      tile.updateGemTransform();
    });
  }

  async initTiles(): Promise<void> {
    await this.assets.loadTileAssets();
    const tileTexture = this.assets.getTileTexture(TileType.Default);
    if (!tileTexture) throw new Error("Tile texture not found");

    this.tiles = new Array(this.columns * this.rows).fill(null).map((_, i) => {
      const tile = new Tile(i, tileTexture);

      tile.show();
      tile.addClickListener((event: PIXI.FederatedPointerEvent) =>
        this.interactions.onTileClicked(event, tile)
      );
      tile.addHoverListener(() => this.interactions.onTileHover(tile));
      tile.addGemSetListener(() => this.onGemSet(tile));

      this.stage.addChild(tile.sprite);

      return tile;
    });

    this.pathFinder.addPathFoundListener((path: Node[]) =>
      this.onPathFound(path)
    );

    this.stage.addChild(this.pathTrace);
  }

  async initGems(): Promise<void> {
    await this.assets.loadGemAssets();
    const initGemsCount = fractionToAmount(
      Options.InitGemsFraction,
      this.getTiles()
    );
    const randomTiles = randomItems(this.getEmptyTiles(), initGemsCount);
    this.addGems(randomTiles);
    const previeTiles = randomItems(
      this.getEmptyTiles(),
      Options.NewGemsPerTurn
    );
    this.addPreviewGems(previeTiles);
    this.pathFinder.reset(this.tiles);
  }

  reset(): void {
    this.tiles.forEach((tile) => {
      tile.gem?.sprite.destroy();
      tile.gem = undefined;
      tile.sprite.destroy();
    });
    this.tiles.length = 0;
    this.pathTrace.clear();
  }

  addGems(tiles: Tile[]): void {
    tiles.forEach((tile) => {
      const gem = this.randomGem();
      this.stage.addChild(gem.sprite);
      tile.addGem(gem);
    });
    const matches = this.getAllMatches(tiles);
    if (matches.length > 0) {
      this.removeGems(matches);
    }
  }

  addPreviewGems(tiles: Tile[]): void {
    tiles.forEach((tile) => {
      const gem = this.randomGem();
      tile.addPreviewGem(gem);
      this.stage.addChild(gem.sprite);
    });
  }

  removeGems(tiles: Tile[]): void {
    tiles.forEach((tile) => {
      if (tile.gem) {
        tile.destroyGem();
      }
    });
  }

  randomGem(): Gem {
    const randomType = Math.floor(Math.random() * Options.GemCount);
    const gemType = Object.values(GemType)[randomType];
    const gemTexture = this.assets.getGemTexture(gemType);
    if (!gemTexture) throw new Error("Gem texture not found");
    return new Gem(gemType, gemTexture);
  }

  onGemSet(tile: Tile): void {
    const matches = this.getMatches(tile);
    if (matches.length > 0) {
      this.updateScore(matches.length);
      this.removeGems(matches);
    } else {
      const previewTiles = this.getPreviewTiles();
      this.addGems(previewTiles);
      const randomTiles = randomItems(
        this.getEmptyTiles(),
        Options.NewGemsPerTurn
      );
      this.addPreviewGems(randomTiles);
    }
    this.pathFinder.reset(this.tiles);
    this.pathTrace.clear();
  }

  onPathFound(path: Node[]): void {
    this.pathTrace.clear();

    const tiles = path
      .map((node) => this.tiles.find((tile) => tile.id === node.id))
      .filter((tile) => tile !== undefined) as Tile[];

    if (tiles.length === 0) return;

    const scale = this.tiles[0].sprite.scale.x;
    this.pathTrace.lineStyle(10 * scale, 0xffffff, 0.5);

    const pathPoints = [];

    // add two points between each tile position to make the line smoother
    for (let i = 0; i < tiles.length - 1; i++) {
      const curr = tiles[i];
      const next = tiles[i + 1];

      const { x: x1, y: y1 } = curr.sprite.position;
      const { x: x4, y: y4 } = next.sprite.position;

      const width = x4 - x1;
      const height = y4 - y1;

      const p1 = new PIXI.Point(x1, y1);
      const p2 = new PIXI.Point(x1 + width / 3, y1 + height / 3);
      const p3 = new PIXI.Point(x1 + (width / 3) * 2, y1 + (height / 3) * 2);

      pathPoints.push(p1, p2, p3);
    }

    pathPoints.forEach((point: PIXI.Point) => {
      this.pathTrace.moveTo(point.x, point.y);
      this.pathTrace.drawCircle(point.x, point.y, 10 * scale);
    });

    this.pathTraceTween.from({ alpha: 0 }).to({ alpha: 1 }, 250).start();
  }

  getPreviewTiles(): Tile[] {
    const tilesWithPreview = this.tiles.filter((tile) => tile.gem?.preview);
    if (tilesWithPreview.length < Options.NewGemsPerTurn) {
      const count = Options.NewGemsPerTurn - tilesWithPreview.length;
      const randomTiles = randomItems(
        this.getEmptyTilesWithoutPreview(),
        count
      );
      tilesWithPreview.push(...randomTiles);
    }
    return tilesWithPreview;
  }

  getTiles(): Tile[] {
    return this.tiles;
  }

  getEmptyTiles(): Tile[] {
    return this.tiles.filter(
      (tile) => tile.gem === undefined || tile.gem?.preview
    );
  }

  getEmptyTilesWithoutPreview(): Tile[] {
    return this.tiles.filter((tile) => tile.gem === undefined);
  }

  getAllMatches(tiles: Tile[]): Tile[] {
    const matches = tiles.flatMap((tile) => this.getMatches(tile));
    return [...new Set(matches)];
  }

  getMatches(tile: Tile): Tile[] {
    // Returns array of tiles for removal if there is a match
    // Otherwise returns empty array
    if (tile.gem === undefined) return [];

    const gemType = tile.gem.type;

    const corners = [
      tile.id - this.columns - 1,
      tile.id - this.columns,
      tile.id - 1,
      tile.id,
    ];

    const candidates = corners.flatMap((cornerId) =>
      this.slidingWindow(cornerId, gemType)
    );

    return [...new Set(candidates)];
  }

  private slidingWindow(cornerId: number, gemType: GemType): Tile[] {
    // Look for matches in 2x2 square around cornerTile
    const topLeft = cornerId;
    const topRight = cornerId + 1;
    const bottomLeft = cornerId + this.columns;
    const bottomRight = cornerId + this.columns + 1;

    if (
      !this.isOnSameRow(topLeft, topRight) ||
      !this.isOnSameRow(bottomLeft, bottomRight)
    ) {
      return [];
    }

    const tilesGrid = [
      this.tiles[topLeft],
      this.tiles[topRight],
      this.tiles[bottomLeft],
      this.tiles[bottomRight],
    ];

    const tiles = tilesGrid.filter(
      (tile) => tile?.gem?.preview == false && tile?.gem?.type === gemType
    );

    return tiles.length === 4 ? tiles : [];
  }

  private isOnSameRow(tileId: number, cornerId: number): boolean {
    return (
      Math.floor(tileId / this.columns) === Math.floor(cornerId / this.columns)
    );
  }
}
