<script setup lang="ts">
import type {  Network } from '~/types'

const { data: networks, refresh } = await useFetch<Network[]>('/api/networks', { default: () => [] })

const loading = ref(false)

const q = ref('')
const isInviteModalOpen = ref(false)


</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Networks">
        <template #right>
          <!-- link to documentation -->
          <ULink href="" target="_blank" class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" />
            <span>Documentation</span>
          </ULink>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Create Network" description="Create a network and domain to associate with a deployment"
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search Networks" />
              <UButton label="Create New Network" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <NetworksList :networks="networks" :refresh="refresh"/>
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Create network"
          description="Create networks to re use domain names and networking configuration across deployments" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <NetworksForm @close="isInviteModalOpen = false" :refresh="refresh"/>
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
