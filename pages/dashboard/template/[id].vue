<script setup lang="ts">
import type { Template, Deployment, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const route = useRoute()

const { data: template, refresh } = await useFetch<Template>(`/api/template/${route.params.id}`)


const editMode = ref(false);

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

const name = ref(template.value?.name)
const flakeURL = ref(template.value?.flakeURL)

const deleteModal = ref(false)
const templateToDelete = ref()

const deployInstance = ref(false)
const templateToDeploy = ref()

const saveEdit = async function () {
  await fetch(`/api/template/${template.value?.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.value,
      flakeURL: flakeURL.value
    })
  });
  // todo toast
  await refresh();
  toggleEditMode();
}

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
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Template Details">
        <template #right>
          <UDropdown :items="getItems(template, refresh)" position="bottom-end">
          <UButton color="white" label="Template Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="">

        <div class="grid lg:grid-cols-2 lg:items-start gap-4 mt-4">
          <UCard>


            <div v-if="editMode" class="flex justify-end mb-4">
              <UButton @click="async () => {
              toggleEditMode()
              await refresh()
            }" icon="i-heroicons-x-mark" variant="ghost" class="mb-2 px-4 py-1">Cancel</UButton>
              <UButton @click="saveEdit" icon="i-heroicons-check" class="mb-2 px-4 py-1">Save</UButton>
            </div>

            <div class="grid grid-cols-[auto_minmax(0,_1fr)] gap-4">
              <!-- Name -->
              <h3 class="text-lg font-semibold leading-tight">
                Name:
              </h3>
              <div class="flex items-center justify-between">

                <UTextarea v-if="editMode" :rows="1" v-model="name"
                  class="flex-grow mt-1 border-gray-300 text-sm font-normal" />

                <div v-else class="flex-grow mt-1 rounded-md border-gray-300 shadow-sm text-sm font-normal p-2 mr-2">
                  {{ template?.name }}

                </div>
                <div>
                  <UButton v-if="!editMode" @click="toggleEditMode" icon="i-heroicons-pencil-square" variant="ghost"
                    class="mb-2 mx-2 px-4 py-1">Edit</UButton>

                </div>
              </div>
              <!-- Other sections remain unchanged -->
              <!-- Flake -->
              <div class="flex items-center">
                <h3 class="text-lg font-semibold leading-tight">
                  Flake:
                </h3>
              </div>
              <UTextarea v-if="editMode" :rows="1" v-model="flakeURL"
                class="flex-grow mt-1 border-gray-300 text-sm font-normal" />

              <div v-else class="flex-grow mt-1 rounded-md border-gray-300 shadow-sm text-sm font-normal p-2">
                {{ template?.flakeURL }}

              </div>


              <!-- AWS Instance Type -->


              <!-- Instance Type -->
              <div class="flex items-center">
                <h3 class="text-lg font-semibold leading-tight">
                  AWS Instance Type:
                </h3>
              </div>

              <UTextarea v-if="editMode" :rows="1" class="flex-grow mt-1 border-gray-300 text-sm font-normal" />

              <div v-else class="flex-grow mt-1 rounded-md border-gray-300 shadow-sm text-sm font-normal p-2">
                TODO
              </div>


            </div>

          </UCard>
          <UCard>
            <h3 class="text-lg font-semibold leading-tight">
                  Deployments:
                </h3>
            <DeploymentsList :deployments="template?.deployments" :refresh="refresh" />
          </UCard>
          <UCard>
            <h3 class="text-lg font-semibold leading-tight">
                  Files:
                </h3>
            <TemplatesFileForm :templateID="template?.id" />
          </UCard>


        </div>


      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
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
