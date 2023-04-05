<template>
  <HcEntityView
    entities="Users"
    :total-results="users.count"
    @search="onSearch"
    @current-page-changed="onCurrentPageChanged"
    @page-size-changed="onPageSizeChanged"
  >
    <template #exports>
      <ElDropdownItem :icon="ElIconDownload"> All </ElDropdownItem>
      <ElDropdownItem :icon="ElIconDownload">
        Grouped by event location
      </ElDropdownItem>
    </template>
    <template #table="{ maxHeight }">
      <ElTable
        v-loading="loading"
        :data="users?.list"
        :max-height="maxHeight"
        stripe
        style="width: 100%"
        @expand-change="onToggleExpand"
      >
        <ElTableColumn type="expand">
          <template #default="props">
            <HcUsersDetail
              v-if="usersDetail[props.row.id]"
              :user-data="{
                first_name: props.row.first_name,
                last_name: props.row.last_name,
                ...usersDetail[props.row.id],
              }"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="ID" sortable>
          <template #default="scope">
            <ElTag type="info" size="small" effect="plain">
              {{ scope.row.id }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="Role" sortable>
          <template #default="scope">
            <ElTag size="small" effect="dark" round>
              {{ scope.row.role || 'user' }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="first_name" label="First name" sortable />
        <ElTableColumn prop="last_name" label="Last name" sortable />
        <ElTableColumn prop="email" label="E-mail" sortable>
          <template #default="scope">
            <ElLink :href="scope.row.email" type="primary">
              {{ scope.row.email }}
            </ElLink>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" align="center" width="100">
          <template #default="scope">
            <ElButton
              size="small"
              :icon="ElIconEditPen"
              @click="onEdit(scope.$index, scope.row)"
            />
            <ElButton
              size="small"
              type="danger"
              :icon="ElIconDelete"
              @click="onDelete(scope.$index, scope.row)"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </template>
  </HcEntityView>
</template>

<script setup lang="ts">
interface User {
  id: number
  role: string
  firstName: string
  lastName: string
  email: string
}

const { $http } = useNuxtApp()
const loading = ref(false)
const users = ref<{ list?: User[]; count?: number }>({})
const usersDetail = ref<{ [id: number]: any }>({})
const getEndpoint = reactive({
  limit: 50,
  start: 0,
  search: '',
})

const loadUsers = async () => {
  loading.value = true
  const result = await $http.client?.get('users', getEndpoint)
  users.value = result || {}
  loading.value = false
}

const loadUserDetail = async (user: User) => {
  if (!user.id || usersDetail.value[user.id]) {
    return
  }

  loading.value = true
  const result = await $http.client?.follow(
    user,
    'self',
    {},
    {},
    ['users'],
    [user.id.toString()],
  )
  usersDetail.value[user.id] = result || {}
  loading.value = false
}

const onToggleExpand = (user: User, expandedRows: User[]) => {
  if (expandedRows.length) {
    loadUserDetail(user)
  }
}

const onEdit = (index: number, row: User) => {}
const onDelete = (index: number, row: User) => {}

const onCurrentPageChanged = (pageIndex: number) => {
  getEndpoint.start = (pageIndex - 1) * getEndpoint.limit
  loadUsers()
}

const onPageSizeChanged = (size: number) => {
  getEndpoint.limit = size
  loadUsers()
}

const onSearch = (query: string) => {
  getEndpoint.search = query
  loadUsers()
}

onMounted(loadUsers)
</script>
