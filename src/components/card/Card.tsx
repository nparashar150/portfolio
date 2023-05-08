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
    <div class={"flex h-[20rem] min-h-[15rem] w-[35rem] min-w-[30rem] flex-col items-start justify-center gap-6 border-2 border-darkGreen px-6 py-4"}>
      <h1 class={"h-[30%] pt-2 font-Vollkorn text-[3.5rem] text-darkGreen dark:text-green"}>{title}</h1>
      <div class={"flex h-[50%] flex-col items-start justify-between gap-4"}>
        <p class={"font-WorkSans text-[1.05rem] leading-6 text-matte dark:text-white"}>{description}</p>
        <Link href={url}>{urlText}</Link>
      </div>
    </div>
  );
});
