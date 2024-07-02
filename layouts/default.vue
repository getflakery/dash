<script setup lang="ts">
import type { Template } from '~/types'

const { data: templates, refresh } = await useFetch<Template[]>('/api/templates', { default: () => [] })
const isInviteModalOpen = ref(false)

const route = useRoute()
const appConfig = useAppConfig()
const { isHelpSlideoverOpen } = useDashboard()

const links = [{
  id: 'templates',
  label: 'Templates',
  icon: 'i-heroicons-squares-2x2',
  to: '/dashboard/templates',

}, {
  id: 'deployments',
  label: 'Deployments',
  to: '/dashboard/deployments',
  icon: 'i-heroicons-server-stack',
  // badge: '4',
}]

const footerLinks = [{
  label: 'Help & Support',
  icon: 'i-heroicons-question-mark-circle',
  click: () => isHelpSlideoverOpen.value = true
}]

const deployInstance = ref(false)
const templateToDeploy = ref()

const groups = [{
  key: 'links',
  label: 'Go to',
  commands: links.map(link => ({ ...link, shortcuts: link.tooltip?.shortcuts }))
},
  // add navigation to template details page for each template
  ...templates.value.map(template => ({
    key: template.id,
    label: template.name,
    commands: [{
      id: `details-${template.id}`,
      label: `View ${template.name} ${template.flakeURL}`,
      icon: 'i-heroicons-document',
      click: () => {
        navigateTo(`/dashboard/template/${template.id}`)
      }
    }]
  })),
  ...templates.value.map(template => ({
    key: template.id,
    label: template.name,
    commands: [{
      id: `deploy-${template.id}`,
      label: `Deploy ${template.name} ${template.flakeURL}`,
      icon: 'i-heroicons-server',
      click: () => {
        deployInstance.value = true
        templateToDeploy.value = template
      }
    }]
  })),
  

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
        },
        children: [{
          label: 'Quick Start',
          to: '/documentation/quick-start',
          exact: true
        }, {
          label: 'Add Flakery to existing NixOS configuration',
          to: '/documentation/add-flakery-to-existing-nixos-configuration'
        },
        {
          label: 'Create a new project from a template',
          to: '/documentation/create-a-new-project'
        }
      ],
      }
    ]" />

        <div class="flex-1" />

        <UDashboardSidebarLinks :links="footerLinks" />

        <UDivider class="sticky bottom-0" />


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

  <UDashboardModal v-model="deployInstance"
    :title="`Deploy Template: ${templateToDeploy?.name ? templateToDeploy?.name : templateToDeploy?.flakeURL}`"
    description="" :ui="{ width: 'sm:max-w-md' }">
    <TemplatesDeployModal @close="deployInstance = false" :refresh="refresh" :template="templateToDeploy" />
  </UDashboardModal>
</template>
