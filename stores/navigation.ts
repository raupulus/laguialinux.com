import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const isCategoryMenuOpen = ref(false)
  const isSearchOpen = ref(false)
  const isMobileDrawerOpen = ref(false)
  const activeRootCategory = ref<string | null>(null)

  const toggleCategoryMenu = () => {
    isCategoryMenuOpen.value = !isCategoryMenuOpen.value
    if (isCategoryMenuOpen.value) {
      isSearchOpen.value = false
    }
  }

  const closeCategoryMenu = () => {
    isCategoryMenuOpen.value = false
  }

  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value
    if (isSearchOpen.value) {
      isCategoryMenuOpen.value = false
      isMobileDrawerOpen.value = false
    }
  }

  const closeSearch = () => {
    isSearchOpen.value = false
  }

  const toggleMobileDrawer = () => {
    isMobileDrawerOpen.value = !isMobileDrawerOpen.value
  }

  const closeMobileDrawer = () => {
    isMobileDrawerOpen.value = false
  }

  return {
    isCategoryMenuOpen,
    isSearchOpen,
    isMobileDrawerOpen,
    activeRootCategory,
    toggleCategoryMenu,
    closeCategoryMenu,
    toggleSearch,
    closeSearch,
    toggleMobileDrawer,
    closeMobileDrawer,
  }
})
