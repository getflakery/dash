# Flakery 
- [try the cloud version](https://flakery.dev)
- [Documentation](https://flakery.dev/documentation/quick-start)


## build oci image 

```
podman build -t flakery .
```

## run oci image 

```
podman run -p 3000:3000 flakery
```



## Setup

enter nix development shell 
```
nix develop
```

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
nix-shell -p sqlite --command "sqlite3 db.sqlite < server/database/migrations/0002_safe_archangel.sql"
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
