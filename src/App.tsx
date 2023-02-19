import type { Component } from "solid-js";
import GameScreen from "./components/GameScreen";

const App: Component = () => {
  document.ondblclick = function (e) {
    e.preventDefault();
  };

  return (
    <div class="m-0">
      <div class="absolute h-full w-full -z-10 select-none">
        <img
          class="object-cover h-full w-full"
          src="/img/bg01.png"
          alt="pyramids"
        />
      </div>
      <GameScreen />
    </div>
  );
};

export default App;
