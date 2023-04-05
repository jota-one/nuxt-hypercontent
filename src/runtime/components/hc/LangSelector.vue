<template>
  <ElRadioGroup v-model="model">
    <ElRadioButton v-for="lang in langCodes" :key="lang" :label="lang" />
  </ElRadioGroup>
</template>

<script setup lang="ts">
import { LangCode } from '~~'

interface Props {
  modelValue?: LangCode
}
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { langCodes } = useSettings()

const model = ref(props.modelValue)
watch(model, value => emit('update:modelValue', value))
</script>

<style scoped></style>
