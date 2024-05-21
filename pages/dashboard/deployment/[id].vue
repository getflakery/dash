<script setup lang="ts">
import type { Deployment, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const route = useRoute()

const { data: deployment, refresh } = await useFetch<Deployment>(`/api/deployment/${route.params.id}`)
const deleteModal = ref(false)
const redeployModal = ref(false)




function getItems(deployment: Deployment, refresh: Function) {
  return [
    // [{
    //     label: 'Redeploy',
    //     icon: 'i-heroicons-paper-airplane',
    //     click: async () => {
    //       redeployModal.value = true
    //     }
    //   }],  
    [{
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
      labelClass: 'text-red-500 dark:text-red-400',
      click: async () => {
        deleteModal.value = true
      }
    }]]
}

</script>
<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Deployment Details">
        <template #right>
          <UDropdown :items="getItems(i, refresh)" position="bottom-end">
            <UButton color="white" label="Actions" trailing-icon="i-heroicons-chevron-down-20-solid" />
          </UDropdown>


        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection :title="`${deployment?.name} details`" orientation="horizontal"
          :ui="{ container: 'Flg:sticky top-2' }">
        </UDashboardSection>

        <UCard>


          <!-- Logs: -->
          <UDashboardSection title="Logs" orientation="horizontal" :ui="{ container: 'Flg:sticky top-2' }">
            <div class="code-block" style="height: 300px;">
              <pre class="custom-scroll">
                <code>
                  {{ deployment?.logs.reduce(
                    (acc, log) => acc + log.exec + '\n',
                    '') }}
                </code>
              </pre>
            </div>
          </UDashboardSection>

        </UCard>
        <!-- <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <EncryptedFilesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal> -->
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
  <UDashboardModal v-model="deleteModal" title="Confirm Delete" description="Delete Deployment"
    :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsDeleteConfirmModal @close="deleteModal = false" :refresh="refresh" :deployment="deployment" />
  </UDashboardModal>
  <UDashboardModal v-model="redeployModal" title="Confirm Redeploy" :ui="{ width: 'sm:max-w-md' }">
    <DeploymentsRedeployModal @close="redeployModal = false" :refresh="refresh" :deployment="deployment" />
  </UDashboardModal>
</template>


<style scoped>
/* Additional CSS for custom styling and scroll behavior */
.code-block {
  overflow-x: auto;
  /* Ensures that horizontal scrolling is only shown when necessary */
  background-color: #f5f5f5;
  /* Light background color for the code block */
  border-radius: 4px;
  /* Rounded corners for the code block */
  padding: 1rem;
  /* Adequate padding around the content */
  font-family: 'Fira Code', monospace;
  /* Monospace font for better code readability */
  overflow-x: scroll;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px;
  /* Custom scrollbar width */
}

.custom-scroll::-webkit-scrollbar-track {
  background: #e0e0e0;
  /* Scrollbar track color */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #a0a0a0;
  /* Scrollbar thumb color */
  border-radius: 4px;
  /* Rounded corners for the scrollbar thumb */
}
</style>
