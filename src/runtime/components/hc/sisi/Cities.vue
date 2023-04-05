<template>
  <HcEntityView
    entities="Cities"
    allow-create
    allow-export
    :total-results="cities.count"
    @search="onSearch"
    @current-page-changed="onCurrentPageChanged"
    @page-size-changed="onPageSizeChanged"
    @create="openCreateForm"
  >
    <template #extra-start>
      <ElSwitch
        v-model="enabledCities"
        :active-text="t('common_enabled')"
        :inactive-text="t('common_disabled')"
        style="
          --el-switch-on-color: var(--el-color-success);
          --el-switch-off-color: var(--el-color-info-light-3);
        "
      />
    </template>
    <template #exports>
      <ElDropdownItem :icon="ElIconDownload" @click="exportAllSubscribers">
        {{ t('hc_sisi_cities_export_watchers') }}
      </ElDropdownItem>
    </template>
    <template #table="{ maxHeight }">
      <ElTable
        v-loading="loading"
        :data="cities?.list"
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
        <ElTableColumn :label="t('hc_sisi_cities_name')" sortable>
          <template #default="scope">
            {{ scope.row.label }}
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_cities_xid')" sortable>
          <template #default="scope">
            {{ scope.row.xid }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_cities_locations')"
          align="center"
          sortable
        >
          <template #default="scope">
            <ElTag size="small" effect="plain" hit round>
              {{ scope.row.count_locations }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_cities_export_watchers')"
          align="center"
          sortable
        >
          <template #default="scope">
            <ElTag size="small" effect="plain" hit round>
              {{ scope.row.count_watchers }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" align="center" width="300">
          <template #default="scope">
            <ElDropdown class="mr-2 mt-1">
              <ElButton size="small">
                {{ t('hc_common_export') }}
                <ElIcon class="el-icon--right"><ElIconArrowDown /></ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem
                    :icon="ElIconDownload"
                    @click="exportSubscribers(scope.row)"
                  >
                    {{ t('hc_sisi_cities_export_watchers') }}
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
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
              @change="toggleCity(scope.row)"
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
  <HcSisiDialogCity
    v-model="formDialog"
    :item="editedItem"
    @saved="loadCities(true)"
  />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

interface Coords {
  lat: number
  lng: number
}

interface City {
  id: number
  xid?: string
  name: string
  coords: Coords
  enabled: boolean
}

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { $label: t } = getI36n()

const loading = ref(false)
const cities = ref<{ list?: City[]; count?: number }>({})
const enabledCities = ref(true)
const getEndpoint = reactive({
  limit: 50,
  start: 0,
  search: '',
})
const formDialog = ref(false)
const editedItem = ref()

const loadCities = async (force = false) => {
  loading.value = true
  if (force) {
    $http.client?.clearCache('cities')
  }
  const result = await $http.client?.get('cities', {
    ...getEndpoint,
    enabled: enabledCities.value,
  })
  result.list = (result.list || []).map((c: City) => ({
    ...c,
    enabled: Boolean(c.enabled),
  }))
  cities.value = result || {}
  loading.value = false
}

const onEdit = (row: City) => {
  editedItem.value = row
  formDialog.value = true
}
const onDelete = async (row: City) => {
  await ElMessageBox.confirm(
    t.value('hc_sisi_cities_delete_prompt_text'),
    t.value('hc_sisi_cities_delete_prompt_title'),
    {
      confirmButtonText: t.value('common_confirm'),
      cancelButtonText: t.value('common_cancel'),
      type: 'warning',
    },
  )

  await $http.client?.delete(row, 'self')
  ElMessage.success(t.value('hc_sisi_cities_delete_success'))
  return loadCities(true)
}

const exportSubscribers = (row: City) => {
  return $http.client?.download(
    row,
    'watchers',
    undefined,
    undefined,
    `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}-${row.xid}-watchers.csv`,
  )
}

const exportAllSubscribers = () => {
  return $http.client?.download(
    '',
    'cities-watchers',
    undefined,
    undefined,
    `${dayjs().format('YYYY-MM-DD_HH-mm-ss')}-city-watchers.csv`,
  )
}

const onCurrentPageChanged = (pageIndex: number) => {
  getEndpoint.start = (pageIndex - 1) * getEndpoint.limit
  loadCities()
}

const onPageSizeChanged = (size: number) => {
  getEndpoint.limit = size
  loadCities()
}

const onSearch = (query: string) => {
  getEndpoint.search = query
  loadCities()
}

const openCreateForm = () => {
  editedItem.value = undefined
  formDialog.value = true
}

const toggleCity = (updatedRow: City) => {
  return $http.client?.put(updatedRow, 'self', { enabled: updatedRow.enabled })
}

watch(enabledCities, loadCities)

onMounted(loadCities)
</script>
