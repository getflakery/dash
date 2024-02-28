<script setup lang="ts">
import type { Instance } from '~/types'


const route = useRoute()
const { data: instance, refresh } = await useFetch<Instance>(`/api/instance/${route.params.id}`)

console.log(instance)

const refreshing = ref(false)
const refreshAll = async () => {
  refreshing.value = true
  try {
    await refresh()
  } finally {
    refreshing.value = false
  }

}
</script>
  <template>
    <UDashboardPage>
      <UDashboardPanel grow>
        <UDashboardNavbar title="Instance Details">
          <template #right>
            <!-- link to documentation -->
            <ULink href="" target="_blank" class="flex items-center gap-2">
              <UIcon name="i-heroicons-book-open" />
              <span>Documentation</span>
            </ULink>
          </template>
        </UDashboardNavbar>
        <UDashboardPanelContent class="pb-24">
          <UDashboardSection :title="`${instance?.name} details`" orientation="horizontal"
            :ui="{ container: 'lg:sticky top-2' }">
          </UDashboardSection>
          <UCard :ui="{ header: { padding: 'p-4 sm:px-6' }, body: { padding: '' } }" class="min-w-0">

            <Accordion :items="instance?.logs.items" class="py-4">
              <template #item="{ item }">
                <pre class="code-block" style="overflow-x: scroll;">
{{ item.content }}
      </pre>
              </template>
            </Accordion>
          </UCard>
          <!-- <UDashboardModal v-model="isInviteModalOpen" title="Invite people"
          description="Invite new members by email address" :ui="{ width: 'sm:max-w-md' }">
          <EncryptedFilesForm @close="isInviteModalOpen = false" :refresh="refresh" />
        </UDashboardModal> -->
        </UDashboardPanelContent>

      </UDashboardPanel>
    </UDashboardPage>
</template>