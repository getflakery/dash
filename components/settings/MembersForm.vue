
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { v4 as uuidv4 } from 'uuid';


const emit = defineEmits(['close'])

const state = reactive({
  name: "",
  flakeURL: "",
  awsInstanceType: "",
})

// https://ui.nuxt.com/components/form
const validate = (state: any): FormError[] => {
  const errors = []
  if (!state.email) errors.push({ path: 'email', message: 'Please enter an email.' })
  return errors
}

async function onSubmit(event: FormSubmitEvent<any>) {
  // Do something with data
  console.log(event.data)

  emit('close')
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

    <UFormGroup label="Files" name="files">

      <FileMenu />
    </UFormGroup>
    <UFormGroup label="Network" name="network">

      <FileMenu />
    </UFormGroup>

    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" />
    </div>


  </UForm>
</template>
