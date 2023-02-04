import type { Component } from "solid-js";
import { createSignal, createEffect } from "solid-js";
import { Game } from "../lib/main";

const GameScreen: Component = () => {
  const [count, setCount] = createSignal(0);
  const [xvar, setXvar] = createSignal(0);
  const game = new Game(setXvar);

  createEffect(() => game.setCount(count()));

  return (
    <>
    <h1 class="text-center">Communication between SolidJS component and PixiJS application</h1>
      <div class="backdrop-grayscale text-white text-center font-medium m-1">
        Set variable from component and pass to container {count()}
      </div>
      <div class="backdrop-hue-rotate-60 text-white text-center font-mediu m-1">
        Set variable in game container and pass to component {xvar()}
      </div>
      <div class="flex justify-center">
        <button
          class="bg-blue-50 backdrop-blur-lg text-center m-2 p-2"
          onClick={() => setCount(count() + 1)}
        >
          Click me: increment in component
        </button>
      </div>
      <div>{game.getView()}</div>;
    </>
  );
};

export default GameScreen;
