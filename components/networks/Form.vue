
<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '#ui/types'
import { v4 as uuidv4 } from 'uuid';

defineProps({
  refresh: Function,
})

const emit = defineEmits(['close'])

const state = reactive({
  domain: "",
  ports: [22, 80, 443]
})
const selected = ref([22, 80, 443])

const ports = computed({
  get: () => selected.value,
  set: async (i) => {


    selected.value = i
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

async function onSubmit(refresh) {
  const body  = JSON.stringify({
      domain: state.domain,
      ports: selected.value,
    })
    console.log(body)
  await $fetch('/api/networks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body,
  })
  refresh()

  emit('close')
}

</script>


<template>
  <UForm :validate="validate" :validate-on="['submit']" :state="state" class="space-y-4" >
    <UFormGroup label="Domain Name" name="domainName" description="If you do not provide a domain name, one will be generated for you.">
      <UInput  v-model="state.domain">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">.app.flakery.xyz</span>
        </template>
      </UInput>
    </UFormGroup>

    <UFormGroup label="Ports" name="ports" de>
      <USelectMenu v-model="selected" :options="ports" multiple searchable searchable-placeholder="Select Ports..."
        creatable />
    </UFormGroup>


    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Save" color="black" @click="onSubmit(refresh)"/>
    </div>


  </UForm>
</template>
