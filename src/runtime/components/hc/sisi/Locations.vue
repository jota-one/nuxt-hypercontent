<template>
  <HcEntityView
    v-model="activeLang"
    :entities="t('hc_sisi_locations')"
    allow-create
    :total-results="locations.count"
    @search="onSearch"
    @current-page-changed="onCurrentPageChanged"
    @page-size-changed="onPageSizeChanged"
    @create="openCreateForm"
  >
    <template #extra-start>
      <ElSwitch
        v-model="enabledLocations"
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
        :data="locations?.list"
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
        <ElTableColumn :label="t('hc_sisi_locations_city')" sortable>
          <template #default="scope">
            {{ scope.row.city }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_locations_label')" sortable>
          <template #default="scope">
            {{ scope.row.label[activeLang] }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_locations_coords')" sortable>
          <template #default="scope">
            <a
              :href="`https://www.google.com/maps/place/${scope.row.coords}`"
              target="_blank"
              >{{ scope.row.coords }}</a
            >
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_locations_xid')" sortable>
          <template #default="scope">
            {{ scope.row.xid }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_locations_events')"
          align="center"
          sortable
        >
          <template #default="scope">
            <ElTag size="small" effect="plain" hit round>
              {{ scope.row.count_events }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_locations_last_event')" sortable>
          <template #default="scope">
            {{
              scope.row.last_event
                ? dayjs(scope.row.last_event).format('DD.MM.YYYY, HH:mm')
                : t('hc_sisi_locations_last_event_none')
            }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" align="center" width="240">
          <template #default="scope">
            <ElTooltip :content="t('hc_common_merge')">
              <ElButton
                class="mr-2"
                size="small"
                :icon="ElIconFiles"
                @click="onMerge(scope.row)"
              />
            </ElTooltip>
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
              @change="toggleLocation(scope.row)"
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
  <HcSisiDialogLocation
    v-model="formDialog"
    :item="editedItem"
    @saved="loadLocations(true)"
  />
  <HcSisiDialogMergeLocations
    v-model="formMergeDialog"
    :item="editedItem"
    @merged="loadLocations(true)"
  />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface Coords {
  lat: number
  lng: number
}

interface Location {
  id: number
  name: string
  coords: Coords
  enabled: boolean
}

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { currentLangCode } = useSettings()
const { $label: t } = getI36n()

const loading = ref(false)
const locations = ref<{ list?: Location[]; count?: number }>({})
const enabledLocations = ref(true)
const getEndpoint = reactive({
  limit: 50,
  start: 0,
  search: '',
})
const formDialog = ref(false)
const formMergeDialog = ref(false)
const editedItem = ref()
const activeLang = ref(currentLangCode.value)

const loadLocations = async (force = false) => {
  loading.value = true
  if (force) {
    $http.client?.clearCache('locations')
  }
  const result = await $http.client?.get('locations', {
    ...getEndpoint,
    enabled: enabledLocations.value,
  })
  result.list = (result.list || []).map((c: Location) => ({
    ...c,
    enabled: Boolean(c.enabled),
  }))
  locations.value = result || {}
  loading.value = false
}

const onMerge = (row: Location) => {
  editedItem.value = row
  formMergeDialog.value = true
}

const onEdit = (row: Location) => {
  editedItem.value = row
  formDialog.value = true
}
const onDelete = async (row: Location) => {
  try {
    await ElMessageBox.confirm(
      t.value('hc_sisi_location_delete_prompt_text'),
      t.value('hc_sisi_location_delete_prompt_title'),
      {
        confirmButtonText: t.value('common_confirm'),
        cancelButtonText: t.value('common_cancel'),
        type: 'warning',
      },
    )

    await $http.client?.delete(row, 'self')
    ElMessage.success(t.value('hc_sisi_location_delete_success'))
    return loadLocations(true)
  } catch (e) {}
}

const onCurrentPageChanged = (pageIndex: number) => {
  getEndpoint.start = (pageIndex - 1) * getEndpoint.limit
  loadLocations()
}

const onPageSizeChanged = (size: number) => {
  getEndpoint.limit = size
  loadLocations()
}

const onSearch = (query: string) => {
  getEndpoint.search = query
  loadLocations()
}

const openCreateForm = () => {
  editedItem.value = undefined
  formDialog.value = true
}

const toggleLocation = (updatedRow: Location) => {
  return $http.client?.put(updatedRow, 'self', { enabled: updatedRow.enabled })
}

watch(enabledLocations, loadLocations)

onMounted(loadLocations)
</script>
