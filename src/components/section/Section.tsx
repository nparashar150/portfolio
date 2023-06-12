import { Slot, component$ } from "@builder.io/qwik";

interface SectionProps {
  heading?: string;
  subHeading?: string;
  description?: string;
}

export default component$<SectionProps>(({ heading, subHeading, description }) => {
  return (
    <div class={"h-100 my-16 flex min-h-[80vh] flex-col items-start justify-start sm:mb-10 sm:mt-0"}>
      <div id={heading} class={"flex min-w-full flex-row items-center justify-between text-matte dark:text-white"}>
        <div class={"flex w-9/12 flex-col items-start justify-center text-matte dark:text-white"}>
          {heading?.split(/\r?\n/).map((line, index) => (
            <h1 key={index} class={"text-[4.5rem] text-matte opacity-10 dark:text-white sm:text-[6rem]"}>
              {line}
            </h1>
          ))}
          <p class={"font-WorkSans text-[1.15rem] text-matte dark:text-white"}>{subHeading}</p>
        </div>
        <p class={"w-3/12 text-right font-WorkSans text-[1.15rem] leading-7 text-matte dark:text-white"}>{description}</p>
      </div>
      <Slot />
    </div>
  );
});
