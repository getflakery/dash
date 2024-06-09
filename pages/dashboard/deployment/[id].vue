<script setup lang="ts">
import type { Deployment, Template } from '~/types'

const route = useRoute()

const { data: deployment, refresh } = await useFetch<Deployment>(`/api/deployment/${route.params.id}`)
onNuxtReady(() => {
  setInterval(refresh, 5000)
});

const { data: template } = await useFetch<Template>(`/api/template/${deployment.value?.templateID}`)
const deleteModal = ref(false)
const redeployModal = ref(false)

const isOpen = ref(false)

const hosts = deployment.value?.logs?.reduce((acc, log) => {
  acc.add(log.host)
  return acc
}, new Set<string>())

const selectedHosts = ref<string[]>([Array.from(hosts ?? [])[0]])
const getLogs = (hsts: string[]) => deployment.value?.logs?.
  filter(log => hsts.includes(log.host)).
  reduce((acc, log) => acc + log.exec + '\n', '')



function getItems(deployment: Deployment, refresh: Function) {
  return [
    [{
      label: 'Promote to Production',
      icon: 'i-heroicons-paper-airplane',
      click: async () => {
        await fetch(`/api/deployment/${deployment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: deployment.name,
            production: true
          })
        })
        refresh()
      }
    },
      
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      labelClass: 'text-red-500 dark:text-red-400',
      click: async () => {
        deleteModal.value = true
      }
    }]
  ]
}

function select(host: { host: string }) {
  let base64Encoded = btoa(JSON.stringify({
    deployment: deployment.value.id,
    host: host.host
  }))
  navigateTo(`/dashboard/deployment/host/${base64Encoded}`)
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="`Deployment Details for ${deployment?.name}`">
        <template #right>
          <UButton type="submit" label="Refresh" :onclick="refresh" icon="i-heroicons-arrow-path" />
          <UDropdown :items="getItems(deployment, refresh)" position="bottom-end">
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

        <!-- is production? -->
        <UDashboardSection title="Production" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
          <span>{{ deployment?.production ? 'Yes' : 'No' }}</span>
        </UDashboardSection>

        <UDashboardSection title="Instances" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }" />

        <UTable :rows="Array.from(hosts ?? []).map(host => ({ host: host }))" @select="select" />





        <!-- Logs: -->

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
            {{ getLogs(selectedHosts) }}
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
}
</style>
