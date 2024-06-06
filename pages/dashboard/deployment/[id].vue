<script setup lang="ts">
import type { Deployment, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const route = useRoute()

const { data: deployment, refresh } = await useFetch<Deployment>(`/api/deployment/${route.params.id}`)
const deleteModal = ref(false)
const redeployModal = ref(false)

const isOpen = ref(false)



function getItems(deployment: Deployment, refresh: Function) {
  return [
    // [{
    //     label: 'Redeploy',
    //     icon: 'i-heroicons-paper-airplane',
    //     click: async () => {
    //       redeployModal.value = true
    //     }
    //   }],  
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      labelClass: 'text-red-500 dark:text-red-400',
      click: async () => {
        deleteModal.value = true
      }
    }]]
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
                  {{ deployment?.logs?.reduce(
                    (acc, log) => acc + log.exec + '\n',
                    '') }}
                </code>
              </pre>
              <UButton 
              label="Fullscreen" 
              @click="isOpen = !isOpen" 
              class="fullscreen-button"
              />

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
      <UCard
        :ui="{
          base: 'h-full flex flex-col',
          rounded: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
          body: {
            base: 'grow'
          }
        }"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Logs for {{ deployment?.name }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isOpen = false" />
          </div>
        </template>


        <div class="code-block" style="position: relative; height: 300px;">
            <pre class="custom-scroll">
                <code>
                  {{ deployment?.logs?.reduce(
                    (acc, log) => acc + log.exec + '\n',
                    '') }}
                </code>
              </pre>
              <UButton 
              label="Fullscreen" 
              @click="isOpen = !isOpen" 
              class="fullscreen-button"
              />

          </div>
      </UCard>
    </UModal>
</template>


<style scoped>
/* Additional CSS for custom styling and scroll behavior */
.code-block {
  overflow-x: auto;
  /* Ensures that horizontal scrolling is only shown when necessary */
  background-color: #f5f5f5;
  /* Light background color for the code block */
  border-radius: 4px;
  /* Rounded corners for the code block */
  padding: 1rem;
  /* Adequate padding around the content */
  font-family: 'Fira Code', monospace;
  /* Monospace font for better code readability */
  overflow-x: scroll;
  position: relative;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
  /* Custom scrollbar width */
}

.custom-scroll::-webkit-scrollbar-track {
  background: #e0e0e0;
  /* Scrollbar track color */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #a0a0a0;
  /* Scrollbar thumb color */
  border-radius: 4px;
  /* Rounded corners for the scrollbar thumb */
}

.fullscreen-button {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
