<script setup lang="ts">
import type { Template } from '~/types'

defineProps({
  templates: {
    type: Array as PropType<Template[]>,
    default: () => []
  },
  refresh: Function,
})

function getItems(template: Template, refresh: Function | undefined) {

  return [
    [{
      label: 'Deploy Instance',
      icon: 'i-heroicons-server',
      click: async () => {
        await $fetch(`/api/instances`, {
          method: 'POST',
          body: JSON.stringify({
            "templateID": template.id
          })
        }
        )
      }
    }],
    [
      {
        label: 'Delete Template',
        icon: 'i-heroicons-trash-20-solid',
        labelClass: 'text-red-500 dark:text-red-400',
        click: () => {
          templateToDelete.value = template
          deleteModal.value = true
        }
      }]]
}

const deleteModal = ref(false)
const templateToDelete = ref()

</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(template, index) in templates" :key="index"
      class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ template.name }}
          </p>
          {{ template.flakeURL }}


        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(template, refresh)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete template"
    :ui="{ width: 'sm:max-w-md' }">
    <TemplatesDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :template="template"></TemplatesDeleteConfirmModal>
  </UDashboardModal>
</template>
