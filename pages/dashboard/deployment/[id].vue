<script setup lang="ts">
import type { Deployment, Template } from '~/types'

const route = useRoute()

const { data: deployment, refresh } = await useFetch<Deployment>(`/api/deployment/${route.params.id}`)
setInterval(refresh, 5000)
const { data: template } = await useFetch<Template>(`/api/template/${deployment.value?.templateID}`)
const deleteModal = ref(false)
const redeployModal = ref(false)

const isOpen = ref(false)

function getItems(deployment: Deployment, refresh: Function) {
  return [
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      labelClass: 'text-red-500 dark:text-red-400',
      click: async () => {
        deleteModal.value = true
      }
    }]
  ]
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="`Deployment Details for ${deployment?.name}`">
        <template #right>
          <UButton type="submit" label="Refresh" :onclick="refresh" icon="i-heroicons-arrow-path" />
          <UDropdown :items="getItems(i, refresh)" position="bottom-end">
            <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
          </UDropdown>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent>
        <UDashboardSection title="Template" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
          <div class="flex items-center gap-2">

            <NuxtLink :to="`/dashboard/template/${deployment?.templateID}`" class="text-blue-500 dark:text-blue-400">
              <span>{{ template?.name ? template.name : "Unamed Template" }}</span>
              
            </NuxtLink>
          </div>  
        </UDashboardSection>
        <!-- flakeURL -->
        <UDashboardSection title="Flake URL" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
          <span>{{ template?.flakeURL }}</span>
        </UDashboardSection>
        <UDashboardSection title="URL" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
          <!-- display deployment.host as a link -->
          <NuxtLink :to="`https://${deployment?.host}`" class="text-blue-500 dark:text-blue-400" target="_blank">
            {{ deployment?.host }}
          </NuxtLink>
        </UDashboardSection>

        <!-- Logs: -->
        <UDashboardSection title="Logs" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
          <div class="code-block" style="position: relative; height: 300px;">
            <pre class="custom-scroll">
              <code>
                {{ deployment?.logs?.reduce((acc, log) => acc + log.exec + '\n', '') }}
              </code>
            </pre>
            <UButton @click="isOpen = !isOpen" icon="i-heroicons-arrows-pointing-out" class="fullscreen-button" />
          </div>
        </UDashboardSection>
      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>

  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete Deployment"
    :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :deployment="deployment" />
  </UDashboardModal>
  <UDashboardModal v-model="redeployModal" title="Confirm Redeploy" :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsRedeployModal @close="redeployModal = false" :refresh="refresh" :deployment="deployment" />
  </UDashboardModal>
  <UModal v-model="isOpen" fullscreen>
    <UCard :ui="{
      base: 'h-full flex flex-col',
      rounded: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      body: { base: 'grow' }
    }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Logs for {{ deployment?.name }}
          </h3>
          <div class="flex items-center gap-2">
            <UButton type="submit" label="Refresh" :onclick="refresh" icon="i-heroicons-arrow-path" />
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="isOpen = false" />
              </div>  
        </div>
      </template>
      <div class="code-block" style="position: relative;">
        <pre class="custom-scroll">
          <code>
            {{ deployment?.logs?.reduce((acc, log) => acc + log.exec + '\n', '') }}
          </code>
        </pre>
      </div>
    </UCard>
  </UModal>
</template>

<style scoped>
/* Additional CSS for custom styling and scroll behavior */
.code-block {
  overflow-x: auto;
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 1rem;
  font-family: 'Fira Code', monospace;
  overflow-x: scroll;
  position: relative;
  color: #333;
  /* Default text color */
}

.dark .code-block {
  background-color: #2d2d2d;
  /* Dark mode background color */
  color: #ddd;
  /* Dark mode text color */
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
}

.custom-scroll::-webkit-scrollbar-track {
  background: #e0e0e0;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #a0a0a0;
  border-radius: 4px;
}

.fullscreen-button {
  position: absolute;
  top: 10px;
  right: 10px;
}</style>
