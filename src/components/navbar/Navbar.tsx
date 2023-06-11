import { $, component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import { default as NAVBAR_CONFIG } from "~/constants/navbar.config";

export default component$(() => {
  const isDarkTheme = useSignal<boolean>(false);

  const toggleDarkTheme = $(() => {
    document.body.classList.toggle("dark");
    isDarkTheme.value = !isDarkTheme.value;
  });

  useVisibleTask$(async () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark");
      isDarkTheme.value = true;
    }
  });

  return (
    <nav class={"-ml-10 mb-24 flex w-[100vw] items-center justify-between border-b-[1px] border-matte dark:border-white sm:-ml-20 sm:mb-0 sm:pl-20"}>
      <div onClick$={() => (window.location.pathname = "/")} class={"cursor-pointer pb-8 pl-6 pt-10 text-[36px] text-matte dark:text-white sm:pl-0"}>
        Naman <span class={"-ml-2 text-green"}>.</span>
      </div>
      <div class={`flex w-6/12 ${NAVBAR_CONFIG.length > 0 ? "justify-between" : "justify-end"} items-center text-matte dark:text-white`}>
        {NAVBAR_CONFIG.map((item) => {
          return (
            <div key={item.route} class={"pb-8 pt-10 font-WorkSans text-[16px] transition-all duration-300 ease-in-out hover:text-darkGreen dark:hover:text-green"}>
              <a href={item.route}>{item.label}</a>
            </div>
          );
        })}
        <div class={"min-w-[13%] border-l-[1px] border-matte px-6 py-9 dark:border-white"}>
          {!isDarkTheme.value ? (
            <img alt={"Theme Toggle"} class={"-mb-2 mx-auto cursor-pointer"} src={"/theme-toggle-to-dark.svg"} onClick$={() => toggleDarkTheme()} />
          ) : (
            <img alt={"Theme Toggle"} class={"-mb-2 mx-auto cursor-pointer"} src={"/theme-toggle-to-light.svg"} onClick$={() => toggleDarkTheme()} />
          )}
        </div>
      </div>
    </nav>
  );
});
