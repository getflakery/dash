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
    experimental: {
      openAPI: true,

    },
  },
  telemetry: false,
  runtimeConfig: {
    db_url: '',
    turso_token: '', // can be overridden by NUXT_TURSO_TOKEN environment variable
    file_encryption_key: '', // can be overridden by NUXT_FILE_ENCRYPTION_KEY environment variable
    github_token: '', // can be overridden by NUXT_GITHUB_TOKEN environment variable
    crypto_string_key: '', // can be overridden by NUXT_CRYPTO_STRING_KEY environment variable
    crypto_string_salt: '', // can be overridden by NUXT_CRYPTO_STRING_SALT environment variable
    jwt_secret: '', // can be overridden by NUXT_JWT_SECRET environment variable
    woodpecker_token: '', // can be overridden by NUXT_WOODPECKER_TOKEN environment variable
    woodpecker_repo_id: 1, // can be overridden by NUXT_WOODPECKER_REPO_ID environment variable
    ssh_private_key_b64: '', // can be overridden by NUXT_SSH_PRIVATE_KEY environment variable
    webhook_url: '"https://flakery.com/api/template/webhook"', // can be overridden by NUXT_WEBHOOK_URL environment variable
    webhook_client_id: 'Ov23ligVxZURmhfutUBC', // can be overridden by NUXT_WEBHOOK_CLIENT_ID environment variable
    webhook_client_secret: '', // can be overridden by NUXT_WEBHOOK_CLIENT_SECRET environment variable
    AWS_ACCESS_KEY_ID: '', // can be overridden by NUXT_AWS_KEY environment variable
    AWS_SECRET_ACCESS_KEY: '', // can be overridden by NUXT_AWS_SECRET environment variable
    public: {
      vpc_id: 'vpc-0c1c37e1a494e6adf', // can be overridden by NUXT_PUBLIC_VPC_ID environment variable
      public_subnet_1: 'subnet-08307ac15ba441caf', // can be overridden by NUXT_PUBLIC_SUBNET_1 environment variable
      public_subnet_2: 'subnet-061710e423b885a9a', // can be overridden by NUXT_PUBLIC_SUBNET_2 environment variable
      private_subnet_1: 'subnet-001d38fabf0cbc832', // can be overridden by NUXT_PRIVATE_SUBNET_1 environment variable
      private_subnet_2: 'subnet-0c5c6438c404fbf54', // can be overridden by NUXT_PRIVATE_SUBNET_2 environment variable
      image_id: 'ami-0f2a2647b7c9234b9', // can be overridden by NUXT_IMAGE_ID environment variable
    }
  },
});