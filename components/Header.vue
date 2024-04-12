<script setup lang="ts">
import type { NavItem } from '@nuxt/content/dist/runtime/types'

const navigation = inject<NavItem[]>('navigation', [])

const { header } = useAppConfig()
</script>

<template>
  <UHeader>
    <template #logo>
      <template v-if="header?.logo?.dark || header?.logo?.light">
        <UColorModeImage v-bind="{ class: 'h-6 w-auto', ...header?.logo }" />
      </template>
      <template v-else>
        Flakery
      </template>
    </template>

    <template v-if="header?.search" #center>
      <UContentSearchButton class="hidden lg:flex" />
    </template>

    <template #right>
      <UButton  to="/documentation/quick-start"  icon="i-heroicons-book-open"  label="Documentation" />
      <UButton  to="/api/auth/github" icon="i-simple-icons-github" label="Login with GitHub" color="black"
        external />
    </template>

    <template #panel>
      <UNavigationTree :links="mapContentNavigation(navigation)" />
    </template>
  </UHeader>
</template>
