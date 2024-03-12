const fetch = require('node-fetch');

const githubToken = 'YOUR_GITHUB_ACCESS_TOKEN';
const repoOwner = 'REPO_OWNER'; // Username of the repository owner
const repoName = 'REPO_NAME'; // Name of the repository
const payloadUrl = 'YOUR_PAYLOAD_URL'; // The URL that will receive the webhook events
const secret = 'YOUR_WEBHOOK_SECRET'; // Optional: Your secret for securing your webhook

const createWebhook = async () => {
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/hooks`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: payloadUrl,
        content_type: 'json',
        secret: secret,
        insecure_ssl: '0', // Set to '1' to accept self-signed certificates, but it's insecure
      },
    }),
    headers: {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create webhook:', error);
    return;
  }

  const data = await response.json();
  console.log('Webhook created successfully:', data);
};

createWebhook().catch(console.error);
