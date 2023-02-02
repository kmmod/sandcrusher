import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import { add } from "./lib/main";

const App: Component = () => {
  const sum = add(5, 2);

  return (
    <div class="m-0">
        <div class="absolute h-full w-full -z-10">
          <img class="object-cover h-full w-full" src ="/img/pyramids-background.png" alt="pyramids" />
        </div>
        <img src="/img/gem.png" alt="gem" />
        <h1 class="text-3xl font-bold underline">SandCrusher</h1>
    </div>
  );
};

export default App;
