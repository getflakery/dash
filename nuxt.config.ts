
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
  sourcemap: false,

  // debug: true,
  // vite: {
  //   build: {
  //     minify: false,
  //   },
  // },
  nitro: {
    // minify: false,
    logLevel: 1,
  },
  telemetry: false,
  runtimeConfig: {
    apiSecret: '', // can be overridden by NUXT_API_SECRET environment variable
    public: {
      vpc_id: 'vpc-0c1c37e1a494e6adf', // can be overridden by NUXT_PUBLIC_VPC_ID environment variable
      public_subnet_1: 'subnet-08307ac15ba441caf', // can be overridden by NUXT_PUBLIC_SUBNET_1 environment variable
      public_subnet_2: 'subnet-061710e423b885a9a', // can be overridden by NUXT_PUBLIC_SUBNET_2 environment variable
      private_subnet_1: 'subnet-001d38fabf0cbc832', // can be overridden by NUXT_PRIVATE_SUBNET_1 environment variable
      private_subnet_2: 'subnet-0c5c6438c404fbf54', // can be overridden by NUXT_PRIVATE_SUBNET_2 environment variable
      image_id: 'ami-02fb5ac1a422f06d5', // can be overridden by NUXT_IMAGE_ID environment variable
    }
  },
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
