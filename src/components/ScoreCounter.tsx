import type { Accessor, Component } from "solid-js";

type ScoreCounterProps = { score: Accessor<number> };

const ScoreCounter: Component<ScoreCounterProps> = (props) => {
  return (
    <div class="flex justify-center items-center flex-col h-1/6">
      <p class="text-white">Score {props.score()}</p>
    </div>
  );
};

export default ScoreCounter;
