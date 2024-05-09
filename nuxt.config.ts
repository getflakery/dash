
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [process.env.NUXT_UI_PRO_PATH || "@nuxt/ui-pro"],
  modules: [
    "@nuxt/ui",
    "@nuxtjs/fontaine",
    "@nuxtjs/google-fonts",
    "@vueuse/nuxt",
    "nuxt-auth-utils",
    "@nuxt/content",
  ],
  ui: {
    icons: ["heroicons", "simple-icons"],
    safelistColors: ["primary", "red", "orange", "green"],
  },
  content: {
    icons: ["heroicons", "simple-icons"],
  },
  components: [
    {
      path: "~/components",
    },
    {
      path: "~/components/common",
      pathPrefix: false,
    },
  ],
  // Fonts
  fontMetrics: {
    fonts: ["DM Sans"],
  },
  googleFonts: {
    display: "swap",
    download: true,
    families: {
      "DM+Sans": [300, 400, 500, 600, 700],
    },
  },
  devtools: {
    enabled: true,
  },
  // sourcemap: true,
  // debug: true,
  // vite: {
  //   build: {
  //     minify: false,
  //   },
  // },
  // nitro: {
  //   minify: false,
  // },
  telemetry: false,
  content: {
    // highlight: false,
    highlight: {
      // Theme used in all color schemes.
      // OR
      // theme: {
      //   // Default theme (same as single string)
      //   default: "github-light",
      //   // Theme used if `html.dark`
      //   dark: "github-dark",
      //   // Theme used if `html.sepia`
      // },

      langs: ["c", "cpp", "nix"],
    },

  },
});
