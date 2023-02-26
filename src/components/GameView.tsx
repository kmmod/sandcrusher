import { Component, onCleanup } from "solid-js";
import { onMount } from "solid-js";
import { Game } from "../lib/main";

type GameViewProps = { game: Game };

const GameView: Component<GameViewProps> = (props) => {
  let container!: HTMLDivElement;

  onMount(() => {
    props.game.setResizeElement(container);
    props.game.init();
  });

  onCleanup(() => {
    props.game.resetBoard();
  });

  return (
    <div
      ref={container}
      class="flex justify-center items-center p-2 w-full h-4/6"
    >
      {props.game.getView()}
    </div>
  );
};

export default GameView;
