import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <footer class={"flex h-20 w-full flex-col items-center justify-center gap-4 font-WorkSans"}>
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
