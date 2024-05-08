<script setup lang="ts">
import type { Pipeline } from '~/types'

const { data: pipelines, refresh } = await useFetch<Pipeline[]>('/api/pipelines', { default: () => [] })

const loading = ref(false)

const q = ref('')
const isInviteModalOpen = ref(false)


const { isNotificationsSlideoverOpen } = useDashboard()

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Pipelines">
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Create Pipelines" description="Create a pipeline to deploy your nix flake"
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search Pipelines" />
              <UButton label="Create New Pipeline" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <!-- ~/components/settings/MembersList.vue -->
          <PipelinesList :pipelines="pipelines" :refresh="refresh"/>
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Create a Pipeline"
          description="Create a pipeline from a flake url, optionally add files and network configuration" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <PipelinesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
