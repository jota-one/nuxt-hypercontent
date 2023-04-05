<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_city_modal_title')"
    width="40%"
    align-center
    :close-on-click-modal="false"
    @close="$emit('update:modelValue', false)"
  >
    <ElForm
      :model="form"
      label-position="right"
      label-width="200px"
      style="max-width: 460px"
    >
      <ElFormItem :label="t('hc_sisi_city_label')">
        <El-Input v-model="form.label" />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_city_xid')">
        <El-Input v-model="form.xid" />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_city_coords')">
        <El-Input v-model="form.coords" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="save">{{ t('common_save') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
import { HateoasResource } from '~~'

export type ModelValue = boolean

interface Props {
  modelValue?: ModelValue
  item?: HateoasResource
}

const emit = defineEmits(['update:modelValue', 'saved'])

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})
const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { $label: t } = getI36n()

const form = ref({
  label: '',
  xid: '',
  coords: '',
})
const open = ref(props.modelValue)

const load = async (row: HateoasResource) => {
  const { label, xid, coords } = await $http.client?.follow(
    row,
    'self',
    {},
    {},
    ['cities'],
    [row.id.toString()],
  )
  form.value = { label, xid, coords }
}

const reset = () => {
  form.value = {
    label: '',
    xid: '',
    coords: '',
  }
}

const save = async () => {
  if (props.item?.id) {
    await $http.client?.put(props.item, 'self', form.value)
    ElMessage.success(t.value('hc_sisi_cities_update_success'))
  } else {
    await $http.client?.post('', 'cities', form.value)
    ElMessage.success(t.value('hc_sisi_cities_create_success'))
  }
  emit('saved')
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  value => {
    open.value = value
    if (value && props.item) {
      load(props.item)
    } else {
      reset()
    }
  },
)
</script>
