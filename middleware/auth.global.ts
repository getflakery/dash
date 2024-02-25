export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()

    if (to.path.startsWith('/dashboard') && !loggedIn.value) {
      return navigateTo('/')
    }
  })
  