<script setup lang="ts">
import type { Network } from '~/types'

defineProps({
  networks: {
    type: Array as PropType<Network[]>,
    default: () => []
  },
  refresh: Function,
})

function getItems (network: Network, refresh) {
  return [[
  {
    label: 'Delete Network',
    icon: 'i-heroicons-trash-20-solid',
    labelClass: 'text-red-500 dark:text-red-400',
    click: async () => {
        await $fetch(`/api/networks/${network.id}`, { method: 'DELETE' })
        refresh()
      }
  }]]
}

</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(i, index) in networks" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ i.domain }} 
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(i, refresh)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
</template>
