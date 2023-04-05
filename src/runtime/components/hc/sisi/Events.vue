<template>
  <HcEntityView
    v-model="activeLang"
    :entities="t('hc_sisi_events')"
    allow-create
    allow-import
    :total-results="events.count"
    @search="onSearch"
    @current-page-changed="onCurrentPageChanged"
    @page-size-changed="onPageSizeChanged"
    @import="openImportDialog"
    @create="openCreateForm"
  >
    <template #extra-start>
      <ElSwitch
        v-model="upcomingEvents"
        active-text="Upcoming"
        inactive-text="Terminated"
      />
    </template>
    <template #exports>
      <ElDropdownItem :icon="ElIconDownload"> All </ElDropdownItem>
    </template>
    <template #table="{ maxHeight }">
      <ElTable
        v-loading="loading"
        :data="events?.list"
        :max-height="maxHeight"
        stripe
        style="width: 100%"
      >
        <ElTableColumn label="ID" sortable>
          <template #default="scope">
            <ElTag type="info" size="small" effect="plain">
              {{ scope.row.id }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_events_location')" sortable>
          <template #default="scope">
            <ElTag size="small" effect="plain">
              {{ scope.row.city }}
            </ElTag>
            <div>{{ scope.row.location }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_events_start')" sortable>
          <template #default="scope">
            {{ dayjs(scope.row.start_date).format('DD.MM.YYYY, HH:mm') }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_events_label')" sortable>
          <template #default="scope">
            {{ scope.row.title[activeLang] }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_subscriptions_opening')"
          sortable
        >
          <template #default="scope">
            {{
              dayjs(scope.row.subscription_publish_date).format(
                'DD.MM.YYYY, HH:mm',
              )
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_subscriptions_count')"
          align="center"
          sortable
        >
          <template #default="scope">
            <ElTag size="small" effect="plain" hit round>
              {{ scope.row.count_subscriptions }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_subscriptions_max')"
          align="center"
          sortable
        >
          <template #default="scope">
            <ElTag size="small" round>
              {{ scope.row.max_subscriptions }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Type(s)" sortable>
          <template #default="scope">
            <ElTag v-for="type in scope.row.types" :key="type.xid" size="small">
              {{ type.label[activeLang] || `[${type.xid}]` }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" align="center" width="120">
          <template #default="scope">
            <ElButton
              size="small"
              :icon="ElIconEditPen"
              @click="onEdit(scope.row)"
            />
            <ElButton
              size="small"
              type="danger"
              :icon="ElIconDelete"
              @click="onDelete(scope.row)"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </template>
  </HcEntityView>
  <HcSisiDialogEvent
    v-model="formDialog"
    :item="editedItem"
    @saved="loadEvents(true)"
  />
  <HcSisiDialogEventsImport v-model="importDialogVisible" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface Event {
  id: number
  location: string
  start_date: string
  end_date: string
  subscription_publish_date: string
  count_subscriptions: number
  max_subscriptions: number
  status: string
}

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { currentLangCode } = useSettings()
const { $label: t } = getI36n()

const loading = ref(false)
const upcomingEvents = ref(true)
const events = ref<{ list?: Event[]; count?: number }>({})
const getEndpoint = reactive({
  limit: 50,
  start: 0,
  search: '',
})
const formDialog = ref(false)
const editedItem = ref()
const activeLang = ref(currentLangCode.value)

const importDialogVisible = ref(false)

const loadEvents = async (force = false) => {
  loading.value = true
  if (force) {
    $http.client?.clearCache('events')
  }
  const result = await $http.client?.get('events', getEndpoint)
  events.value = result || {}
  loading.value = false
}

const onEdit = (row: Event) => {
  editedItem.value = row
  formDialog.value = true
}
const onDelete = async (row: Event) => {
  try {
    await ElMessageBox.confirm(
      t.value('hc_sisi_event_delete_prompt_text'),
      t.value('hc_sisi_event_delete_prompt_title'),
      {
        confirmButtonText: t.value('common_confirm'),
        cancelButtonText: t.value('common_cancel'),
        type: 'warning',
      },
    )

    await $http.client?.delete(row, 'self')
    ElMessage.success(t.value('hc_sisi_event_delete_success'))
    return loadEvents(true)
  } catch (e) {}
}

const openImportDialog = () => {
  importDialogVisible.value = true
}

const onCurrentPageChanged = (pageIndex: number) => {
  getEndpoint.start = (pageIndex - 1) * getEndpoint.limit
  loadEvents()
}

const onPageSizeChanged = (size: number) => {
  getEndpoint.limit = size
  loadEvents()
}

const openCreateForm = () => {
  editedItem.value = undefined
  formDialog.value = true
}

const onSearch = (query: string) => {
  getEndpoint.search = query
  loadEvents()
}

onMounted(loadEvents)
</script>
