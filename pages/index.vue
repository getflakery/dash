
<script setup lang="ts">
definePageMeta({
  layout: 'landing'
})

const { loggedIn } = useUserSession()
</script>
<template>
    <UButton  to="/api/auth/github" icon="i-simple-icons-github" label="Login with GitHub" color="black"
        external />
</template>