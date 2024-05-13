<script setup lang="ts">
import type { Template, Network } from '~/types';

const props = defineProps<{
  refresh: () => void;
  template: Template;
}>();

const emit = defineEmits(['close'])

const deploying = ref(false)
const awsInstanceType = ref('t2.micro') // Default AWS instance type

const deployInstance = async () => {
  deploying.value = true

  try {
    let inst = await $fetch(`/api/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        "templateID": props.template.id,
        "instanceType": awsInstanceType.value, // Include AWS instance type in the request
      })
    })
    deploying.value = false

    useToast().add({
      title: 'Template Deployed',
      description: `Your template ${props.template.name} has been deployed as ${inst.name}.`,
      timeout: 5000,
      click: () => window.open(`/dashboard/deployment/${inst.id}`)
    })

    props.refresh()
    emit('close')
  } catch (e) {
    console.error(e)
    deploying.value = false
    useToast().add({
      title: 'Error',
      description: `There was an error deploying your template ${props.template.name}.`,
      timeout: 5000,
      click: () => console.error(e)
    })
  }
}

</script>

<template>
  <div class="flex flex-col space-y-4">
    <input v-model="awsInstanceType" placeholder="Enter AWS Instance Type" class="input input-bordered" />

    <div class="flex justify-end gap-4">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton icon="i-heroicons-paper-airplane" :loading="deploying" label="Deploy From Template"
        color="black" @click="deployInstance" />
    </div>
  </div>
</template>
