import { useUserStore } from '~/store/UserStore'

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.includes('/violet')) {
    const { hasAuth } = useUserStore()

    if (hasAuth())
      return navigateTo('/violet/publish')

    return navigateTo('/violet/login')
  }
})
