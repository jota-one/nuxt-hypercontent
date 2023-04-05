<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_event_type_form_title')"
    width="40%"
    align-center
    :close-on-click-modal="false"
    @close="$emit('update:modelValue', false)"
  >
    <ElForm
      :model="form"
      label-position="right"
      label-width="100px"
      style="max-width: 460px"
    >
      <ElFormItem :label="t('hc_sisi_event_type_form_xid')" label-width="150px">
        <El-Input v-model="form.xid" />
      </ElFormItem>
      <FormI18nInput
        v-model="form.label"
        :label="t('hc_sisi_event_type_form_label')"
        label-width="150px"
      />
    </ElForm>
    <template #footer>
      <ElButton :disabled="!formIsValid" @click="save">{{
        t('common_save')
      }}</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
import { EventType, HateoasResource, I18nField } from '~~'

export type ModelValue = boolean

interface Props {
  modelValue?: ModelValue
  item?: HateoasResource
  prefill?: EventType
}

const emit = defineEmits(['update:modelValue', 'saved'])

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  item: undefined,
  prefill: () => ({
    label: {} as I18nField,
    xid: '',
  }),
})

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { $label: t } = getI36n()

const form = ref<EventType>(props.prefill)
const open = ref(props.modelValue)

const formIsValid = computed(() => {
  const hasI18nValues = Object.values(form.value.label).find(Boolean)
  return hasI18nValues && Boolean(form.value.xid)
})

const load = async (row: HateoasResource) => {
  const result = await $http.client?.follow(
    row,
    'self',
    {},
    {},
    ['event-types'],
    [row.id.toString()],
  )
  form.value.label = result.label
  form.value.xid = result.xid
}

const reset = (full = false) => {
  if (full) {
    form.value = {
      label: {} as I18nField,
      xid: '',
    }
  } else {
    form.value = props.prefill
  }
}

const save = async () => {
  if (props.item?.id) {
    await $http.client?.put(props.item, 'self', form.value)
  } else {
    await $http.client?.post('', 'event-types', form.value)
  }
  reset(true)
  emit('saved')
  emit('update:modelValue', false) // close the dialog
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
