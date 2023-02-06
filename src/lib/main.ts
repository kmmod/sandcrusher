import * as PIXI from "pixi.js";

export class Game {
  app: PIXI.Application<PIXI.ICanvas>;
  count: number;
  countCallback: any;
  text: PIXI.Text;
  xVar: number;
  resizeElement: HTMLElement | null;
  bindResize: () => void;
  dragTarget: PIXI.Sprite | null;

  constructor(callback: any) {
    this.app = new PIXI.Application({ backgroundAlpha: 0.4 });
    this.count = 0;
    this.countCallback = callback;
    this.text = new PIXI.Text();
    this.xVar = 0;
    this.resizeElement = null;
    this.dragTarget = null;
    this.bindResize = () => this.resize();
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

    window.addEventListener("resize", this.bindResize);
    this.app.stage.addChild(graphics);
  }

  initGems(): void {
    const gem_red = PIXI.Sprite.from("/img/gem-gold.png");
    gem_red.anchor.set(0.5);

    gem_red.x = this.app.screen.width / 2;
    gem_red.y = this.app.screen.height / 2;

    gem_red.interactive = true;

    this.app.stage.addChild(gem_red);
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
    this.resizeElement = document.getElementById(
      "game-container"
    ) as HTMLElement;
    this.resize();
    this.initGems();
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
  }
}
