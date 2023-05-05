import { component$, Slot } from "@builder.io/qwik";
import Navbar from "~/components/navbar/Navbar";

export default component$(() => {
  return (
    <div class={"containe px-20"}>
      <Navbar />
      <main>
        <Slot />
      </main>
    </div>
  );
});
