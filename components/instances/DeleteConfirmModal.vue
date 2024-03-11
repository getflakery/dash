
<script setup lang="ts">
import type { Instance } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void | undefined;
  instance: Instance;
}>();

const emit = defineEmits(['close'])

const confirmDelete = async (id: string, 
// deleteFiles: boolean,
 deleteNetwork: boolean, 
 refresh: () => void | undefined
 ) => {
  await $fetch(`/api/instances/delete/${id}`, {
    method: 'POST',
    body: JSON.stringify({
      // deleteFiles,
      deleteNetwork,
    })
  })
  if (refresh !== undefined) {
    refresh()
  }
  emit('close')

}

// const deleteFiles = ref(false)
const deleteNetworks = ref(true)


</script>


<template>
    <UCheckbox v-model="deleteNetworks" label="Delete Network"  />

  <!-- <UCheckbox v-model="deleteFiles" label="Delete Files" /> -->


  <div class="flex justify-end gap-3">

    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton type="submit" label="Confirm Delete" color="black" @click="confirmDelete(
      props.instance.id,
      // deleteFiles,
      deleteNetworks,
      props.refresh
    )" />
  </div>
</template>

