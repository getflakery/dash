<script setup lang="ts">
import type {  Instance } from '~/types'

const { data: instances, refresh } = await useFetch<Instance[]>('/api/instances', { default: () => [] })

const loading = ref(false)

const q = ref('')
const isInviteModalOpen = ref(false)


</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Instances">
        <template #right>
          <!-- link to documentation -->
          <ULink href="" target="_blank" class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" />
            <span>Documentation</span>
          </ULink>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Manage Instances" description="Instances are a single running virtual machine with your template applied. Create, manage and view logs for your instance."
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search Instances" autofocus />
              <UButton label="Create New Instance" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <InstancesList :instances="instances" :refresh="refresh" />
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <EncryptedFilesForm @close="isInviteModalOpen = false" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
