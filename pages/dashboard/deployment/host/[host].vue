<script setup lang="ts">
import type { Deployment, Template } from '~/types'

const route = useRoute()

const host = JSON.parse(atob(route.params.host))

const { data: deployment, refresh } = await useFetch<Deployment>(`/api/deployment/${host.deployment}`)

onNuxtReady(() => {
  setInterval(refresh, 5000)
});
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
  let base64Encoded = btoa(host.host)
  navigateTo(`/dashboard/deployment/${deployment.value?.id}/host/${base64Encoded}`)
}
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar :title="` Details for Host ${host.host}`">
        <template #right>
          <UButton type="submit" label="Refresh" :onclick="refresh" icon="i-heroicons-arrow-path" />
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent>


        <!-- <UDashboardSection title="Host" :description="host.host" />
        <UDashboardSection title="Deployment" >
            <template #description>
              <NuxtLink :to="`/dashboard/deployment/${deployment?.id}`" class="">
                {{ deployment?.name }}
              </NuxtLink>
            </template>
            </UDashboardSection> -->

            <UDashboardSection title="Host" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
                <span>{{ host.host }}</span>
                </UDashboardSection>
                <UDashboardSection title="Deployment" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
                    <NuxtLink :to="`/dashboard/deployment/${deployment?.id}`" class="text-blue-500 dark:text-blue-400">
                      <span>{{ deployment?.name }}</span>
                    </NuxtLink>
                  </UDashboardSection>



        <!-- flakeURL -->
        <UDashboardSection title="Logs" />
        <div class="code-block" style="position: relative;">
        <pre class="custom-scroll">
          <code>
            {{ getLogs([host.host]) }}
          </code>
        </pre>
      </div>

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
