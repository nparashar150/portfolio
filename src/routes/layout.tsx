import { component$, Slot } from "@builder.io/qwik";
import Footer from "~/components/footer/Footer";
import Navbar from "~/components/navbar/Navbar";

export default component$(() => {
  return (
    <div class={"containe px-10 sm:px-20"}>
      <Navbar />
      <main>
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
