#! /usr/bin/env nix-shell
#! nix-shell -i bash -p nodePackages.vercel 
rm -f .env

vercel env pull --environment=production --token $VERCEL_TOKEN .env