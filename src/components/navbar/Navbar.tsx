import { component$, useSignal } from "@builder.io/qwik";
import { default as NAVBAR_CONFIG } from "~/constants/navbar.config";

export default component$(() => {
  const isDarkTheme = useSignal<boolean>(false);

  return (
    <nav
      class={
        "pl-20 flex justify-between items-center border-b-[1px] border-matte dark:border-white w-[100vw] -ml-20"
      }
    >
      <div
        onClick$={() => (window.location.pathname = "/")}
        class={"cursor-pointer pt-10 pb-8 text-[36px] text-matte dark:text-white"}
      >
        Naman <span class={"-ml-2 text-green"}>.</span>
      </div>
      <div class={"w-6/12 flex justify-between items-center text-matte dark:text-white"}>
        {NAVBAR_CONFIG.map((item) => {
          return (
            <div
              key={item.route}
              class={
                "pt-10 pb-8 text-[16px] font-WorkSans transition-all ease-in-out duration-300 hover:text-darkGreen dark:hover:text-green"
              }
            >
              <a href={item.route}>{item.label}</a>
            </div>
          );
        })}
        <div class={"border-l-[1px] border-matte dark:border-white py-9 px-6 min-w-[13%]"}>
          {!isDarkTheme.value ? (
            <img
              alt={"Theme Toggle"}
              class={"cursor-pointer -mb-2"}
              src={"/theme-toggle-to-dark.svg"}
              onClick$={() => (isDarkTheme.value = !isDarkTheme.value)}
            />
          ) : (
            <img
              alt={"Theme Toggle"}
              class={"cursor-pointer -mb-2"}
              src={"/theme-toggle-to-light.svg"}
              onClick$={() => (isDarkTheme.value = !isDarkTheme.value)}
            />
          )}
        </div>
      </div>
    </nav>
  );
});
