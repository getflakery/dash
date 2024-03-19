
<script setup lang="ts">
import type { Template, Network } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void;
  template: Template;
}>();

const emit = defineEmits(['close'])


const deploying = ref(false)

const deployInstance = async (id: string, refresh: () => void) => {
  deploying.value = true

  let inst = await $fetch(`/api/deployments`, {
    method: 'POST',
    body: JSON.stringify({
      "templateID": id,
      ...state,
      ports: selectedPorts.value,
      network: networkSelected.value,
      newNetWork: !newNetWork.value,
    })
  }
  )
  deploying.value = false

  useToast().add({
    title: 'Template Deployed',
    description: `Your template ${props.template.name}  has been deployed as ${inst.name}.`,
    timeout: 5000,
    click: () => {
      window.open(`/dashboard/deployment/${inst.id}`)
    }
  })

  refresh()
  emit('close')

}

const state = reactive({
  domain: "",
  ports: [22, 80, 443]

})
const selected = ref([])

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


const loading = ref(true)
const boxSelected = ref(true)



const networkLoading = ref(false)
const networkSelected = ref()

function clearNetworkSelected() {
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
  <UFormGroup label="Network" name="network">

    <UCheckbox v-model="boxSelected" name="createNetwork" label="Create Network using default settings" class="py-4" />

    <div class="flex items-center justify-between">

      <USelectMenu :searchable="networkSearch" v-model="networkSelected" :loading="networkLoading" class="py-4"
        placeholder="Search for a Network..." option-attribute="domain" trailing by="domain" :disabled="boxSelected" />
      <UButton v-if="networkSelected" @click="clearNetworkSelected" icon="i-heroicons-x-mark" variant="secondary"
        :disabled="boxSelected">
        Clear Selection
      </UButton>
      <UButton v-else-if="!newNetWork" @click="toggleNetwork" icon="i-heroicons-plus" variant="secondary"
        :disabled="boxSelected">Add New Network
      </UButton>
      <UButton v-else @click="toggleNetwork" icon="i-heroicons-x-mark" variant="secondary" :disabled="boxSelected">
        Cancel Add New Network
      </UButton>
    </div>

  </UFormGroup>

  <UFormGroup v-if="newNetWork && !networkSelected" label="Domain Name" name="domainName"
    description="If you do not provide a domain name, one will be generated for you.">
    <UInput v-model="state.domain">
      <template #trailing>
        <span class="text-gray-500 dark:text-gray-400 text-xs">.app.flakery.xyz</span>
      </template>
    </UInput>
  </UFormGroup>

  <UFormGroup v-if="newNetWork && !networkSelected" label="Ports" name="ports" de>
    <USelectMenu v-model="selected" :options="ports" multiple searchable searchable-placeholder="Select Ports..."
      creatable />
  </UFormGroup>


  <div class="flex justify-end gap-4">

    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton icon="i-heroicons-paper-airplane" :loading="deploying" type="submit" label="Deploy From Template"
      color="black" @click="deployInstance(
        props.template.id,
        props.refresh
      )" />
  </div>
</template>

