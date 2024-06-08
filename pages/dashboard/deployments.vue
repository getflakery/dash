<script setup lang="ts">
import type {  Deployment, Template } from '~/types'

const { data: deployments, refresh } = await useFetch<Deployment[]>('/api/deployments', { default: () => [] })
const loading = ref(false)
const { data: template } = await useFetch<Template>(`/api/template/${deployment.value?.templateID}`)

const q = ref('')
const isInviteModalOpen = ref(false)


</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Deployments">
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Manage Deployments" description="Create, manage and view details for your deployment."
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search Deployments"  />
              <UButton label="Create New Deployment" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <DeploymentsList :template="template" :deployments="deployments" :refresh="refresh" />
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Create Deployment"
          :ui="{ width: 'sm:max-w-md' }">
          <DeploymentsForm @close="isInviteModalOpen = false" :refresh="refresh"/>
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
