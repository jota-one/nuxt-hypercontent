<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_location_merge_title')"
    width="40%"
    align-center
    :close-on-click-modal="false"
    @close="$emit('update:modelValue', false)"
  >
    <p>
      {{ t('hc_sisi_location_merge_src_detail', { item: item.xid }) }}
    </p>
    <ElForm
      :model="form"
      label-position="right"
      label-width="200px"
      style="max-width: 460px"
    >
      <ElFormItem :label="t('hc_sisi_location_merge_dest')">
        <El-Input v-model="form.dest_id" type="number" />
      </ElFormItem>
    </ElForm>
    <ElAlert v-if="destinationDetail" type="success" :closable="false">
      {{ t('hc_sisi_location_merge_dest_detail', { dest: destinationDetail }) }}
    </ElAlert>
    <ElAlert v-else type="warning" :closable="false">{{
      t('hc_sisi_location_merge_dest_detail_notfound')
    }}</ElAlert>
    <template #footer>
      <ElButton :disabled="!destinationDetail" @click="merge">{{
        t('hc_common_merge')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
import debounce from '~/utils/debounce'
import { HateoasResource } from '~~'

export type ModelValue = boolean

interface Props {
  modelValue?: ModelValue
  item: HateoasResource
}

const emit = defineEmits(['update:modelValue', 'merged'])

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})
const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { $label: t } = getI36n()

const form = ref({
  dest_id: '',
})
const open = ref(props.modelValue)
const destinationDetail = ref()

const reset = () => {
  form.value = {
    dest_id: '',
  }
  destinationDetail.value = undefined
}

const merge = async () => {
  await $http.client?.post(props.item, 'merge', form.value)
  ElMessage.success(t.value('hc_sisi_location_merge_success'))
  emit('merged')
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  value => {
    open.value = value
    reset()
  },
)

const [debouncedDestDetail] = debounce(async value => {
  const detail = await $http.client?.get('location', { id: value[0] })
  if (detail) {
    const label = detail.label.fr ? ` (${detail.label.fr})` : ''
    destinationDetail.value = `${detail.xid}${label}`
  } else {
    destinationDetail.value = null
  }
}, 300)

watch(
  () => form.value.dest_id,
  value => debouncedDestDetail([value]),
)
</script>
