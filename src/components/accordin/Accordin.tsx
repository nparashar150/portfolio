import { component$, useSignal } from "@builder.io/qwik";

interface AccordinProps {
  heading?: string;
  description?: string;
  defaultState?: boolean;
}

export default component$<AccordinProps>(({ heading, description, defaultState = false }) => {
  const isOpen = useSignal(defaultState);

  return (
    <div class={"flex w-full flex-col items-start justify-start"}>
      <div class={"flex w-full cursor-pointer items-center justify-between border-b-[1px] border-matte pb-2"} onClick$={() => (isOpen.value = !isOpen.value)}>
        <h1 class={"text-[3.25rem] text-matte dark:text-white"}>{heading}</h1>
        <img src={"/arrow-down-icon.svg"} alt="arrow" class={`transform ${isOpen.value && "rotate-180"}`} />
      </div>
      <div class={`mt-4 ${!isOpen.value && "hidden"} w-100 flex flex-col items-start justify-start sm:w-7/12`}>
        <p class={"font-WorkSans text-[1.05rem] leading-7 text-matte dark:text-white"}>{description}</p>
      </div>
    </div>
  );
});
