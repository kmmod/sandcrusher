import type { Component } from "solid-js";
import { createSignal, createEffect, onCleanup, onMount } from "solid-js";
import { Game } from "../lib/main";

const GameScreen: Component = () => {
  const game = new Game(10, 10);
  let container: HTMLDivElement;

  onMount(() => {
    game.setResizeElement(container);
    game.init();
  });

  return (
    <div class="absolute w-full h-full">
      <div class="flex justify-center items-center flex-col h-1/6">
        <p class="text-white">Sandcrusher</p>
      </div>
      {/* @ts-ignore */}
      <div
        ref={container}
        class="flex justify-center items-center p-2 w-full h-4/6"
      >
        {game.getView()}
      </div>
    </div>
  );
};

export default GameScreen;
