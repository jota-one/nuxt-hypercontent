<template>
  <div class="hc-app-header">
    <HcLogo
      shape-only
      class="hc-logo"
    />
    <ElButton
      type="primary"
      :icon="ElIconPlus"
      @click="handleNewSession"
    >
      New session
    </ElButton>
    <div style="flex: 1" />
    <ElSwitch
      v-model="isDark"
      size="large"
      inline-prompt
      :active-icon="ElIconSunny"
      :inactive-icon="ElIconMoon"
    />
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ElMessageBox } from 'element-plus'

const handleNewSession = () => {
  ElMessageBox.alert('Not implemented yet', 'Create new session', {
    confirmButtonText: 'OK',
  })
}

const isDark = useDark()
const toggleDark = useToggle(isDark)

watch(() => isDark.value, toggleDark)
</script>

<style lang="postcss" scoped>
.hc-app-header {
  height: 100%;
  display: flex;
  align-items: center;
  column-gap: 1rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--el-menu-border-color);
}

.hc-logo {
  margin-right: 1rem;
  width: calc((63 / 44) * 1.5rem);
  height: 1.5rem;
}
</style>
