<script setup lang="ts">
import type { Template } from '~/types'

defineProps({
  templates: {
    type: Array as PropType<Template[]>,
    default: () => []
  }
})

function getItems (template: Template) {
  return [[{
    label: 'Edit template',
    icon: 'i-heroicons-pencil-square-20-solid',
    click: () => console.log('Edit', template)
  }, 
  {
    label: 'Deploy Instance',
    icon: 'i-heroicons-server',
    click: () => console.log('Edit', template)
  }, 
  {
    label: 'Remove template',
    icon: 'i-heroicons-trash-20-solid',
    labelClass: 'text-red-500 dark:text-red-400',
    click: () => console.log('Remove', template)
  }]]
}

function onRoleChange (template: Template, role: string) {
  // Do something with data
  console.log(template.flakeUrl, role)
}
</script>

<template>
  <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-800">
    <li v-for="(template, index) in templates" :key="index" class="flex items-center justify-between gap-3 py-3 px-4 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">

        <div class="text-sm min-w-0">
          <p class="text-gray-900 dark:text-white font-medium truncate">
            {{ template.name }} 
          </p>
          <p class="text-gray-500 dark:text-gray-400 truncate">
            {{ template.flakeUrl }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <UDropdown :items="getItems(template)" position="bottom-end">
          <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </li>
  </ul>
</template>
