<template>
  <ElMenu collapse style="height: 100%">
    <ElMenuItem index="1">
      <template #title>Home</template>
      <NuxtLink :href="`/${currentLangCode}/admin`" no-prefetch>
        <ElIconHouse />
      </NuxtLink>
    </ElMenuItem>
    <ElMenuItem index="2" disabled>
      <template #title>Website</template>
      <NuxtLink no-prefetch>
        <ElIcon>
          <ElIconDocument />
        </ElIcon>
      </NuxtLink>
    </ElMenuItem>
    <ElMenuItem index="3" disabled>
      <template #title>Media</template>
      <NuxtLink no-prefetch>
        <ElIcon>
          <ElIconPicture />
        </ElIcon>
      </NuxtLink>
    </ElMenuItem>
    <ElMenuItem index="4">
      <template #title>Subscriptions</template>
      <NuxtLink :href="`/${currentLangCode}/admin/sisi`" no-prefetch>
        <ElIcon>
          <ElIconTicket />
        </ElIcon>
      </NuxtLink>
    </ElMenuItem>
    <ElMenuItem index="5" disabled>
      <template #title>Settings</template>
      <NuxtLink no-prefetch>
        <ElIcon>
          <ElIconSetting />
        </ElIcon>
      </NuxtLink>
    </ElMenuItem>
    <ElMenuItem index="6">
      <template #title>Back to site</template>
      <NuxtLink :href="`/${currentLangCode}`" no-prefetch>
        <ElIcon>
          <ElIconSwitchButton />
        </ElIcon>
      </NuxtLink>
    </ElMenuItem>
  </ElMenu>
</template>

<script setup lang="ts">
const { currentLangCode } = useSettings()
</script>
