import { Component, createSignal } from "solid-js";

const HelpModal: Component = () => {
  const [showModal, setShowModal] = createSignal(false);

  const icon = () => {
    return showModal() ? "X" : "?";
  };

  const modal = () => {
    if (!showModal()) return null;
    return (
      <div class="absolute w-full h-full backdrop-blur-2xl">
        <div class="flex justify-center items-center flex-col w-full h-full p-5">
          <p class="text-white text-center m-5">
            Match four (or six) in rectangular pattern to crush the gems!
          </p>
          <div class="h-1/4 w-full flex justify-center">
            <img
              src="img/sandcrusher-01.gif"
              alt="sandcrusher"
              class="max-w-full max-h-full object-contain block"
            />
          </div>
          <p class="text-white text-center m-5">
            Link to github repository:{" "}
            <a href="https://github.com/kmmod/sandcrusher" target="_blank" class="underline">
              sandcrusher
            </a>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {modal()}
      <button
        class="absolute right-5 top-5 w-8 h-8 rounded-lg border-2 bg-gray-400/50"
        onclick={() => setShowModal(!showModal())}
      >
        <p class="text-white">{icon()}</p>
      </button>
    </div>
  );
};

export default HelpModal;
