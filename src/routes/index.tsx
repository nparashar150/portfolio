import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Accordin from "~/components/accordin/Accordin";
import Card from "~/components/card/Card";
import Link from "~/components/link/Link";
import Section from "~/components/section/Section";
import { default as PROJECTS_CONFIG } from "~/constants/projects.config";
import { default as SOCIAL_CONFIG } from "~/constants/social.config";
import { default as WORK_CONFIG } from "~/constants/work.config";

export default component$(() => {
  return (
    <>
      <div class={"h-100 min-h-[80vh] flex flex-col justify-start gap-12 sm:gap-4 sm:justify-between sm:items-center sm:flex-row"}>
        <div class={"w-100 flex flex-col justify-center items-start gap-4 text-matte dark:text-white sm:w-7/12"}>
          <h1 class={"text-[4.5rem] text-matte dark:text-white sm:text-[6rem]"}>Hi, I am Naman</h1>
          <p class={"w-10/12 text-[1rem] leading-7 font-WorkSans text-matte dark:text-white sm:text-[1.15rem]"}>
            I'm a full stack Software Engineer. I am passionate about creating a user-centered design, gathering and translating user data into design decisions and products.
          </p>
          <div class={"mt-2 font-Vollkorn flex justify-center items-center gap-8 sm:font-[1.15rem]"}>
            {SOCIAL_CONFIG.map((social) => {
              return (
                <Link key={social.route} href={social.route}>
                  {social.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div
          class={
            "mx-auto w-[75vw] h-auto bg-matte dark:bg-white rounded-t-full bg-cover overflow-hidden flex border-[1px] border-matte dark:border-darkGreen  outline outline-darkGreen dark:outline-green outline-offset-4 outline-[1px] sm:mr-[7rem] sm:-mt-[2rem] sm:w-[20rem] sm:h-[27rem]"
          }
        >
          <img src="/naman-parashar-profile.avif" alt="Naman" />
        </div>
        <div class={"blurBgEffect"}></div>
      </div>
      <Section heading="Work" subHeading="Where I've Worked">
        <div class={"no-scrollbar py-10 pr-14 flex flex-col flex-nowrap gap-12 w-[95vw] overflow-scroll"}>
          {WORK_CONFIG.map((work) => {
            return <Accordin key={work.heading} heading={work.heading} description={work.description} defaultState={work.defaultState} />;
          })}
        </div>
      </Section>
      <Section heading="Projects" subHeading="Selected Projects">
        <div class={"no-scrollbar py-10 pr-14 flex flex-row flex-nowrap gap-6 w-[95vw] overflow-scroll"}>
          {PROJECTS_CONFIG.map((project) => {
            return <Card key={project.title} title={project.title} description={project.description} url={project.url} urlText={project.urlText} />;
          })}
        </div>
      </Section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Naman | Home",
  meta: [
    {
      name: "description",
      content: "Naman | Home",
    },
  ],
};
