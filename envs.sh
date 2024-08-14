#! /usr/bin/env nix-shell
#! nix-shell -i bash -p curl jq

# Replace with your Vercel API token
# VERCEL_TOKEN=

# Replace with your Vercel project ID
# VERCEL_PROJECT_ID=

# Fetch environment variables from Vercel
response=$(curl -s -X GET "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env" \
-H "Authorization: Bearer $VERCEL_TOKEN")

# Check if the request was successful
if [ $? -ne 0 ]; then
    echo "Failed to fetch environment variables."
    exit 1
fi

# Print environment variables
echo "$response" | jq -r '.envs[] | "\(.key)=\(.value)"'

# Note: `jq` is used here to parse the JSON response. 
# If jq is not installed, you can install it using your package manager, e.g., `sudo apt-get install jq`
