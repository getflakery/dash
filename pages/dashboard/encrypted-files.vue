<script setup lang="ts">
import type { File } from '~/types'

const { data: files, pending, error, refresh } = await useFetch<File[]>('/api/files', { default: () => [] })

const loading = ref(false)

const q = ref('')
const isInviteModalOpen = ref(false)


const { isNotificationsSlideoverOpen } = useDashboard()

const filterdFiles = computed(() => {
  return files.value.filter((file) => {
    return file.path.toLowerCase().includes(q.value.toLowerCase())
  })
})

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Files">
        <template #right>
          <!-- link to documentation -->
          <ULink href="" target="_blank" class="flex items-center gap-2">
            <UIcon name="i-heroicons-book-open" />
            <span>Documentation</span>
          </ULink>
        </template>
      </UDashboardNavbar>
      <UDashboardPanelContent class="pb-24">
        <UDashboardSection title="Create Files" description="Create an encrypted file that you can use to seed a new instance"
          orientation="horizontal" :ui="{ container: 'lg:sticky top-2' }">
        </UDashboardSection>
        <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">
          <template #header>
            <div class="flex items-center justify-between gap-2">

              <UInput v-model="q" icon="i-heroicons-magnifying-glass" placeholder="Search files" autofocus />
              <UButton label="Create New File" color="black" @click="isInviteModalOpen = true" />
            </div>
          </template>

          <!-- ~/components/settings/MembersList.vue -->
          <EncryptedFilesList :files="filterdFiles" :refresh="refresh" />
        </UCard>
        <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <!-- ~/components/settings/MembersForm.vue -->
          <EncryptedFilesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal>
      </UDashboardPanelContent>

    </UDashboardPanel>
  </UDashboardPage>
</template>
