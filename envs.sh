#! /usr/bin/env nix-shell
#! nix-shell -i bash -p nodePackages.vercel 

# Replace with your Vercel API token
# VERCEL_TOKEN=

# Replace with your Vercel project ID
# VERCEL_PROJECT_ID=

# Replace with your Vercel project ID
# Fetch environment variables from Vercel
rm -f .env
vercel env pull  --token $VERCEL_TOKEN .env