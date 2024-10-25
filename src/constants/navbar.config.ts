interface NavbarConfig {
  route: string;
  label: string;
  showOnSmallScreen: boolean;
  showOnLargeScreen: boolean;
}

export default [
  // {
  //   route: "/works",
  //   label: "Works",
  //   showOnSmallScreen: true,
  //   showOnLargeScreen: true,
  // },
  // {
  //   route: "/contributions",
  //   label: "Contributions",
  //   showOnSmallScreen: true,
  //   showOnLargeScreen: true,
  // },
  // {
  //   route: "/skills",
  //   label: "Skills",
  //   showOnSmallScreen: true,
  //   showOnLargeScreen: true,
  // },
  // {
  //   route: "/contact-me",
  //   label: "Contact Me",
  //   showOnSmallScreen: true,
  //   showOnLargeScreen: true,
  // },
  {
    route: "/static/Naman-Parashar-Resume.pdf",
    label: "Resume",
    showOnSmallScreen: true,
    showOnLargeScreen: true,
  },
] as NavbarConfig[];
