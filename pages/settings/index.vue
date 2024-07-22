<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'


const toast = useToast()
const creatingBinCache = ref(false)

const recreateBinCache = useDebounceFn(async () =>{
  creatingBinCache.value = true
  try {
    const resp = await $fetch("/api/private-binary-cache/", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    if (resp) {
      toast.add({
        title: 'Success',
        description: 'Binary cache recreated',
      })
    } else {
      toast.add({
        title: 'Error',
        description: 'Failed to recreate binary cache',
      })
    }
  } catch (e) {
    toast.add({
      title: 'Error',
      description: 'Failed to recreate binary cache',
    })
  }


  creatingBinCache.value = false

}, 1000, { maxWait: 5000 })

</script>

<template>
    <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Settings">
      </UDashboardNavbar>
  <UDashboardPanelContent class="pb-24">
    
    <UDashboardSection title="Binary Cache" 
    description="Your binary cache is private to your user account, and used for caching builds for your templates. To recreate a new binary cache, select the button to the right">
      <template #links>
        <UButton 
        label="Recreate Binary Cache" 
        color="black" 
        icon="i-heroicons-archive-box" 
        :loading="creatingBinCache"
        @click="recreateBinCache"
        />
      </template>
    </UDashboardSection>

  </UDashboardPanelContent>

</UDashboardPanel>
  </UDashboardPage>
</template>
