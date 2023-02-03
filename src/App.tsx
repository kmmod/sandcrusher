import type { Component } from "solid-js";

const App: Component = () => {
  return (
    <div class="m-0">
      <div class="absolute h-full w-full -z-10">
        <img
          class="object-cover h-full w-full"
          src="/img/pyramids-background.png"
          alt="pyramids"
        />
      </div>
      <div class="w-full">
        <h1 class="text-3xl font-bold text-center">SandCrusher</h1>
      </div>
    </div>
  );
};

export default App;
