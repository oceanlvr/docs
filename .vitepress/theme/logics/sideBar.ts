import { computed, ref } from 'vue'
import { useData, useRoute } from 'vitepress'
import { getSideBarConfig } from '@/utils'
import { useActiveSidebarLinks } from './activeSidebarLink'
import type { Header } from '@/types'
import type { DefaultTheme } from 'vitepress'

export const openSideBar = ref(false)

export const toggleSidebar = (to?: boolean) => {
  openSideBar.value = typeof to === 'boolean' ? to : !openSideBar.value
}

export function useSideBar() {
  const route = useRoute()
  const { site } = useData()

  useActiveSidebarLinks()

  return computed(() => {
    // at first, we'll check if we can find the sidebar setting in frontmatter.
    const headers = route.data.headers
    const frontSidebar = route.data.frontmatter.sidebar
    const sidebarDepth = route.data.frontmatter.sidebarDepth

    // if it's `false`, we'll just return an empty array here.
    if (frontSidebar === false)
      return []

    // if it's `auto`, render headers of the current page
    if (frontSidebar === 'auto')
      return resolveAutoSidebar(headers, sidebarDepth)

    // now, there's no sidebar setting at frontmatter; let's see the configs
    const themeSidebar = getSideBarConfig(
      site.value.themeConfig.sidebar,
      route.data.relativePath,
    )

    if (themeSidebar === false)
      return []

    if (themeSidebar === 'auto')
      return resolveAutoSidebar(headers, sidebarDepth)

    return themeSidebar
  })
}

function resolveAutoSidebar(
  headers: Header[],
  depth: number,
): DefaultTheme.SideBarItem[] {
  const ret: DefaultTheme.SideBarItem[] = []

  if (headers === undefined)
    return []

  let lastH2: DefaultTheme.SideBarItem | undefined
  headers.forEach(({ level, title, slug }) => {
    if (level - 1 > depth)
      return

    const item: DefaultTheme.SideBarItem = {
      text: title,
      link: `#${slug}`,
    }
    if (level === 2) {
      lastH2 = item
      ret.push(item)
    } else if (lastH2) {
      ((lastH2 as any).children || ((lastH2 as any).children = [])).push(item)
    }
  })

  return ret
}
