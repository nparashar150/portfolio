import { component$ } from "@builder.io/qwik";
import Link from "../link/Link";

interface CardProps {
  title: string;
  description: string;
  urlText: string;
  url: string;
}

export default component$<CardProps>(({ description, title, url, urlText }) => {
  return (
    <div class={"min-w-[30rem] w-[35rem] min-h-[15rem] h-[20rem] px-6 py-4 gap-6 border-darkGreen border-2 flex flex-col items-start justify-center"}>
      <h1 class={"h-[30%] font-Vollkorn pt-2 text-[3.5rem] text-darkGreen dark:text-green"}>{title}</h1>
      <div class={"h-[50%] flex flex-col gap-4 items-start justify-between"}>
        <p class={"font-WorkSans text-[1.05rem] leading-6 text-matte dark:text-white"}>{description}</p>
        <Link href={url}>{urlText}</Link>
      </div>
    </div>
  );
});
