<template>
  <div class="user-detail">
    <ElDescriptions
      border
      :title="`${userData.firstname} ${userData.lastname}`"
    >
      <ElDescriptionsItem label="Address">
        {{ userData.street }},
        {{ userData.npa }}
        {{ userData.city }},
        {{ userData.country }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="Phone">
        {{ userData.phone }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.emergency" label="Emergency phone">
        {{ userData.emergency }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.birthdate" label="Birthdate">
        {{ dayjs(userData.birthdate).format('DD.MM.YYYY') }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Gender">
        <ElTag>{{ userData.gender }}</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.size" label="Size">
        {{ userData.size }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.size" label="Weight">
        {{ userData.weight }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Heart condition">
        <ElIcon :class="['health', { checked: userData.health_cardiaque }]">
          <ElIconSelect v-if="userData.health_cardiaque" />
          <ElIconCloseBold v-else />
        </ElIcon>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Chest pain">
        <ElIcon :class="['health', { checked: userData.health_poitrine }]">
          <ElIconSelect v-if="userData.health_poitrine" />
          <ElIconCloseBold v-else />
        </ElIcon>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Past chest pain">
        <ElIcon :class="['health', { checked: userData.health_poitrine2 }]">
          <ElIconSelect v-if="userData.health_poitrine2" />
          <ElIconCloseBold v-else />
        </ElIcon>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Balance">
        <ElIcon :class="['health', { checked: userData.health_equilibre }]">
          <ElIconSelect v-if="userData.health_equilibre" />
          <ElIconCloseBold v-else />
        </ElIcon>
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Bone/joint problems">
        <ElIcon :class="['health', { checked: userData.health_articulaire }]">
          <ElIconSelect v-if="userData.health_articulaire" />
          <ElIconCloseBold v-else />
        </ElIcon>
        {{ userData.health_articulaire_detail }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Blood/heart medication">
        <ElIcon :class="['health', { checked: userData.health_drugs }]">
          <ElIconSelect v-if="userData.health_drugs" />
          <ElIconCloseBold v-else />
        </ElIcon>
        <br />
        {{ userData.health_drugs_detail }}
      </ElDescriptionsItem>
      <ElDescriptionsItem
        v-if="userData.gender"
        label="Other counter-indication"
      >
        <ElIcon :class="['health', { checked: userData.health_other }]">
          <ElIconSelect v-if="userData.health_other" />
          <ElIconCloseBold v-else />
        </ElIcon>
        {{ userData.health_other_detail }}
      </ElDescriptionsItem>
      <ElDescriptionsItem v-if="userData.gender" label="Sporting goals">
        {{ userData.health_objective }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { PropType } from 'vue'

interface UserDetail {
  firstname?: string
  lastname?: string
  street?: string
  npa?: number
  city?: string
  country?: string
  phone?: string
  emergency?: string
  gender?: string
  size?: number
  weight?: number
  birthdate?: string
  accept_risks?: boolean
  accept_promo?: boolean
  accept_pub?: boolean
  accept_newsletter?: boolean
  created_at?: string
  created_by?: string
  updated_at?: string
  updated_by?: string
  health_cardiaque?: boolean
  health_poitrine?: boolean
  health_poitrine2?: boolean
  health_equilibre?: boolean
  health_articulaire?: boolean
  health_articulaire_detail?: string
  health_drugs?: boolean
  health_drugs_detail?: string
  health_other?: boolean
  health_other_detail?: string
  health_objective?: string
}

defineProps({
  userData: {
    type: Object as PropType<UserDetail>,
    default: () => ({}),
  },
})
</script>

<style lang="postcss" scoped>
.health {
  color: green;

  &.checked {
    color: red;
  }
}
</style>
