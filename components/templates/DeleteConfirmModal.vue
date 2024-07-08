
<script setup lang="ts">
import type { Template } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void;
  template: Template;
}>();

const emit = defineEmits(['close'])


const err = ref(false)
const errMessage = ref('')

const confirmDelete = async (id: string, deleteFiles: boolean, deleteNetwork: boolean, refresh: () => void) => {
  console.log("hmm")

  try {
    await $fetch(`/api/templates/delete/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        deleteFiles,
        deleteNetwork,
      })
    })
    refresh()
    emit('close')
    await navigateTo('/dashboard/templates')
  } catch (e) {
    console.log(e.data)
    errMessage.value = e.data
    err.value = true
  }



}

const deleteFiles = ref(false)
const deleteNetworks = ref(false)


</script>


<template>
  <!-- if err display error message, otherwise display regular modal -->

  <div v-if="err" >
    <div>
      <pre class="text-red-500 dark:text-red-400 whitespace-pre-line">{{ errMessage }}</pre>

    </div>
    <div class="flex justify-end gap-3"> 
      <UButton label="Close" color="gray" variant="ghost" @click="emit('close')"/>

    </div>



  </div>
  <div v-else>
    <div class="flex justify-end gap-3">
      <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
      <UButton type="submit" label="Confirm Delete" color="black" @click="confirmDelete(
        props.template.id,
        deleteFiles,
        deleteNetworks,
        props.refresh
      )" />
    </div>
  </div>
</template>

