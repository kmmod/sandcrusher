import { Component, createSignal } from "solid-js";
import { Game } from "../lib/main";
import GameHeader from "./GameHeader";
import GameView from "./GameView";
import ScoreCounter from "./ScoreCounter";

const GameScreen: Component = () => {
  const [score, setScore] = createSignal(0);
  const game = new Game(8, 8, setScore);

  return (
    <div class="absolute w-full h-full">
      <GameHeader />
      <GameView game={game} />
      <ScoreCounter score={score} />
    </div>
  );
};

export default GameScreen;
