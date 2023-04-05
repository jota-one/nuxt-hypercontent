<template>
  <div class="hc-entity-view">
    <div class="header">
      <h3>{{ entities }}</h3>
      <slot name="extra-start" />
      <div style="flex: 1" />
      <HcLangSelector v-if="showLangSelector" v-model="model" />
      <slot name="extra-end" />
      <ElButton
        v-if="allowCreate"
        type="primary"
        size="small"
        :icon="ElIconPlus"
        @click="emit('create')"
      >
        {{ t('hc_common_create') }}
      </ElButton>
      <ElButton
        v-if="allowImport"
        type="primary"
        size="small"
        :icon="ElIconUpload"
        @click="emit('import')"
      >
        {{ t('hc_common_import') }}
      </ElButton>
      <ElDropdown v-if="allowExport">
        <ElButton size="small">
          {{ t('hc_common_export') }}
          <ElIcon class="el-icon--right"><ElIconArrowDown /></ElIcon>
        </ElButton>
        <template #dropdown>
          <ElDropdownMenu>
            <slot name="exports" />
          </ElDropdownMenu>
        </template>
      </ElDropdown>
    </div>
    <ElInput
      v-model="search"
      clearable
      :placeholder="t('hc_search_entities', { entities })"
      :prefix-icon="ElIconSearch"
    />
    <div class="table">
      <slot name="table" :max-height="tableHeight" />
    </div>
    <div class="pagination">
      <ElPagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 50, 100]"
        :total="totalResults"
        @size-change="emit('page-size-changed', $event)"
        @current-change="emit('current-page-changed', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from '~/utils/debounce'
import { LangCode } from '~~'

interface Props {
  allowCreate?: boolean
  allowImport?: boolean
  allowExport?: boolean
  modelValue?: LangCode
  entities?: string
  totalResults?: number
}

const { getI36n } = useI36n()
const { $label: t } = getI36n()

const emit = defineEmits([
  'create',
  'current-page-changed',
  'page-size-changed',
  'search',
  'import',
  'update:modelValue',
])

const props = withDefaults(defineProps<Props>(), {
  entities: 'Entities',
  totalResults: 0,
})

const tableHeight = ref('calc(100vh - 385px)')
const search = ref('')
const currentPage = ref(1)
const pageSize = ref(50)
const model = ref(props.modelValue)

const showLangSelector = computed(() => Boolean(model.value))

const [debouncedSearch] = debounce(value => {
  emit('search', value.join(''))
}, 300)

watch(
  () => search.value,
  value => debouncedSearch([value]),
)
watch(model, value => emit('update:modelValue', value))
</script>

<style lang="postcss" scoped>
.hc-entity-view {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0 1rem;
  overflow: auto;

  h3 {
    margin-right: 2rem;
  }
}

.table {
  height: v-bind(tableHeight);
}

.pagination {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 0;
  overflow: auto;
}
</style>
