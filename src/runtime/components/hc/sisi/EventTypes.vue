<template>
  <HcEntityView
    v-model="activeLang"
    :entities="t('hc_sisi_event_types')"
    allow-create
    :total-results="eventTypes.count"
    @search="onSearch"
    @current-page-changed="onCurrentPageChanged"
    @page-size-changed="onPageSizeChanged"
    @create="openCreateForm"
  >
    <template #extra-start>
      <ElSwitch
        v-model="enabledEventTypes"
        :active-text="t('common_enabled')"
        :inactive-text="t('common_disabled')"
        style="
          --el-switch-on-color: var(--el-color-success);
          --el-switch-off-color: var(--el-color-info-light-3);
        "
      />
    </template>
    <template #table="{ maxHeight }">
      <ElTable
        v-loading="loading"
        :data="eventTypes?.list"
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
        <ElTableColumn :label="t('hc_sisi_event_types_xid')" sortable>
          <template #default="scope">
            {{ scope.row.xid }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_event_types_label')" sortable>
          <template #default="scope">
            {{ scope.row.label[activeLang] }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" align="center" width="180">
          <template #default="scope">
            <ElSwitch
              v-model="scope.row.enabled"
              class="mr-2"
              inline-prompt
              :active-icon="ElIconCheck"
              :inactive-icon="ElIconClose"
              style="
                --el-switch-on-color: var(--el-color-success);
                --el-switch-off-color: var(--el-color-info-light-3);
              "
              @change="toggleType(scope.row)"
            />
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
  <HcSisiDialogEventType
    v-model="formDialog"
    :item="editedItem"
    @saved="loadEventTypes(true)"
  />
</template>

<script setup lang="ts">
import { HateoasResource } from '~~'

interface EventType extends HateoasResource {
  id: number
  label: string
  enabled: boolean
}

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { currentLangCode } = useSettings()
const { $label: t } = getI36n()

const loading = ref(false)
const eventTypes = ref<{ list?: EventType[]; count?: number }>({})
const enabledEventTypes = ref(true)
const getEndpoint = reactive({
  limit: 50,
  start: 0,
  search: '',
})
const formDialog = ref(false)
const editedItem = ref()
const activeLang = ref(currentLangCode.value)

const loadEventTypes = async (force = false) => {
  loading.value = true
  if (force) {
    $http.client?.clearCache('event-types')
  }
  const result = await $http.client?.get('event-types', {
    ...getEndpoint,
    enabled: enabledEventTypes.value,
  })
  result.list = result.list.map((p: EventType) => ({
    ...p,
    enabled: Boolean(p.enabled),
  }))
  eventTypes.value = result || {}
  loading.value = false
}

const onEdit = (row: EventType) => {
  editedItem.value = row
  formDialog.value = true
}
const onDelete = async (row: EventType) => {
  try {
    await ElMessageBox.confirm(
      t.value('hc_sisi_event_type_delete_prompt_text'),
      t.value('hc_sisi_event_type_delete_prompt_title'),
      {
        confirmButtonText: t.value('common_confirm'),
        cancelButtonText: t.value('common_cancel'),
        type: 'warning',
      },
    )

    await $http.client?.delete(row, 'self')
    ElMessage.success(t.value('hc_sisi_event_type_delete_success'))
    return loadEventTypes(true)
  } catch (e) {}
}

const onCurrentPageChanged = (pageIndex: number) => {
  getEndpoint.start = (pageIndex - 1) * getEndpoint.limit
  loadEventTypes()
}

const onPageSizeChanged = (size: number) => {
  getEndpoint.limit = size
  loadEventTypes()
}

const onSearch = (query: string) => {
  getEndpoint.search = query
  loadEventTypes()
}

const openCreateForm = () => {
  editedItem.value = undefined
  formDialog.value = true
}

const toggleType = (updatedRow: EventType) => {
  return $http.client?.put(updatedRow, 'self', { enabled: updatedRow.enabled })
}

watch(enabledEventTypes, loadEventTypes)

onMounted(loadEventTypes)
</script>
