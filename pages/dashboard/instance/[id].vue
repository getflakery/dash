<script setup lang="ts">
import type { Instance, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const route = useRoute()

const { data: instance, refresh } = await useFetch<Instance>(`/api/instance/${route.params.id}`)


function cancelEdit(file, index) {
  editing.value[file.id] = false;
  if (file.notInDb) {
    files.value = files.value?.splice(index, 1);
  } else {
    Object.assign(files[index], prevState.value[file.id]);
  }
}



</script>
  <template>
    <UDashboardPage>
      <UDashboardPanel grow>
        <UDashboardNavbar title="Instance Details">
          <template #right>
            <!-- link to documentation -->
            <ULink href="" target="_blank" class="flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" />
              <span>Documentation</span>
            </ULink>
          </template>
        </UDashboardNavbar>
        <UDashboardPanelContent class="pb-24">
          <UDashboardSection :title="`${instance?.name} details`" orientation="horizontal"
            :ui="{ container: 'lg:sticky top-2' }">
          </UDashboardSection>

          <UCard>
            <NuxtLink :to="`https://${instance?.network.domain}.app.flakery.xyz`" target="_blank">
              https://{{ instance?.network.domain }}.app.flakery.xyz      
            </NuxtLink>

            <!-- Logs: -->
            <h2 class="text-lg font-semibold mt-4">Logs</h2>
            <Accordion :items="instance?.logs.items" class="py-4">
              <template #item="{ item }">

      <pre class="code-block custom-scroll">
        <!-- Display item content with proper indentation and clarity -->
{{ item.content }}
      </pre>

              </template>
            </Accordion>
            <TemplatesFileForm :templateID="instance?.templateID" />
          </UCard>
          <!-- <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <EncryptedFilesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal> -->
        </UDashboardPanelContent>

      </UDashboardPanel>
    </UDashboardPage>
</template>


<style scoped>
/* Additional CSS for custom styling and scroll behavior */
.code-block {
  overflow-x: auto; /* Ensures that horizontal scrolling is only shown when necessary */
  background-color: #f5f5f5; /* Light background color for the code block */
  border-radius: 4px; /* Rounded corners for the code block */
  padding: 1rem; /* Adequate padding around the content */
  font-family: 'Fira Code', monospace; /* Monospace font for better code readability */
  overflow-x: scroll;
}

.custom-scroll::-webkit-scrollbar {
  width: 8px; /* Custom scrollbar width */
}

.custom-scroll::-webkit-scrollbar-track {
  background: #e0e0e0; /* Scrollbar track color */
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #a0a0a0; /* Scrollbar thumb color */
  border-radius: 4px; /* Rounded corners for the scrollbar thumb */
}
</style>
