import { Component } from "solid-js";
import { Game } from "../lib/main";
import GameHeader from "./GameHeader";
import GameView from "./GameView";
import HelpModal from "./HelpModal";
import ScoreCounter from "./ScoreCounter";

export type GameViewProps = { game: Game };

const GameScreen: Component = () => {
  const game = new Game(8, 8);

  return (
    <div class="absolute w-full h-full">
      <HelpModal />
      <GameHeader />
      <GameView game={game} />
      <ScoreCounter game={game} />
    </div>
  );
};

export default GameScreen;
