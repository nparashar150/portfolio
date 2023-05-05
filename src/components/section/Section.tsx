import { Slot, component$ } from "@builder.io/qwik";

interface SectionProps {
  heading?: string;
  subHeading?: string;
  description?: string;
}

export default component$<SectionProps>(({ heading, subHeading, description }) => {
  return (
    <div class={"h-100 min-h-[80vh] mb-10 flex flex-col justify-start items-start"}>
      <div id={heading} class={"min-w-full flex flex-row justify-between items-center text-matte dark:text-white"}>
        <div class={"w-9/12 flex flex-col justify-center items-start text-matte dark:text-white"}>
          <h1 class={"text-[6rem] text-matte dark:text-white opacity-10"}>{heading}</h1>
          <p class={"text-[1.15rem] -mt-4 font-WorkSans text-matte dark:text-white"}>{subHeading}</p>
        </div>
        <p class={"w-3/12 text-right text-[1.15rem] leading-7 font-WorkSans text-matte dark:text-white"}>{description}</p>
      </div>
      <Slot />
    </div>
  );
});
