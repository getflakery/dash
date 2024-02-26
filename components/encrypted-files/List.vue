<script setup lang="ts">
import type { File } from '~/types'

defineProps({
  files: {
    type: Array as PropType<File[]>,
    default: () => []
  },
  refresh: Function,
})

function getItems (file: File, refresh: Function) {
  return [[
  {
    label: 'Delete File',
    icon: 'i-heroicons-trash-20-solid',
    labelClass: 'text-red-500 dark:text-red-400',
    click: async () => {
      await $fetch(`/api/files/${file.id}`, { method: 'DELETE' })
      refresh()
    }
  }]]
}

</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(file, index) in files" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ file.path }} 
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(file, refresh)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
</template>
