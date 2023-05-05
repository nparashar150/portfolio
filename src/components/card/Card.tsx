import { component$ } from "@builder.io/qwik";

interface CardProps {
  title: string;
  description: string;
  urlText: string;
  url: string;
}

export default component$<CardProps>(({ description, title, url, urlText }) => {
  return (
    <div class={"min-w-[30rem] w-[35rem] min-h-[20rem] h-[25rem] px-6 py-4 gap-6 border-darkGreen border-2 flex flex-col items-start justify-start"}>
      <h1 class={"h-[50%] font-Vollkorn pt-2 text-[5.25rem] text-darkGreen dark:text-green"}>{title}</h1>
      <div class={"h-[40%] flex flex-col gap-4 items-start justify-between"}>
        <p class={"font-WorkSans text-[1.05rem] leading-6 text-matte dark:text-white"}>{description}</p>
        <a href={url} target="_blank" rel="noreferrer" class={"flex group hover:text-darkGreen dark:hover:text-green justify-center items-center cursor-pointer group transition-all duration-300 ease-in-out"}>
          {urlText}
          <img class={"group-hover:rotate-12 dark:invert"} src="/top-arrow-right.svg" alt="arrow" />
        </a>
      </div>
    </div>
  );
});
