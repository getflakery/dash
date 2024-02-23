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
      <UDashboardNavbar title="Home">
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton color="gray" variant="ghost" square @click="isNotificationsSlideoverOpen = true">
              <UChip color="red" inset>
                <UIcon name="i-heroicons-bell" class="w-5 h-5" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Create Templates" description="Invite new members by email address."
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
          <SettingsMembersForm @close="isInviteModalOpen = false" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
