<script setup lang="ts">
import type { Instance, File } from '~/types'
import { v4 as uuidv4 } from 'uuid';


const route = useRoute()
const { data: instance, refresh } = await useFetch<Instance>(`/api/instance/${route.params.id}`)
const { data: files, refreshFiles } = await useFetch<File[]>(`/api/files/templates/${instance.value?.templateID}`)


const refreshing = ref(false)
const refreshAll = async () => {
  refreshing.value = true
  try {
    await refresh()
  } finally {
    refreshing.value = false
  }

}

const loading = ref(false);
const selected = ref([])
async function search(q: string) {
  loading.value = true
  let files = await $fetch('/api/files');
  loading.value = false
  return files.filter((file) => {
    return file.path.toLowerCase().includes(q.toLowerCase())
  })
}
const boxSelected = ref(true)


const editing = ref({});
const prevState = ref({});

function startEdit(file) {
  editing.value[file.id] = true;
  prevState.value[file.id] = { ...file };
}

function cancelEdit(file, index) {
  editing.value[file.id] = false;
  if (file.notInDb) {
    files.value = files.value?.splice(index, 1);
  } else {
    Object.assign(files[index], prevState.value[file.id]);
  }
}

async function saveEdit(file) {
  editing.value[file.id] = false;
  file.notInDb = false;
  // todo Implement saving logic here, e.g., API call
  // // post to /api/files
  await $fetch(`/api/files/template/${instance.value?.templateID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "file": file
    })
  })
  refreshFiles()
}

function deleteFile(index) {
  files.value?.splice(index, 1);
  // Optionally, handle backend deletion here
}

function addFile() {
  const newFile = { path: '', content: '', id: uuidv4(), notInDb: true };
  if (files.value == null){
    files.value = [newFile]
  } else {
    files.value.push(newFile)
  }
  startEdit(newFile);
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

            <UFormGroup label="Files" name="files">
      <div class="flex items-center justify-between">
        <USelectMenu v-model="selected" :loading="loading" :searchable="search" placeholder="Search for a file by path"
          option-attribute="path" multiple trailing by="id" />
        <UButton @click="addFile" icon="i-heroicons-plus" variant="secondary">Add New File</UButton>
      </div>




      <transition-group name="file-list" tag="div" class="space-y-4 my-4">
        <div v-for="(file, index) in files?.concat(selected)" :key="file.id"
          class="rounded-lg file-list-enter-active">
          <div v-if="editing[file.id]">
            <UTextarea :rows="1" v-model="file.path" placeholder="File System Path" class="my-4 w-full" />
            <UTextarea resize v-model="file.content" placeholder="File Content" class="w-full my-4" />
            <div class="flex justify-between  my-4">
              <UButton @click="cancelEdit(file, index)" icon="i-heroicons-arrow-left" variant="secondary">Cancel
                Editing</UButton>
              <div>
                <UButton @click="deleteFile(index)" icon="i-heroicons-x-mark" variant="secondary">Delete
                </UButton>
                <UButton @click="saveEdit(file)" icon="i-heroicons-check">Save</UButton>
              </div>
            </div>
          </div>
          <div v-else>

            <div class="flex items-center justify-between">
              <div class="flex-1 font-medium">{{ file.path }}</div>
              <div>
                <UButton class="mr-2" variant="soft" size="2xs" icon="i-heroicons-pencil-square"
                  @click="startEdit(file)" />
                <UButton class="mr-2" color="red" variant="soft" size="2xs" icon="i-heroicons-x-mark-20-solid"
                  @click="deleteFile(index)" />
              </div>


            </div>
            <UDivider class="my-4" />
          </div>
        </div>
      </transition-group>
    </UFormGroup>
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
