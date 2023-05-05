import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { default as SOCIAL_CONFIG } from "~/constants/social.config";

export default component$(() => {
  return (
    <div
      class={"h-100 min-h-[70vh] flex flex-row justify-between items-center"}
    >
      <div class={"w-7/12 flex flex-col justify-center items-start gap-4"}>
        <h1 class={"text-[6rem] text-matte"}>Hi, I am Naman</h1>
        <p class={"w-10/12 text-[1.15rem] leading-7 font-WorkSans text-matte"}>
          I'm a full stack Software Engineer. I am passionate about creating a
          user-centered design, gathering and translating user data into design
          decisions and products.
        </p>
        <div
          class={
            "mt-2 font-Vollkorn font-[1.15rem] flex justify-center items-center gap-8"
          }
        >
          {SOCIAL_CONFIG.map((social) => {
            return (
              <a
                target="_blank"
                rel="noreferrer"
                href={social.route}
                key={social.route}
                class={
                  "flex group hover:text-darkGreen justify-center items-center cursor-pointer group transition-all duration-300 ease-in-out"
                }
              >
                {social.label}
                <img
                  class={"group-hover:rotate-12"}
                  src="/top-arrow-right.svg"
                  alt="arrow"
                />
              </a>
            );
          })}
        </div>
      </div>
      <div
        class={
          "mr-[7rem] mt-[3rem] w-[20rem] h-[27rem] bg-matte rounded-t-full bg-cover overflow-hidden flex border-[1px]"
        }
      >
        <img
          src="https://nparashar150.com/static/media/AboutImage.9dccddd7.png"
          alt="Naman"
        />
      </div>
      <div class={"blurBgEffect"}></div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Naman | Home",
  meta: [
    {
      name: "description",
      content: "Naman | Home",
    },
  ],
};
