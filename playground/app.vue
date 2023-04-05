<template>
  <div>
    Nuxt module playground!
    <pre>{{ langCodes }}</pre>
  </div>
</template>

<script setup lang="ts">
import {useSettings} from "#imports";

const { loadSettings, langCodes } = useSettings()

loadSettings()
</script>
