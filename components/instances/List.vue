<script setup lang="ts">
import type { Instance } from '~/types'

defineProps({
  instances: {
    type: Array as PropType<Instance[]>,
    default: () => []
  }
})

function getItems (template: Instance) {
  return [[{
    label: 'Edit template',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => console.log('Edit', template)
  }],
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
  [{
    label: 'Delete Template',
    icon: 'i-heroicons-trash-20-solid',
    labelClass: 'text-red-500 dark:text-red-400',
    click: () => console.log('Delete', template)
  }]]
}

</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(i, index) in instances" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ i.name }} 
          </p>

        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(i)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
</template>
