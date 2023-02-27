import type { Component } from "solid-js";

const BackgroundImage: Component = () => {
  const fadeIn = (img: HTMLImageElement) => {
    img.classList.remove("opacity-0");
    img.classList.add("transition-opacity");
    img.classList.add("duration-[2500ms]");
    img.classList.add("opacity-100");
  };

  return (
    <div class="absolute h-full w-full -z-10 select-none bg-black">
      <img
        class="object-cover h-full w-full opacity-0"
        onLoad={(e) => fadeIn(e.target as HTMLImageElement)}
        src="/img/bg01.png"
        alt="pyramids"
      />
    </div>
  );
};

export default BackgroundImage;
