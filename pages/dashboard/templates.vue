<script setup lang="ts">
import type { Template } from '~/types'

const { data: templates } = await useFetch<Template[]>('/api/members', { default: () => [] })

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

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search members" autofocus />
              <UButton label="Create New Template" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <!-- ~/components/settings/MembersList.vue -->
          <SettingsMembersList :templates="templates" />
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <TemplatesForm @close="isInviteModalOpen = false" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
