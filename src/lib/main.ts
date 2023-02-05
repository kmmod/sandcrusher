import * as PIXI from "pixi.js";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  count: number;
  countCallback: any;
  text: PIXI.Text;
  xVar: number;

  constructor(callback: any) {
    this.app = new PIXI.Application({backgroundAlpha: 0.4});
    this.count = 0;
    this.countCallback = callback;
    this.text = new PIXI.Text();
    this.xVar = 0;
    this.init();
    this.update();
  }

  init(): void {

    const graphics = new PIXI.Graphics();

    graphics.beginFill(0xde3249);
    graphics.drawRect(50, 50, 100, 100);
    graphics.endFill();

    graphics.interactive = true;
    graphics.cursor = "pointer";

    graphics.on("pointerdown", () => {
      this.xVar += 1;
      this.countCallback(this.xVar);
    });

    this.text = new PIXI.Text("Click me, increment in pixi", {
      fill: 0xffffff,
      fontSize: 20,
    });
    this.text.x = 65;
    this.text.y = 65;

    graphics.addChild(this.text);

    this.app.stage.addChild(graphics);
  }

  update(): void {
    this.app.ticker.add(() => {});
  }

  getView(): HTMLCanvasElement {
    return this.app.view as HTMLCanvasElement;
  }

  setCount(newCount: number): void {
    this.count = newCount;
    this.text.text = `Click me, increment in pixi \n ${this.count}`;
  }

  setResizeElement(): void {
    this.app.resizeTo = document.getElementById("game-container") as HTMLElement;
  }
}
