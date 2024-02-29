
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

import { reactive, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import type { Network } from '~/types'

defineProps({
  refresh: Function,
})


const emit = defineEmits(['close'])

const state = reactive({
  name: "",
  flakeURL: "",
  awsInstanceType: "",
  files: [],
  domain: "",
  ports: [22, 80, 443]
})

const selectedPorts = ref([22, 80, 443])
const ports = computed({
  get: () => selectedPorts.value,
  set: async (i) => {


    selectedPorts.value = i
    state.ports.concat(i)
    // deduplicate
    state.ports = Array.from(new Set(state.ports))
  }
})


// https://ui.nuxt.com/components/form
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Please enter an email.' })
  return errors
}

async function onSubmit(refresh: Function | undefined) {
  // post state too /api/templates
  await $fetch('/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...state,
      ports: selectedPorts.value,
      network: networkSelected.value,
      newNetWork: !newNetWork.value, 
    })
  })
  
  if (refresh) {
    refresh()
  }

  emit('close')
}


const editing = ref({});
const prevState = ref({});

function startEdit(file) {
  editing.value[file.id] = true;
  prevState.value[file.id] = { ...file };
}

function cancelEdit(file, index) {
  editing.value[file.id] = false;
  if (file.notInDb) {
    state.files.splice(index, 1);
  } else {
    Object.assign(files[index], prevState.value[file.id]);
  }
}

function saveEdit(file) {
  editing.value[file.id] = false;
  file.notInDb = false;
  // Implement saving logic here, e.g., API call
}

function deleteFile(index) {
  state.files.splice(index, 1);
  // Optionally, handle backend deletion here
}

function addFile() {
  const newFile = { path: '', content: '', id: uuidv4(), notInDb: true };
  state.files.push(newFile);
  startEdit(newFile);
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



const networkLoading = ref(false)
const networkSelected = ref()

function clearNetworkSelected(){
  networkSelected.value = undefined
}

async function networkSearch(q: string) {
  loading.value = true
  const { data: networks } = await useFetch<Network[]>('/api/networks', { default: () => [] })


  loading.value = false

  return networks.value.filter((network) => {
    return network.domain.toLowerCase().includes(q.toLowerCase())
  })
}


const newNetWork = ref(false)

function toggleNetwork() {
  newNetWork.value = !newNetWork.value
}


</script>


<template>
  <UForm :validate="validate" :validate-on="['submit']" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Flake URL" name="flakeURL">
      <UInput v-model="state.flakeURL" type="text" placeholder="github:getflakery/basic-flake" autofocus />
    </UFormGroup>

    <!-- rest of fields are optional  -->
    <!-- name -->
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" type="text" placeholder="Name" />
    </UFormGroup>

    <!-- awsInstanceType -->
    <UFormGroup label="AWS Instance Type" name="awsInstanceType">
      <UInput v-model="state.awsInstanceType" type="text" placeholder="t3.small" />
    </UFormGroup>

    <UFormGroup label="Files" name="files">


      <div class="flex items-center justify-between">

        <USelectMenu v-model="selected" :loading="loading" :searchable="search" placeholder="Search for a file by path"
          option-attribute="path" multiple trailing by="id" />

        <UButton @click="addFile" icon="i-heroicons-plus" variant="secondary">Add New File</UButton>

      </div>




      <transition-group name="file-list" tag="div" class="space-y-4 my-4">
        <div v-for="(file, index) in state.files.concat(selected)" :key="file.id"
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

    <UFormGroup label="Network" name="network">

      <UCheckbox v-model="boxSelected" name="createNetwork" label="Create Network using default settings" class="py-4" />

      <div class="flex items-center justify-between">

        <USelectMenu :searchable="networkSearch" v-model="networkSelected" :loading="networkLoading" class="py-4"
          placeholder="Search for a Network..." option-attribute="domain" trailing by="domain" :disabled="boxSelected" />
          <UButton v-if="networkSelected" @click="clearNetworkSelected" icon="i-heroicons-x-mark" variant="secondary" :disabled="boxSelected">
            Clear Selection
        </UButton>
          <UButton v-else-if="!newNetWork" @click="toggleNetwork" icon="i-heroicons-plus" variant="secondary" :disabled="boxSelected">Add New Network
        </UButton>
        <UButton v-else @click="toggleNetwork" icon="i-heroicons-x-mark" variant="secondary" :disabled="boxSelected">Cancel Add New Network
        </UButton>
      </div>

    </UFormGroup>

    <UFormGroup v-if="newNetWork && !networkSelected" label="Domain Name" name="domainName" description="If you do not provide a domain name, one will be generated for you.">
      <UInput  v-model="state.domain">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">.app.flakery.xyz</span>
        </template>
      </UInput>
    </UFormGroup>

    <UFormGroup v-if="newNetWork && !networkSelected" label="Ports" name="ports" de>
      <USelectMenu v-model="selected" :options="ports" multiple searchable searchable-placeholder="Select Ports..."
        creatable />
    </UFormGroup>



    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" @click="onSubmit(refresh)" />
    </div>


  </UForm>
</template>

<style scoped>
.file-list-enter-active,
.file-list-leave-active,
.file-list-move {
  transition: all 0.5s ease;
}

.file-list-enter,
.file-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
