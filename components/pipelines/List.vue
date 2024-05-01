<script setup lang="ts">
import type { Pipeline } from '~/types'

defineProps({
  pipelines: {
    type: Array as PropType<Pipeline[]>,
    default: () => []
  },
  refresh: Function,
})
const deleteModal = ref(false)
const pipelineToDelete = ref()

const deployInstance = ref(false)
const pipelineToDeploy = ref()
function getItems(pipeline: Pipeline, refresh: Function | undefined) {

  return [
    [{
      label: 'Deploy',
      icon: 'i-heroicons-server',
      click: async () => {
        deployInstance.value = true
        pipelineToDeploy.value = pipeline

      }
    }],
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        labelClass: 'text-red-500 dark:text-red-400',
        click: () => {
          pipelineToDelete.value = pipeline
          deleteModal.value = true
        }
      }]]
}
</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(t, index) in pipelines" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink :to="`/dashboard/pipeline/${ t.id }`">
          <div class="text-sm min-w-0">
            <p class="text-gray-900 dark:text-white font-medium truncate">
              {{ t.name }}
            </p>
            {{ t.flakeURL }}
          </div>
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(t, refresh)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete pipeline"
    :ui="{ width: 'sm:max-w-md' }">
    <PipelinesDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :pipeline="pipelineToDelete">
    </PipelinesDeleteConfirmModal>
  </UDashboardModal>
  <UDashboardModal v-model="deployInstance"
    :title="`Run Pipeline: ${pipelineToDeploy?.name ? pipelineToDeploy?.name : pipelineToDeploy?.flakeURL}`"
    description="" :ui="{ width: 'sm:max-w-md' }">
    <PipelinesDeployModal @close="deployInstance = false" :refresh="refresh" :pipeline="pipelineToDeploy" />
  </UDashboardModal>
</template>
