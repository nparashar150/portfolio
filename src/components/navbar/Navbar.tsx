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
    <nav class={"flex justify-between items-center border-b-[1px] border-matte dark:border-white -ml-10 mb-24 sm:mb-0 w-[100vw] sm:-ml-20 sm:pl-20"}>
      <div onClick$={() => (window.location.pathname = "/")} class={"cursor-pointer pl-6 pt-10 pb-8 text-[36px] text-matte dark:text-white sm:pl-0"}>
        Naman <span class={"-ml-2 text-green"}>.</span>
      </div>
      <div class={`w-6/12 flex ${NAVBAR_CONFIG.length > 0 ? "justify-between" : "justify-end"} items-center text-matte dark:text-white`}>
        {NAVBAR_CONFIG.map((item) => {
          return (
            <div key={item.route} class={"pt-10 pb-8 text-[16px] font-WorkSans transition-all ease-in-out duration-300 hover:text-darkGreen dark:hover:text-green"}>
              <a href={item.route}>{item.label}</a>
            </div>
          );
        })}
        <div class={"border-l-[1px] border-matte dark:border-white py-9 px-6 min-w-[13%]"}>
          {!isDarkTheme.value ? (
            <img alt={"Theme Toggle"} class={"cursor-pointer -mb-2"} src={"/theme-toggle-to-dark.svg"} onClick$={() => toggleDarkTheme()} />
          ) : (
            <img alt={"Theme Toggle"} class={"cursor-pointer -mb-2"} src={"/theme-toggle-to-light.svg"} onClick$={() => toggleDarkTheme()} />
          )}
        </div>
      </div>
    </nav>
  );
});
