import { Component, createSignal, onCleanup, onMount } from "solid-js";
import { Game } from "../lib/main";

type ScoreCounterProps = { game: Game };

const ScoreCounter: Component<ScoreCounterProps> = (props) => {
  const [score, setScore] = createSignal(0);

  onMount(() => {
    props.game.addScoreListener(setScore);
  });

  onCleanup(() => {
    props.game.removeScoreListener(setScore);
  });

  return (
    <div class="flex justify-center items-center flex-col h-1/6">
      <p class="text-white">Score {score()}</p>
    </div>
  );
};

export default ScoreCounter;
