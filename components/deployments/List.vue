<script setup lang="ts">
import type { Deployment } from '~/types'

defineProps({
  deployments: {
    type: Array as PropType<Deployment[]>,
    default: () => []
  },
  refresh: {
    type: Function,
    default: () => {}
  },
})

function getItems(deployment: Deployment, refresh: Function) {
  return [
  // [{
  //     label: 'Redeploy',
  //     icon: 'i-heroicons-paper-airplane',
  //     click: async () => {
  //       deploymentToRedeploy.value = deployment
  //       redeployModal.value = true
  //     }
  //   }],  
  [{
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      labelClass: 'text-red-500 dark:text-red-400',
      click: async () => {
        deploymentToDelete.value = deployment
        deleteModal.value = true
      }
    }]]
}

const deleteModal = ref(false)
const redeployModal = ref(false)
const deploymentToDelete = ref()
const deploymentToRedeploy = ref()



</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(i, index) in deployments" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <NuxtLink :to="`/dashboard/deployment/${i.id}`">
        <div class="flex items-center gap-3 min-w-0">
          <div class="text-sm min-w-0">
            <p class="text-gray-900 dark:text-white font-medium truncate">
              {{ i.name }}
            </p>
          </div>
        </div>
      </NuxtLink>


      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(i, refresh)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete Deployment"
    :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :deployment="deploymentToDelete" />
  </UDashboardModal>
  <UDashboardModal 
    v-model="redeployModal" 
    title="Confirm Redeploy" 
    :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsRedeployModal @close="redeployModal = false" :refresh="refresh" :deployment="deploymentToRedeploy" />
  </UDashboardModal>

</template>
