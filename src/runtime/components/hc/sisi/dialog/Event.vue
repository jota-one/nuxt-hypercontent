<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_event_form_title')"
    width="40%"
    align-center
    :close-on-click-modal="false"
    @close="$emit('update:modelValue', false)"
  >
    <ElForm :model="form" label-position="right" label-width="200px">
      <FormI18nInput
        v-model="form.title"
        :label="t('hc_sisi_event_form_label')"
      />
      <FormI18nInput
        v-model="form.description"
        :label="t('hc_sisi_event_form_description')"
        long
      />
      <ElFormItem :label="t('hc_sisi_event_form_when')">
        <ElDatePicker
          v-model="form.dates"
          type="datetimerange"
          range-separator="à"
          format="DD.MM.YYYY HH:mm"
          value-format="YYYY-MM-DD HH:mm"
          :start-placeholder="t('hc_sisi_event_form_start')"
          :end-placeholder="t('hc_sisi_event_form_end')"
        />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_event_form_publish_date')">
        <ElDatePicker
          v-model="form.subscription_publish_date"
          type="datetime"
          format="DD.MM.YYYY HH:mm"
          value-format="YYYY-MM-DD HH:mm"
        />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_event_form_max_subscriptions')">
        <El-Input v-model="form.max_subscriptions" type="number" />
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_event_form_location')">
        <ElSelect
          v-model="form.location_id"
          filterable
          remote
          :placeholder="t('hc_sisi_event_form_location_placeholder')"
          :remote-method="locationSearch"
          :loading="loadingLocations"
          popper-class="droplist-item"
          class="w-full"
        >
          <ElOption
            v-for="item in filteredLocations"
            :key="item.id"
            :label="`${item.city} - ${item.location}`"
            :value="item.id"
          >
            <div class="value">
              {{ item.city }}
            </div>
            <span class="location">{{ item.location }}</span>
          </ElOption>
        </ElSelect>
      </ElFormItem>
      <ElFormItem :label="t('hc_sisi_event_form_types')">
        <ElSelect
          v-model="form.type_ids"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          :placeholder="t('hc_sisi_event_form_types_placeholder')"
          class="w-full"
        >
          <ElOption
            v-for="item in eventTypes"
            :key="item.id"
            :label="`${item.xid} (${item.label[currentLangCode]})`"
            :value="item.id"
          />
        </ElSelect>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="save">{{ t('common_save') }}</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts"></script>
<script lang="ts" setup>
import { EventType, HateoasResource, I18nField } from '~~'

export type ModelValue = boolean

type EventForm = {
  title: I18nField
  description: I18nField
  dates: string[]
  subscription_publish_date: string
  max_subscriptions: number
  location_id: number | null
  type_ids: number[]
}

interface LocationAutocompleteItem {
  id: number
  city: string
  location: string
}

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
const { currentLangCode } = useSettings()

const form = ref<EventForm>({
  title: {} as I18nField,
  description: {} as I18nField,
  dates: [],
  subscription_publish_date: '',
  max_subscriptions: 0,
  location_id: null,
  type_ids: [],
})
const open = ref(props.modelValue)
const filteredLocations = ref<LocationAutocompleteItem[]>([])
const loadingLocations = ref(false)
const eventTypes = ref([])

const load = async (row: HateoasResource) => {
  const {
    title,
    description,
    start_date,
    end_date,
    subscription_publish_date,
    max_subscriptions,
    location_id,
    types,
  } = await $http.client?.follow(
    row,
    'self',
    {},
    {},
    ['events'],
    [row.id.toString()],
  )

  // get selected location detail to display the dropdown properly
  const location = await $http.client?.get('location', { id: location_id })
  filteredLocations.value = [
    {
      id: location_id,
      city: location.city,
      location: location.label[currentLangCode.value],
    },
  ]

  form.value = {
    title,
    description,
    dates: [start_date, end_date],
    subscription_publish_date,
    max_subscriptions,
    location_id,
    type_ids: types.map((type: EventType) => type.id),
  }
}

const reset = () => {
  form.value = {
    title: {} as I18nField,
    description: {} as I18nField,
    dates: [],
    subscription_publish_date: '',
    max_subscriptions: 0,
    location_id: null,
    type_ids: [],
  }
}

const locationSearch = async (search: string) => {
  if (search.length < 2) {
    return
  }
  loadingLocations.value = true
  const result = await $http.client?.get('locations-autocomplete', {
    search,
    langCode: currentLangCode.value,
  })
  loadingLocations.value = false
  filteredLocations.value = result
}

const save = async () => {
  const payload = {
    ...omit(['dates'], form.value),
    start_date: form.value.dates[0],
    end_date: form.value.dates[1],
  }
  if (props.item?.id) {
    await $http.client?.put(props.item, 'self', payload)
    ElMessage.success(t.value('hc_sisi_event_update_success'))
  } else {
    await $http.client?.post('', 'events', payload)
    ElMessage.success(t.value('hc_sisi_event_create_success'))
  }
  emit('saved')
  emit('update:modelValue', false)
}

onMounted(async () => {
  const { list } = await $http.client?.get('event-types', { enabled: true })
  eventTypes.value = list
})

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
<style lang="postcss">
.droplist-item .el-select-dropdown__item {
  line-height: normal;
  padding: 7px;
  height: auto;
  .city {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .location {
    font-size: 12px;
    color: #b4b4b4;
  }
  .highlighted .location {
    color: #ddd;
  }
}
</style>
