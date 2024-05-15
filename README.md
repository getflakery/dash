![nuxt-ui-dashboard-social-card](https://github.com/nuxt-ui-pro/dashboard/assets/739984/f785284b-7db2-4732-af0e-2cb3c0bd7ca2)

# Flakery - Dashboard template

[![Flakery](https://img.shields.io/badge/Made%20with-Nuxt%20UI%20Pro-00DC82?logo=nuxt.js&labelColor=020420)](https://ui.nuxt.com/pro)

- [Live demo](https://dashboard-template.nuxt.dev/)
- [Play on Stackblitz](https://stackblitz.com/github/nuxt-ui-pro/dashboard)
- [Documentation](https://ui.nuxt.com/pro/getting-started)

## Quick Start

```bash [Terminal]
npx nuxi init -t github:nuxt-ui-pro/dashboard
```

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.

## Migrations

```
pnpm run migrate
```

```
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0000_previous_mephisto.sql"
```

<!-- server/database/migrations/0001_peaceful_ego.sql 
server/database/migrations/0002_confused_shocker.sql 
server/database/migrations/0003_pink_shockwave.sql 
server/database/migrations/0004_cooing_next_avengers.sql -->
```
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0000_gorgeous_ken_ellis.sql"
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0001_peaceful_ego.sql"
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0002_confused_shocker.sql"
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0003_pink_shockwave.sql"
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0004_cooing_next_avengers.sql"
```


## db web view 

```
nix-shell -p sqlite-web --run "sqlite_web db.sqlite"
```


# cloud resources

```
Outputs:

private_subnets = [
  "subnet-0c5c6438c404fbf54",
  "subnet-001d38fabf0cbc832",
]
public_subnets = [
  "subnet-061710e423b885a9a",
  "subnet-08307ac15ba441caf",
]
vpc_id = "vpc-0c1c37e1a494e6adf"
```