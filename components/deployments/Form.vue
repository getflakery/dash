
<script setup lang="ts">
import type { Template, Network } from '~/types';
import { useDebounceFn } from '@vueuse/core'

// Define props with types
const props = defineProps<{
  refresh: () => void | undefined;
  template: Template;
}>();

const emit = defineEmits(['close'])


const deploying = ref(false)

const deployInstance = async (refresh: () => void  | undefined) => {
   
  deploying.value = true

  let inst = await $fetch(`/api/instances`, {
    method: 'POST',
    body: JSON.stringify({
      templateID: templateSelected.value.id,
      ...state,
    })
  }
  )
  deploying.value = false

  useToast().add({
    title: 'Instance Deployed',
    description: `Your instance ${inst.name} has been deployed.`,
    timeout: 5000,
    click: () => {
      window.open(`/dashboard/instance/${inst.id}`)
    }
  })

  if (refresh !== undefined) {
    refresh()
  }
  emit('close')

}

const state = reactive({
  domain: "",
  ports: [22, 80, 443]

})





const templateLoading = ref(false)
const templateSelected = ref()



async function templateSearch(q: string) {
  templateLoading.value = true
  const { data: templates } = await useFetch<Template[]>('/api/templates', { default: () => [] })


  templateLoading.value = false

  return templates.value.filter((t) => {
    return t
  })
}
const newTemplate = ref(false)

function toggleTemplate() {
  newTemplate.value = !newTemplate.value
}
</script>


<template>
  <UFormGroup label="Template" name="template">
    <USelectMenu :searchable="templateSearch" v-model="templateSelected" :loading="templateLoading" class="py-4"
      placeholder="Search for a template..." option-attribute="flakeURL" trailing by="flakeURL" />
    <UButton v-if="templateSelected" @click="clearTemplateSelected" icon="i-heroicons-x-mark" variant="secondary">
      Clear Selection
    </UButton>
    <UButton v-else-if="!newTemplate" @click="toggleTemplate" icon="i-heroicons-plus" variant="secondary">Add New Template
    </UButton>
    <UButton v-else @click="toggleTemplate" icon="i-heroicons-x-mark" variant="secondary">
      Cancel Add New Template
    </UButton>
    <!-- </div> -->

  </UFormGroup>


  <div class="flex justify-end gap-4">

    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton icon="i-heroicons-paper-airplane" :loading="deploying" type="submit" label="Deploy Instance From Template"
      color="black" @click="useDebounceFn(() =>deployInstance(props.refresh), 1000, { maxWait: 5000 })" />
  </div>
</template>

