#! /usr/bin/env nix-shell
#! nix-shell -i bash -p curl jq coreutils

# Replace with your Vercel API token
# VERCEL_TOKEN=

# Replace with your Vercel project ID
# VERCEL_PROJECT_ID=

# Fetch environment variables from Vercel
response=$(curl -s -X GET "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID/env?decrypt=true" \
-H "Authorization: Bearer $VERCEL_TOKEN")

# Check if the request was successful
if [ $? -ne 0 ]; then
    echo "Failed to fetch environment variables."
    exit 1
fi

# Decode base64 encoded values and print environment variables
echo "$response" | jq -r '.envs[] | "\(.key)=\(.value)"' | while IFS= read -r line; do
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2)
    
    # Check if value is base64 encoded by attempting to decode it
    decoded_value=$(echo "$value" | base64 --decode 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "$key=$decoded_value"
    else
        echo "$line"
    fi
done
