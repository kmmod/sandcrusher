import { vi } from "vitest";
import "vitest-canvas-mock";
import "pixi.js-legacy";
import fetch from "node-fetch";

vi.mock("pixi.js", () => vi.importActual("pixi.js-legacy"));
// @ts-ignore
global.fetch = fetch;

