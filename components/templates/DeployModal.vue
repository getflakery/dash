
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
const publicIP = ref(false)
const loadBalancer = ref(true)
const minInstances = ref(1)
const maxInstances = ref(1)
const targetPort = ref(8080)


function addLBVals(lb: boolean, tp: number) {
  if (lb) {
    return {
      loadBalancer: lb,
      targetPort: tp
    }
  }
  return {
    loadBalancer: false,
  }
}

const deployInstance = async (id: string, refresh: () => void) => {
  deploying.value = true


  try {
    let inst = await $fetch(`/api/deployments`, {
      method: 'POST',
      body: JSON.stringify({
        "templateID": id,
        "awsInstanceType": awsInstanceType.value,
        "publicIP": publicIP.value,
        "minInstances": minInstances.value,
        "maxInstances": maxInstances.value,
        ...addLBVals(loadBalancer.value, targetPort.value)
        // "loadBalancer": loadBalancer.value,
        // "targetPort": targetPort.value
      })
    }
    )
    deploying.value = false

    await navigateTo(`/dashboard/deployment/${inst.id}`)

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
  <UFormGroup label="AWS Instance Type" name="awsInstanceType">
    <UInput v-model="awsInstanceType" label="AWS Instance Type" placeholder="t3.small" />
  </UFormGroup>


  <UFormGroup label="Min Instances" name="minInstances">
    <UInput v-model="minInstances" type="number" placeholder="1" />
  </UFormGroup>

  <UFormGroup label="Max Instances" name="maxInstances">
    <UInput v-model="maxInstances" type="number" placeholder="1" />
  </UFormGroup>

  <!-- checkbox for public ip default unchecked -->
  <UCheckbox v-model="publicIP" label="Public IP" />


  <UCheckbox v-model="loadBalancer" label="Load Balancer" />

  <UFormGroup label="Target Port" name="targetPort">
    <UInput v-model="targetPort" type="number" placeholder="8080"  :disabled="!loadBalancer"/>
  </UFormGroup>

  <div class="flex justify-end gap-4">
    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton icon="i-heroicons-paper-airplane" :loading="deploying" type="submit" label="Deploy From Template"
      color="black" @click="deployInstance(
        props.template.id,
        props.refresh,
      )" />
  </div>
</template>

