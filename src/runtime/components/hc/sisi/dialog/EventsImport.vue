<template>
  <ElDialog
    v-model="open"
    :title="t('hc_sisi_events_import_title')"
    width="80%"
    align-center
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div v-if="importMode === 'upload'">
      <p style="display: flex; align-items: center">
        <ElIcon style="margin-right: 0.25rem" :size="20"
          ><ElIconWarning
        /></ElIcon>
        {{ t('hc_sisi_events_import_upload_intro') }}
      </p>
      <ElUpload
        class="upload-demo"
        :show-file-list="false"
        drag
        accept=".csv"
        :http-request="doUpload"
      >
        <ElIcon :class="['el-icon--upload', { 'is-loading': uploading }]">
          <ElIconUploadFilled v-if="!uploading" />
          <ElIconLoading v-else />
        </ElIcon>
        <div
          v-if="!uploading"
          class="el-upload__text"
          v-html="t('hc_sisi_events_import_upload_drop_text')"
        ></div>
        <template #tip>
          <div class="el-upload__tip">
            {{ t('hc_sisi_events_import_upload_tip') }}
          </div>
        </template>
      </ElUpload>
    </div>
    <div v-if="importMode === 'preview'">
      <div class="flex">
        <p class="flex-1 flex flex-col">
          <span>
            {{
              t('hc_sisi_events_import_preview_ready_text', {
                enabled: activeEvents.length,
                total: importableEvents.length,
              })
            }}
          </span>
          <span class="error">
            {{
              t('hc_sisi_events_import_preview_errored_text', {
                amount: erroredEvents.length,
              })
            }}
          </span>
        </p>
        <HcLangSelector v-model="activeLang" />
      </div>
      <ElTable
        :data="events"
        stripe
        max-height="350"
        :row-class-name="rowClass"
      >
        <ElTableColumn :label="t('hc_sisi_events_import_preview_header_place')">
          <template #default="scope">
            <template
              v-if="
                (!scope.row.importable && scope.row.location.error) ||
                !scope.row.location
              "
            >
              <span v-if="scope.row.location.error" class="error">
                <ElTooltip :content="scope.row.location.code">
                  [{{ scope.row.location.value }}]
                </ElTooltip>
              </span>
              <span v-else class="error italic"
                >[{{ t('common_notfound') }}]</span
              >
            </template>
            <template v-else>
              <div :class="{ italic: !scope.row.location.city[activeLang] }">
                <h4 class="font-semibold">
                  {{
                    scope.row.location.city[activeLang] ??
                    `[${t('common_untranslated')}]`
                  }}
                </h4>
                {{
                  scope.row.location.label[activeLang] ??
                  `[${t('common_untranslated')}]`
                }}
              </div>
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="t('hc_sisi_events_import_preview_header_tag')">
          <template #default="scope">
            <template v-for="act in scope.row.activity">
              <ElTag
                v-if="act.error"
                :key="act.id"
                type="danger"
                class="mr-1 mb-1 cursor-pointer"
                @click="createEventType(act.value)"
              >
                <ElTooltip :content="act.code"> [{{ act.value }}] </ElTooltip>
              </ElTag>
              <ElTag v-else :key="act.id" type="warning" class="mr-1 mb-1">{{
                act[activeLang] ?? `[${act.xid}]`
              }}</ElTag>
            </template>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_import_preview_header_start')"
          width="180"
        >
          <template #default="scope">
            <span v-if="!isString(scope.row.start_date)" class="error">
              <ElTooltip :content="scope.row.start_date.code">
                [{{ scope.row.start_date.value }}]
              </ElTooltip>
            </span>
            <span v-else>{{ formatEventDateTime(scope.row.start_date) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_import_preview_header_end')"
          width="180"
        >
          <template #default="scope">
            <span v-if="!isString(scope.row.end_date)" class="error">
              <ElTooltip :content="scope.row.end_date.code">
                [{{ scope.row.end_date.value }}]
              </ElTooltip>
            </span>
            <span v-else>{{ formatEventDateTime(scope.row.end_date) }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_import_preview_header_max_subscriptions')"
          width="80"
        >
          <template #default="scope">
            <span v-if="!isNumber(scope.row.max_subscriptions)" class="error">
              <ElTooltip :content="scope.row.max_subscriptions.code">
                [{{ scope.row.max_subscriptions.value }}]
              </ElTooltip>
            </span>
            <span v-else>{{ scope.row.max_subscriptions }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn
          :label="t('hc_sisi_events_import_preview_header_description')"
          width="380"
        >
          <template v-if="activeLang" #default="scope">
            <div
              :class="{
                italic: !scope.row.title || !scope.row.title[activeLang],
              }"
            >
              <h4 class="font-semibold">
                {{
                  (scope.row.title && scope.row.title[activeLang]) ??
                  `[${t('common_untranslated')}]`
                }}
              </h4>
              {{
                (scope.row.description && scope.row.description[activeLang]) ??
                `[${t('common_untranslated')}]`
              }}
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn width="50">
          <template #default="scope">
            <ElSwitch
              v-if="scope.row.importable"
              v-model="scope.row.import"
              class="mt-2"
              inline-prompt
              :active-icon="ElIconCheck"
              :inactive-icon="ElIconClose"
            />
            <ElIcon v-else size="20" color="var(--el-color-error)">
              <ElIconCircleClose />
            </ElIcon>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <div v-if="importMode === 'done'">
      <div class="flex justify-center mb-8">
        <ElIcon size="100" color="var(--el-color-success)">
          <ElIconSelect />
        </ElIcon>
      </div>
      <ElRow :gutter="16">
        <ElCol :span="6">
          <ElCard>
            <ElStatistic
              :title="t('hc_sisi_events_import_results_handled_lines')"
              :value="uploadedLines"
            />
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard>
            <ElStatistic
              :title="t('hc_sisi_events_import_results_generated_events')"
              :value="importResult.nbEvents"
            />
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard>
            <ElStatistic
              :title="t('hc_sisi_events_import_results_created_events')"
              :value="importResult.inserted.length"
            />
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard>
            <ElStatistic
              :title="t('hc_sisi_events_import_results_ignored_duplicates')"
              :value="importResult.duplicates.length"
            />
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
    <template #footer>
      <div class="flex text-left">
        <div class="flex-1">
          <ElButton
            v-if="importMode !== ImportMode.UPLOAD"
            @click="importMode = ImportMode.UPLOAD"
            >{{ t('hc_sisi_events_import_button_new') }}</ElButton
          >
          <ElButton @click="$emit('update:modelValue', false)">{{
            t('common_close')
          }}</ElButton>
        </div>
        <ElButton v-if="importMode === ImportMode.PREVIEW" @click="submit">{{
          t('hc_sisi_events_import_button_import')
        }}</ElButton>
      </div>
    </template>
    <HcSisiDialogEventType
      v-model="showEventTypeFormDialog"
      :prefill="eventTypeFormPrefill"
      @saved="onNewEventTypeCreated"
    />
  </ElDialog>
</template>

<script lang="ts"></script>
<script setup lang="ts">
import type { UploadRequestOptions } from 'element-plus'

import { EventsImportResponse, EventType, I18nField } from '~~'

export type ModelValue = boolean

interface Event {
  activity: EventType[]
  start_date: Date
  end_date: Date
  max_subscriptions: number
  location: string
  title?: I18nField
  description?: I18nField
  import: boolean
  importable: boolean
}

enum ImportMode {
  UPLOAD = 'upload',
  PREVIEW = 'preview',
  DONE = 'done',
}

interface Props {
  modelValue?: ModelValue
}

defineEmits(['update:modelValue'])

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const { $http } = useNuxtApp()
const { getI36n } = useI36n()
const { $label: t } = getI36n()
const { currentLangCode } = useSettings()

const importMode = ref<ImportMode>(ImportMode.UPLOAD)
const events = ref<Event[]>([])
const lastUploadOptions = ref()
const open = ref(props.modelValue)
const uploading = ref(false)
const activeLang = ref(currentLangCode.value)
const importResult = ref<EventsImportResponse>({} as EventsImportResponse)
const uploadedLines = ref()
const showEventTypeFormDialog = ref(false)
const eventTypeFormPrefill = ref<EventType>({
  xid: '',
  label: {},
} as EventType)

const activeEvents = computed(() => events.value.filter(ev => ev.import))
const importableEvents = computed(() =>
  events.value.filter(ev => ev.importable),
)
const erroredEvents = computed(() => events.value.filter(ev => !ev.importable))

const createEventType = (xid: string) => {
  eventTypeFormPrefill.value.xid = xid
  eventTypeFormPrefill.value.label = {} as I18nField
  showEventTypeFormDialog.value = true
}

const onNewEventTypeCreated = () => {
  return doUpload(lastUploadOptions.value)
}

const doUpload = async (options: UploadRequestOptions) => {
  lastUploadOptions.value = options
  try {
    uploading.value = true
    const formData = new FormData()
    formData.append('file', options.file)
    const result = await $http.client?.post('', 'events-import', formData, {
      transformRequest: () => formData,
    })
    events.value = result.events
    uploadedLines.value = result.nbLines
    importMode.value = ImportMode.PREVIEW
  } catch (e: Error) {
    ElMessage.error(e.data.message)
  } finally {
    uploading.value = false
  }
}

const submit = async () => {
  const payload = activeEvents.value.map(ev => ({
    ...ev,
    type_ids: (ev.activity || [])
      .filter(act => Boolean(act.id))
      .map(act => act.id),
  }))
  try {
    uploading.value = true
    importResult.value = await $http.client?.post('', 'events', payload)
    importMode.value = ImportMode.DONE
  } catch (e: Error) {
    console.log(e)
    ElMessage.error(e.data.message)
  } finally {
    uploading.value = false
  }
}

const rowClass = ({ row }: { row: Event }) => {
  return { disabled: !row.import, error: !row.importable }
}

const formatEventDateTime = (value: string) => dateTimeFormat(value)

watch(importMode, value => {
  if (value === ImportMode.UPLOAD) {
    events.value = []
  }
})

watch(
  () => props.modelValue,
  value => (open.value = value),
)
</script>

<style lang="postcss">
.el-table__row {
  &.disabled {
    .cell {
      color: rgb(var(--color-neutral-lightest));
      transition: color ease 0.5s;
    }
    .el-tag {
      background-color: rgb(var(--color-neutral-lightest));
      border-color: rgb(var(--color-neutral-lightest));
      transition: border, background-color ease 0.5s;
    }
  }
}
.el-table--striped .el-table__body .el-table__row,
.el-table--striped .el-table__body .el-table__row--striped {
  &.error {
    .el-table__cell {
      background-color: var(--color-error-bg);
    }
  }
}

.error {
  color: var(--el-color-error);
}
</style>
