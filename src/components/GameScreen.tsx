import type { Component } from "solid-js";
import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import { Game } from "../lib/main";

const GameScreen: Component = () => {
  const [count, setCount] = createSignal(0);
  const [xvar, setXvar] = createSignal(0);
  const game = new Game(setXvar);

  createEffect(() => game.setCount(count()));

  onMount(() => {
    game.setResizeElement();
  });

  return (
    <>
      <h1 class="text-center text-slate-500">
        Communication between SolidJS component and PixiJS application
      </h1>
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
      <div class="flex justify-center p-2 w-full">
      <div id="game-container" class="flex justify-center w-full lg:w-11/12">
        {game.getView()}
      </div>
      </div>
    </>
  );
};

export default GameScreen;
