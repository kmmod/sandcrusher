import * as PIXI from "pixi.js";
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
  gems: Gem[];
  nextTiles: Tile[];
  pathFinder: PathFinder;
  polyline: PIXI.Graphics;

  constructor(
    columns: number,
    rows: number,
    stage: PIXI.Container,
    assets: Assets,
    interactions: Interactions,
    pathFinder: PathFinder
  ) {
    this.columns = columns;
    this.rows = rows;
    this.stage = stage;
    this.assets = assets;
    this.interactions = interactions;
    this.pathFinder = pathFinder;
    this.tiles = [];
    this.gems = [];
    this.nextTiles = [];
    this.polyline = new PIXI.Graphics();
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
    this.clearTilesPathOver();
  }

  onPathFound(path: Node[]): void {
    this.clearTilesPathOver();

    path.forEach((node) => {
      const tile = this.tiles.find((tile) => tile.id === node.id);
      tile?.onPathOver();
    });
  }

  clearTilesPathOver(): void {
    this.tiles.forEach((tile) => tile.onPathOut());
  }

  getPreviewTiles(): Tile[] {
    const tilesWithPreview = this.tiles.filter((tile) => tile.gem?.preview);
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
    const tilesGrid = [
      this.tiles[cornerId],
      this.tiles[cornerId + 1],
      this.tiles[cornerId + this.columns],
      this.tiles[cornerId + this.columns + 1],
    ];

    const tiles = tilesGrid.filter(
      (tile) => tile?.gem?.preview == false && tile?.gem?.type === gemType
    );

    return tiles.length === 4 ? tiles : [];
  }
}
