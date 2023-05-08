import { Slot, component$ } from "@builder.io/qwik";

interface LinkProps {
  href: string;
}

export default component$<LinkProps>(({ href }) => {
  return (
    <a target="_blank" rel="noreferrer" href={href} class={"group group flex cursor-pointer items-center justify-center transition-all duration-300 ease-in-out hover:text-darkGreen dark:hover:text-green"}>
      <Slot />
      <img class={"group-hover:rotate-12 dark:invert"} src="/top-arrow-right.svg" alt="arrow" />
    </a>
  );
});
