"use client";

import { useEffect } from "react";

// for the people who open the hood
export function ConsoleEgg() {
  useEffect(() => {
    const green = "color:#31ff7a;font-family:monospace;";
    const dim = "color:#787f8c;font-family:monospace;";
    const block =
      "background:#31ff7a;color:#04120a;font-family:monospace;font-weight:bold;padding:4px 8px;";

    /* eslint-disable no-console */
    console.log("%c NAMAN PARASHAR %c open to work, obviously ", block, dim);
    console.log(
      "%c\n" +
        "  ░ ░ █ ▓ ░ ░ █ ▓ ░ ░ █ ░ ░\n" +
        "  ░ ▓ █ █ ▓ ░ █ █ ▓ ░ █ ▓ ░\n" +
        "  █ █ █ █ █ █ █ █ █ █ █ █ █\n" +
        "  ░ ▓ █ █ ▓ ░ █ █ ▓ ░ █ ▓ ░\n" +
        "  ░ ░ █ ▓ ░ ░ █ ▓ ░ ░ █ ░ ░\n",
      green,
    );
    console.log(
      "%cyou opened the hood. respect.\n" +
        "%cthis waveform is my last year of commits. it also talks out loud, scroll to the bottom and hit play.\n\n" +
        "%ctype  %chire.me%c  for the shortcut.",
      green,
      dim,
      dim,
      green,
      dim,
    );

    // typing `hire.me` in the console fires the mailto
    const hire = {} as { me?: string };
    Object.defineProperty(hire, "me", {
      get() {
        window.open(
          "mailto:nparashar150@gmail.com?subject=saw%20the%20console%20egg%2C%20let%27s%20talk",
          "_blank",
        );
        return "opening inbox… smart move.";
      },
    });
    (window as unknown as Record<string, unknown>).hire = hire;
    /* eslint-enable no-console */
  }, []);

  return null;
}
