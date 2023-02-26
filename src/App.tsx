import type { Component } from "solid-js";
import BackgroundImage from "./components/BackgroundImage";
import GameScreen from "./components/GameScreen";

const App: Component = () => {
  document.ondblclick = function (e) {
    e.preventDefault();
  };

  return (
    <div class="m-0">
      <BackgroundImage />
      <GameScreen />
    </div>
  );
};

export default App;
