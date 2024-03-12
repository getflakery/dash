
<script setup lang="ts">
import type { Instance } from '~/types';

// Define props with types
const props = defineProps<{
  refresh: () => void | undefined;
  instance: Instance;
}>();

const emit = defineEmits(['close'])

const confirm = async (id: string, 
 refresh: () => void | undefined
 ) => {
  await $fetch(`/api/instances/redeploy/${id}`, {
    method: 'POST',
  })
  if (refresh !== undefined) {
    refresh()
  }
  emit('close')
}


</script>


<template>
  <div class="flex justify-end gap-3">
    <UButton label="Cancel" color="gray" variant="ghost" @click="emit('close')" />
    <UButton type="submit" label="Confirm Redeploy" color="black" @click="confirm(
      props.instance.id,
      props.refresh
    )" />
  </div>
</template>

