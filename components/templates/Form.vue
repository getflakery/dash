
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'

import { reactive, ref } from 'vue';
import { useDebounceFn } from '@vueuse/core'


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

const submitting = ref(false);

async function onSubmit() {
  submitting.value = true

  // post state too /api/templates
  let resp = await $fetch('/api/templates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...state,
    })
  })

  // redirect to dashboard/template/{resp.id}
  await navigateTo(`/dashboard/template/${resp.id}`)

  submitting.value = false


}


const save = useDebounceFn(onSubmit, 1000, { maxWait: 5000 })

</script>


<template>
  <UForm :validate="validate" :validate-on="['submit']" :state="state" class="space-y-4">
    <UFormGroup label="Flake URL" name="flakeURL">
      <UInput v-model="state.flakeURL" type="text" placeholder="github:getflakery/basic-flake" autofocus />
    </UFormGroup>

    <!-- rest of fields are optional  -->
    <!-- name -->
    <UFormGroup label="Name" name="name">
      <UInput v-model="state.name" type="text" placeholder="Name" />
    </UFormGroup>


    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" @click="save"   :disabled="submitting" :loading="submitting" />
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
