import { $, component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import Accordin from "~/components/accordin/Accordin";
import Card from "~/components/card/Card";
import Link from "~/components/link/Link";
import Section from "~/components/section/Section";
import { default as PROJECTS_CONFIG } from "~/constants/projects.config";
import { default as SOCIAL_CONFIG } from "~/constants/social.config";
import { default as WORK_CONFIG } from "~/constants/work.config";
import { Image } from "qwik-image";

export const head: DocumentHead = {
  title: "Naman | Home",
  meta: [
    {
      name: "description",
      content: "I'm a full stack Software Engineer. I am passionate about creating a user-centered design, gathering and translating user data into design decisions and products.",
    },
  ],
};

export default component$(() => {
  const userContatInfo = useSignal({ name: "", email: "", message: "" });

  const onChangeHandler = $((event: Event) => {
    const target = event.target as HTMLInputElement;
    const name = target.name;
    const value = target.value;
    userContatInfo.value = { ...userContatInfo.value, [name]: value };
  });

  return (
    <>
      <div class={"h-100 flex min-h-[80vh] flex-col justify-start gap-12 sm:flex-row sm:items-center sm:justify-between sm:gap-4"}>
        <div class={"w-100 flex flex-col items-start justify-center gap-4 text-matte dark:text-white sm:w-7/12"}>
          <h1 class={"text-[4.5rem] text-matte dark:text-white sm:text-[6rem]"}>Hi, I am Naman</h1>
          <p class={"w-10/12 font-WorkSans text-[1rem] leading-7 text-matte dark:text-white sm:text-[1.15rem]"}>
            I'm a full stack Software Engineer. I am passionate about creating a user-centered design, gathering and translating user data into design decisions and products.
          </p>
          <div class={"mt-2 flex items-center justify-center gap-8 font-Vollkorn sm:font-[1.15rem]"}>
            {SOCIAL_CONFIG.map((social) => {
              return (
                <Link key={social.route} href={social.route}>
                  {social.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div class={"flex h-[30rem] w-[21rem] overflow-hidden border-[1px] border-matte bg-matte bg-cover outline outline-[1px] outline-offset-4 outline-darkGreen dark:border-darkGreen dark:bg-white dark:outline-green"}>
          <Image alt="Naman's" placeholder="#e6e6e6" src="/naman-parashar-profile.avif" layout="constrained" objectFit="cover" width={420} height={560}  />
        </div>
        <div class={"blurBgEffect"}></div>
      </div>
      <Section heading="Work" subHeading="Where I've Worked">
        <div class={"no-scrollbar flex w-[95vw] flex-col flex-nowrap gap-12 overflow-scroll py-10 pr-14"}>
          {WORK_CONFIG.map((work) => {
            return <Accordin key={work.heading} heading={work.heading} description={work.description} defaultState={work.defaultState} />;
          })}
        </div>
      </Section>
      <Section heading="Projects" subHeading="Selected Projects">
        <div class={"no-scrollbar flex w-[95vw] flex-row flex-nowrap gap-6 overflow-scroll py-10 pr-14"}>
          {PROJECTS_CONFIG.map((project) => {
            return <Card key={project.title} title={project.title} description={project.description} url={project.url} urlText={project.urlText} />;
          })}
        </div>
      </Section>
      <Section heading={`Do you have any ideas?\nLet's create the future`} subHeading="">
        <label for="name" class={"mt-[3rem] text-[1rem] text-matte dark:text-white"}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          onInput$={onChangeHandler}
          value={userContatInfo.value.name}
          style={"background: transparent"}
          class={"h-[2.75rem] w-[90vw] border-b-[1px] border-matte outline-none dark:border-white sm:w-[50vw]"}
        />
        <label for="email" class={"mt-[3rem] text-[1rem] text-matte dark:text-white"}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="text"
          onInput$={onChangeHandler}
          style={"background: transparent"}
          value={userContatInfo.value.email}
          class={"h-[2.75rem] w-[90vw] border-b-[1px] border-matte outline-none dark:border-white sm:w-[50vw]"}
        />
        <label for="message" class={"mt-[3rem] text-[1rem] text-matte dark:text-white"}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          onInput$={onChangeHandler}
          style={"background: transparent"}
          value={userContatInfo.value.message}
          class={"mt-[1rem] h-[2.75rem] w-[90vw] border-b-[1px] border-matte outline-none dark:border-white sm:w-[50vw]"}
        />
        <button
          preventdefault:click
          onClick$={$(() => window.open(`mailto:?&body=${userContatInfo.value.message}&cc=${userContatInfo.value.email}`))}
          class={"group group mt-[2rem] flex cursor-pointer items-center justify-center transition-all duration-300 ease-in-out hover:text-darkGreen dark:hover:text-green"}
        >
          SEND
          <img class={"group-hover:rotate-12 dark:invert"} src="/top-arrow-right.svg" alt="arrow" />
        </button>
      </Section>
    </>
  );
});
