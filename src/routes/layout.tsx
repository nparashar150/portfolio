import { component$, Slot } from "@builder.io/qwik";
import Navbar from "~/components/navbar/Navbar";

export default component$(() => {
  return (
    <div class={"containe sm:px-20 px-10"}>
      <Navbar />
      <main>
        <Slot />
      </main>
    </div>
  );
});
