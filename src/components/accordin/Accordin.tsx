import { component$, useSignal } from "@builder.io/qwik";

interface AccordinProps {
  heading?: string;
  description?: string;
  defaultState?: boolean;
}

export default component$<AccordinProps>(({ heading, description, defaultState = false }) => {
  const isOpen = useSignal(defaultState);

  return (
    <div class={"w-full flex flex-col justify-start items-start"}>
      <div class={"pb-2 border-b-[1px] border-matte cursor-pointer w-full"} onClick$={() => (isOpen.value = !isOpen.value)}>
        <h1 class={"text-[3.25rem] text-matte dark:text-white"}>{heading}</h1>
      </div>
      <div class={`mt-4 ${!isOpen.value && "hidden"} w-7/12 flex flex-col justify-start items-start`}>
        <p class={"text-[1.05rem] leading-7 font-WorkSans text-matte dark:text-white"}>
          {description}
        </p>
      </div>
    </div>
  );
});
