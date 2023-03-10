import * as PIXI from "pixi.js";
import { PathFinder } from "./pathfinder";
import { Tile } from "./tile";
import { lerpPosition } from "./utils";

export class Interactions {
  bindDragEnd: () => void;
  inputPosition: PIXI.Point;
  dragSprite: PIXI.Sprite | undefined;
  currentSetTile: Tile | undefined;
  currentHoverTile: Tile | undefined;
  pathFinder: PathFinder;

  constructor(pathFinder: PathFinder) {
    this.pathFinder = pathFinder;
    this.bindDragEnd = () => this.onDragEnd();
    this.inputPosition = new PIXI.Point(0, 0);
    this.dragSprite = undefined;
    this.currentSetTile = undefined;
    this.currentHoverTile = undefined;
  }

  initStageInteractions(stage: PIXI.Container): void {
    stage.sortableChildren = true;
    stage.on("pointerup", this.bindDragEnd);
    stage.on("pointerupoutside", this.bindDragEnd);
    stage.on("pointermove", (event: PIXI.FederatedMouseEvent) => {
      this.inputPosition.x = event.global.x;
      this.inputPosition.y = event.global.y;
    });
  }

  update(app: PIXI.Application): void {
    app.ticker.add((delta) => {
      if (this.dragSprite) {
        const interpolatedPoint = lerpPosition(
          this.dragSprite.position,
          this.inputPosition,
          delta * 0.5
        );
        this.dragSprite.position.set(interpolatedPoint.x, interpolatedPoint.y);
      }
    });
  }

  onTileClicked(event: PIXI.FederatedPointerEvent, tile: Tile): void {
    this.inputPosition.x = event.global.x;
    this.inputPosition.y = event.global.y;
    if (!tile.gem || tile.gem.preview) return;
    this.currentSetTile = tile;
    this.dragSprite = tile.gem.sprite;
    this.dragSprite.zIndex = 1000;
  }

  onTileHover(tile: Tile): void {
    this.currentHoverTile = tile;
    if (this.currentSetTile && this.dragSprite) {
      this.pathFinder.findPath(this.currentSetTile, tile);
    }
  }

  onDragEnd(): void {
    if (this.dragSprite && this.currentSetTile?.gem) {
      if (
        this.pathFinder.pathFound === false ||
        (this.currentHoverTile?.gem &&
          this.currentHoverTile?.gem.preview === false)
      ) {
        this.currentSetTile.resetGemPosition();
      } else if (this.currentHoverTile) {
        this.currentHoverTile.setGem(this.currentSetTile.gem);
        this.currentSetTile.removeGem();
        this.currentHoverTile.onGemSet();
      } else {
        console.warn("Not valid interaction");
      }
      this.dragSprite.zIndex = 0;
    }

    this.currentSetTile = undefined;
    this.dragSprite = undefined;
  }
}
