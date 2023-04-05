<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_location_form_title')"
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
      <ElFormItem :label="t('hc_sisi_location_form_city')">
        <ElSelect
          v-model="form.city_id"
          :placeholder="t('hc_sisi_location_form_city_placeholder')"
          class="w-full"
        >
          <ElOption
            v-for="item in citiesOptions"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
      <FormI18nInput
        v-model="form.label"
        :label="t('hc_sisi_location_form_label')"
      />
      <ElFormItem :label="t('hc_sisi_location_form_xid')">
        <El-Input v-model="form.xid" />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_location_form_coords')">
        <El-Input v-model="form.coords" />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_location_form_address')">
        <El-Input v-model="form.address" type="textarea" />
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
const { loadCities, cities } = useCities()

const form = ref({
  label: {},
  xid: '',
  coords: '',
  address: '',
  city_id: null,
})
const open = ref(props.modelValue)

const citiesOptions = computed(() =>
  Object.values(cities.value)
    .sort((a, b) => (a.label > b.label ? 1 : -1))
    .map(city => ({ id: city.id, label: city.label })),
)

const load = async (row: HateoasResource) => {
  const { label, xid, coords, address, city_id } = await $http.client?.follow(
    row,
    'self',
    {},
    {},
    ['locations'],
    [row.id.toString()],
  )
  form.value = { label, xid, coords, address, city_id }
}

const reset = () => {
  form.value = {
    label: {},
    xid: '',
    coords: '',
    address: '',
    city_id: null,
  }
}

const save = async () => {
  if (props.item?.id) {
    await $http.client?.put(props.item, 'self', form.value)
    ElMessage.success(t.value('hc_sisi_location_update_success'))
  } else {
    await $http.client?.post('', 'locations', form.value)
    ElMessage.success(t.value('hc_sisi_location_create_success'))
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

watch(
  () => form.value.city_id,
  (cityId, oldCityId) => {
    if (
      cityId &&
      (form.value.xid === '' ||
        (oldCityId && form.value.xid === `${cities.value[oldCityId].slug}-`))
    ) {
      form.value.xid = `${cities.value[cityId].slug}-`
    }
  },
)

onMounted(loadCities)
</script>
