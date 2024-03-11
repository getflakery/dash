<script setup lang="ts">
import type { Template } from '~/types'

const { data: templates, refresh } = await useFetch<Template[]>('/api/templates', { default: () => [] })

const loading = ref(false)

const q = ref('')
const isInviteModalOpen = ref(false)


const { isNotificationsSlideoverOpen } = useDashboard()

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Templates">
        <template #right>
          <!-- link to documentation -->
          <ULink href="" target="_blank" class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" />
            <span>Documentation</span>
          </ULink>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Create Templates" description="Create a template to deploy your nix flake"
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search Templates" />
              <UButton label="Create New Template" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <!-- ~/components/settings/MembersList.vue -->
          <TemplatesList :templates="templates" :refresh="refresh"/>
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Create a Template"
          description="Create a template from a flake url, optionally add files and network configuration" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <TemplatesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
