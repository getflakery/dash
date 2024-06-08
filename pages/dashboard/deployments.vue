<script lang="ts" setup>
import type { Deployment, Template } from '~/types'


const { data: deps, pending, refresh, } = await useFetch<Deployment[]>('/api/deployments', { default: () => [] })
const loading = ref(false)

const templates = await Promise.all(deps.value.map(async (d) => {
  const { data: template } = await useFetch<Template>(`/api/template/${d.templateID}`)
  return template
}));

const deployments = deps.value.map((d, i) => {
  const editMode = ref(false);

  const toggleEditMode = () => {
    editMode.value = !editMode.value;
  };

  return {
    ...d,
    template: templates[i].value?.name ? templates[i].value?.name : 'Unnamed Template',
    flakeURL: templates[i].value?.flakeURL,
    editMode,
    toggleEditMode
  }
})

const getEditMode = (id: string) => {
  const index = deployments.findIndex(d => d.id === id)
  return deployments[index].editMode.value
}

const toggleEditMode = (id: string) => {
  const index = deployments.findIndex(d => d.id === id)
  deployments[index].editMode.value = !deployments[index].editMode.value
}


const defaultColumns = [{
  key: 'name',
  label: 'Name',
}, {
  key: 'template',
  label: 'Template',
}, {
  key: 'flakeURL',
  label: 'Flake URL',

}, {
  key: 'host',
  label: 'URL',
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





defineShortcuts({
  '/': () => {
    input.value?.input?.focus()
  }
})


const oldName:{
  [key: string]: string
} = ref({})

function saveName(id: string) {
  // Put to /api/deployment/:id with new name in body
  let d = deployments.find(d => d.id === id)

  fetch(`/api/deployment/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: d?.name
    })
  }).then(() => {
    refresh()
    toggleEditMode(id)
  })
}

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Deployments" :badge="deployments.length">
        <template #right>


          <UButton label="New Deployment" trailing-icon="i-heroicons-plus" color="gray"
            @click="isNewUserModalOpen = true" />
        </template>
      </UDashboardNavbar>


      <UDashboardModal v-model="isNewUserModalOpen" title="New user" description="Add a new user to your database"
        :ui="{ width: 'sm:max-w-md' }">
        <!-- ~/components/users/UsersForm.vue -->
        <!-- <UsersForm @close="isNewUserModalOpen = false" /> -->
        <DeploymentsForm @close="isNewUserModalOpen = false" :refresh="refresh" />

      </UDashboardModal>

      <UTable :rows="deployments" :columns="columns" :loading="pending"
        sort-mode="manual" class="w-full" :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }">

        <!-- Name links to deployment id -->
        <template #name-data="{ row }">
          <div class="flex items-center justify-between gap-3 min-w-0 max-w-48">

            <NuxtLink v-if="!getEditMode(row.id)" :to="`/dashboard/deployment/${row.id}`">

              <!-- justify between -->

              <span class="text-blue-500 dark:text-blue-400 hover:underline">{{ row.name }}</span>

            </NuxtLink>
            <UButton v-if="!getEditMode(row.id)" @click="() => {
                oldName[row.id] = row.name
               toggleEditMode(row.id)
            }" icon="i-heroicons-pencil-square"
              variant="ghost" size="2xs">
            </UButton>
            <UInput v-if="getEditMode(row.id)" v-model="row.name"
              class="flex-grow mt-1 border-gray-300 text-sm font-normal" />
            <!-- cancel -->
            <UButton v-if="getEditMode(row.id)" @click="() => {
              row.name = oldName[row.id]
              toggleEditMode(row.id)
            }
              " icon="i-heroicons-x-mark-20-solid" variant="ghost" size="2xs" />
            <!-- save -->
            <UButton v-if="getEditMode(row.id)" @click="() => saveName(row.id)" icon="i-heroicons-check" size="2xs" />
          </div>
          

        </template>


        <!-- Template links to template id -->
        <template #template-data="{ row }">
          <NuxtLink :to="`/dashboard/template/${row.templateID}`">
            <span class="text-blue-500 dark:text-blue-400 hover:underline">{{ row.template }}</span>
          </NuxtLink>
        </template>

        <!-- URL links to self -->
        <template #host-data="{ row }">
          <NuxtLink :to="`https://${row.host}`" class="text-blue-500 dark:text-blue-400 hover:underline" target="_blank">
            {{ row.host }}
          </NuxtLink>
        </template>
     


      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>
