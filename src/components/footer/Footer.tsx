import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <footer class={"w-full h-20 font-WorkSans flex flex-col gap-4 justify-center items-center"}>
      <p>
        Figma Design{" "}
        <a href={"https://www.figma.com/community/file/1104711594764419939"} target={"_blank"} rel={"noreferrer"} class={"text-darkGreen dark:text-green"}>
          (here)
        </a>
      </p>
      <p class={"text-matte dark:text-white"}>
        Made with <span class={"text-red"}>❤</span> by Naman{" "}
        <a href={"https://github.com/nparashar150/portfolio"} target={"_blank"} rel={"noreferrer"} class={"text-darkGreen dark:text-green"}>
          (Source Code)
        </a>
      </p>
    </footer>
  );
});
