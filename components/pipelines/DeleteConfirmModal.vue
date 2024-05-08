
<script setup lang="ts">
import type { Pipeline } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void;
  pipeline: Pipeline;
}>();

const emit = defineEmits(['close'])


const confirmDelete = async (id: string, deleteFiles: boolean, deleteNetwork: boolean, refresh: () => void) => {
  await $fetch(`/api/pipelines/delete/${id}`, {
    method: 'POST',
    body: JSON.stringify({
      deleteFiles,
      deleteNetwork,
    })
  })
  refresh()
  emit('close')
  await navigateTo('/dashboard/pipelines')

}

const deleteFiles = ref(false)
const deleteNetworks = ref(false)


</script>


<template>
  <div class="flex justify-end gap-3">
    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton type="submit" label="Confirm Delete" color="black" @click="confirmDelete(
      props.pipeline.id,
      deleteFiles,
      deleteNetworks,
      props.refresh
    )" />
  </div>
</template>

