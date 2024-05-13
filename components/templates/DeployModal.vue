
<script setup lang="ts">
import type { Template, Network } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void;
  template: Template;
}>();

const emit = defineEmits(['close'])


const deploying = ref(false)
const awsInstanceType = ref('t3.small')


const deployInstance = async (id: string, refresh: () => void) => {
  deploying.value = true


  try {
    let inst = await $fetch(`/api/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        "templateID": id,
        "awsInstanceType": awsInstanceType.value
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
  } catch (e) {
    console.error(e)
    deploying.value = false
    useToast().add({
      title: 'Error',
      description: `There was an error deploying your template ${props.template.name}.`,
      timeout: 5000,
      click: () => {
        console.error(e)
      }
    })
    return
  }


}

</script>


<template>
  <UInput v-model="awsInstanceType" label="AWS Instance Type" placeholder="t3.small" />

  <div class="flex justify-end gap-4">


    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton icon="i-heroicons-paper-airplane" :loading="deploying" type="submit" label="Deploy From Template"
      color="black" @click="deployInstance(
        props.template.id,
        props.refresh,
      )" />
  </div>
</template>

