
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

import { reactive, ref } from 'vue';

defineProps({
  refresh: Function,
})


const emit = defineEmits(['close'])

const state = reactive({
  name: "",
  flakes: [],
})


function saveEdit(file: any){
  state.files.push(file)
}


async function onSubmit(refresh: Function | undefined) {
  // post state too /api/pipelines
  await $fetch('/api/pipelines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...state,
    })
  })

  if (refresh) {
    refresh()
  }

  emit('close')
}


</script>


<template>
  <UForm :state="state" class="space-y-4" @submit="onSubmit">

    <!-- rest of fields are optional  -->
    <!-- name -->
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" type="text" placeholder="Name" />
    </UFormGroup>



    <PipelinesFlakesForm  @save-edit="saveEdit"/>

    <a href="https://console.aws.amazon.com/cloudformation/home?#/stacks/new?stackName=crossaccountroleexample&templateURL=https://s3.us-west-1.amazonaws.com/pix.cloudformation.template/cloudformation.yaml" class="text-blue-500">Configure Cross Account Access Role</a>

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
}</style>
