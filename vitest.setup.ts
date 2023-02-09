import { vi } from "vitest";
import "vitest-canvas-mock";
import "pixi.js-legacy";

vi.mock("pixi.js", () => vi.importActual("pixi.js-legacy"));

