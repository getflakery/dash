<script lang="ts" setup>
import type { Deployment, Template } from '~/types'


const { data: deps, pending, refresh, } = await useFetch<Deployment[]>('/api/deployments', { default: () => [] })
const loading = ref(false)

const templates = await Promise.all(deps.value.map(async (d) => {
  const { data: template } = await useFetch<Template>(`/api/template/${d.templateID}`)
  return template
}));

const deployments = deps.value.map((d, i) => {
  return {
    ...d,
    template: templates[i].value?.name ? templates[i].value?.name: 'Unnamed Template',
    flakeURL: templates[i].value?.flakeURL
  }
})


const defaultColumns = [{
  key: 'name',
  label: 'Name',
}, {
  key: 'template',
  label: 'Template',
}, {
  key: 'flakeURL',
  label: 'Flake URL',

}]

const q = ref('')
const selected = ref<Deployment[]>([])
const selectedColumns = ref(defaultColumns)
const selectedStatuses = ref([])
const selectedLocations = ref([])
const sort = ref({ column: 'id', direction: 'asc' as const })
const input = ref<{ input: HTMLInputElement }>()
const isNewUserModalOpen = ref(false)

const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))

const query = computed(() => ({ q: q.value, statuses: selectedStatuses.value, locations: selectedLocations.value, sort: sort.value.column, order: sort.value.direction }))





function onSelect(row: Deployment) {
  sleep(100)
  const index = selected.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selected.value.push(row)
  } else {
    selected.value.splice(index, 1)
  }
}

defineShortcuts({
  '/': () => {
    input.value?.input?.focus()
  }
})


</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Deployments" :badge="deployments.length">
        <template #right>


          <UButton label="New Deployment" trailing-icon="i-heroicons-plus" color="gray" @click="isNewUserModalOpen = true" />
        </template>
      </UDashboardNavbar>


      <UDashboardModal v-model="isNewUserModalOpen" title="New user" description="Add a new user to your database"
        :ui="{ width: 'sm:max-w-md' }">
        <!-- ~/components/users/UsersForm.vue -->
        <!-- <UsersForm @close="isNewUserModalOpen = false" /> -->
        <DeploymentsForm @close="isNewUserModalOpen = false" :refresh="refresh" />

      </UDashboardModal>

      <UTable v-model="selected" v-model:sort="sort" :rows="deployments" :columns="columns" :loading="pending"
        sort-mode="manual" class="w-full" :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }" @select="onSelect">

        <!-- Name links to deployment id -->
        <template #name-data="{ row }">
          <NuxtLink :to="`/dashboard/deployment/${row.id}`">
            <!-- <span class="text-blue-500 dark:text-blue-400" >{{ row.name }}</span> -->
            <!-- also underline when hover -->
            <span class="text-blue-500 dark:text-blue-400 hover:underline" >{{ row.name }}</span>
          </NuxtLink>
        </template>

        <!-- Template links to template id -->
        <template #template-data="{ row }">
          <NuxtLink :to="`/dashboard/template/${row.templateID}`">
            <span class="text-blue-500 dark:text-blue-400 hover:underline" >{{ row.template }}</span>
          </NuxtLink>
        </template>


      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>
