<script setup lang="ts">
const route = useRoute()
const appConfig = useAppConfig()
const { isHelpSlideoverOpen } = useDashboard()

const links = [{
  id: 'templates',
  label: 'Templates',
  icon: 'i-heroicons-squares-2x2',
  to: '/dashboard/templates',

}, {
  id: 'instances',
  label: 'Instances',
  icon: 'i-heroicons-server',
  to: '/dashboard/instances',
  badge: '4',
}, {
  id: 'clusters',
  label: 'Clusters (coming soon!)',
  icon: 'i-heroicons-server-stack',
  // to: '/clusters',
  disabled: true,
}, {
  id: 'network',
  label: 'Networks',
  icon: 'i-heroicons-globe-alt',
  to: '/dashboard/network',
}, {
  id: 'encrypted-files',
  label: 'Encrypted Files',
  icon: 'i-heroicons-lock-closed',
  to: '/dashboard/encrypted-files',
}]

const footerLinks = [{
  label: 'Help & Support',
  icon: 'i-heroicons-question-mark-circle',
  click: () => isHelpSlideoverOpen.value = true
}]

const groups = [{
  key: 'links',
  label: 'Go to',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
},
{
  key: 'create',
  label: 'Create',
  commands: [{
    id: 'instance',
    label: "Create Instance",
    icon: 'i-heroicons-server',
    click: () => createInstanceOpen.value = true
  },
 ]
}
  //  {
  //   key: 'code',
  //   label: 'Code',
  //   commands: [{
  //     id: 'source',
  //     label: 'View page source',
  //     icon: 'i-simple-icons-github',
  //     click: () => {
  //       window.open(`https://github.com/nuxt-ui-pro/dashboard/blob/main/pages${route.path === '/' ? '/index' : route.path}.vue`, '_blank')
  //     }
  //   }
  // ]
  // }
]

const createInstanceOpen = ref(false)

const defaultColors = ref(['green', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet'].map(color => ({ label: color, chip: color, click: () => appConfig.ui.primary = color })))
const colors = computed(() => defaultColors.value.map(color => ({ ...color, active: appConfig.ui.primary === color.label })))
</script>

<template>
  <UDashboardLayout>
    <UDashboardPanel :width="250" :resizable="{ min: 200, max: 300 }" collapsible>

      <UDashboardSidebar>
        <template #header>
          <UDashboardSearchButton />
        </template>

        <UDashboardSidebarLinks :links="links" />

        <UDivider />

        <UDashboardSidebarLinks :links="[
          {
            id: 'documentation',
            label: 'Documentation',
            icon: 'i-heroicons-book-open',
            to: '/documentation',
            tooltip: {
              text: 'Documentation',
              shortcuts: ['G', 'D']
            }
          }
        ]" />

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="sticky bottom-0" />

        <template #footer>
          <!-- ~/components/UserDropdown.vue -->
          <UserDropdown />
        </template>
      </UDashboardSidebar>
    </UDashboardPanel>

    <slot />

    <!-- ~/components/HelpSlideover.vue -->
    <HelpSlideover />
    <!-- ~/components/NotificationsSlideover.vue -->
    <NotificationsSlideover />

    <ClientOnly>
      <LazyUDashboardSearch :groups="groups" />
    </ClientOnly>
  </UDashboardLayout>
  <UDashboardModal v-model="createInstanceOpen" title="Create Instance" :ui="{ width: 'sm:max-w-md' }">
    <!-- ~/components/settings/MembersForm.vue -->
    <InstancesForm @close="createInstanceOpen = false" />
  </UDashboardModal>
</template>
