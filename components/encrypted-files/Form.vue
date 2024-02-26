
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'


defineProps({
  refresh: Function,
})

const emit = defineEmits(['close'])

const state = reactive({
  path: "",
  content: "",
})

// https://ui.nuxt.com/components/form
const validate = (state: any): FormError[] => {
  const errors = []
  // if (!state.email) errors.push({ path: 'email', message: 'Please enter an email.' })
  return errors
}

function onSubmit(refresh) {
 return async (event: FormSubmitEvent<any>) => {
  
  // // post to /api/files
  await $fetch('/api/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event.data)
  })
  refresh()
  emit('close')
}
}
</script>


<template>
  <UForm :validate="validate" :validate-on="['submit']" :state="state" class="space-y-4" @submit="(event) => onSubmit(refresh)(event)">
    <UFormGroup label="Path" name="path">
      <UInput v-model="state.path" type="text" placeholder="/some/filesystem/path" autofocus />
    </UFormGroup>

    <UFormGroup label="Content" name="content">
      <UTextarea resize v-model="state.content" placeholder="File Content" class="w-full" />

    </UFormGroup>

    <!-- awsInstanceType -->


    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" />
    </div>


  </UForm>
</template>
