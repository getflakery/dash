<script setup lang="ts">
import type { Template } from '~/types'

defineProps({
  templates: {
    type: Array as PropType<Template[]>,
    default: () => []
  },
  refresh: Function,
})
const deleteModal = ref(false)
const templateToDelete = ref()

const deployInstance = ref(false)
const templateToDeploy = ref()
function getItems(template: Template, refresh: Function | undefined) {

  return [
    [{
      label: 'Deploy',
      icon: 'i-heroicons-server',
      click: async () => {
        deployInstance.value = true
        templateToDeploy.value = template

      }
    }],
    [
      {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        labelClass: 'text-red-500 dark:text-red-400',
        click: () => {
          templateToDelete.value = template
          deleteModal.value = true
        }
      }]]
}
</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(t, index) in templates" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">
        <NuxtLink :to="`/dashboard/template/${ t.id }`">
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
  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete template"
    :ui="{ width: 'sm:max-w-md' }">
    <TemplatesDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :template="templateToDelete">
    </TemplatesDeleteConfirmModal>
  </UDashboardModal>
  <UDashboardModal v-model="deployInstance"
    :title="`Deploy Template: ${templateToDeploy?.name ? templateToDeploy?.name : templateToDeploy?.flakeURL}`"
    description="" :ui="{ width: 'sm:max-w-md' }">
    <TemplatesDeployModal @close="deployInstance = false" :refresh="refresh" :template="templateToDeploy" />
  </UDashboardModal>
</template>
