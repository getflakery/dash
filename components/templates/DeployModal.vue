
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






  <div class="flex justify-end gap-4">

    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton icon="i-heroicons-paper-airplane" :loading="deploying" type="submit" label="Deploy From Template"
      color="black" @click="deployInstance(
        props.template.id,
        props.refresh
      )" />
  </div>
</template>

