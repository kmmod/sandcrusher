import type { Component } from "solid-js";
import GameScreen from "./components/GameScreen";

const App: Component = () => {
  return (
    <div class="m-0">
      <div class="absolute h-full w-full -z-10">
        <img
          class="object-cover h-full w-full"
          src="/img/bg01.png"
          alt="pyramids"
        />
      </div>
      <div class="w-full">
        <h1 class="text-3xl font-bold text-center text-white">SandCrusher</h1>
      </div>
      <GameScreen />
    </div>
  );
};

export default App;
