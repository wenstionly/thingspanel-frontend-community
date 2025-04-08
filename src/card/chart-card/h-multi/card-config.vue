<script lang="ts" setup>
import { inject, computed } from 'vue';
import type { IConfigCtx } from '@/components/panel/card';
import { $t } from '@/locales';
import IconSelector from '@/components/common/icon-selector.vue';

const props = defineProps<{
  data: any;
}>();

const ctx = inject<IConfigCtx>('config-ctx')!;

const deviceSources = computed(() => props.data?.dataSource?.deviceSource || []);

const setIcon = (metricsId: string, icon: string) => {
  ctx.config.icons[metricsId] = icon; // 更新配置
};
</script>

<template>
  <NForm :model="ctx.config">
    <NCollapse default-expanded-names="1" accordion>
      <NCollapseItem
        v-for="(item, index) in deviceSources"
        :key="item.metricsId"
        :name="index + 1"
        :title="item.metricsName"
      >
        <NFormItem :label="$t('device_template.table_header.unit')">
          <NInput
            v-model:value="ctx.config.units[item.metricsId]"
            :placeholder="$t('device_template.table_header.pleaseEnterTheUnit')"
          />
        </NFormItem>
        <NFormItem :label="$t('generate.color')">
          <NColorPicker v-model:value="ctx.config.colors[item.metricsId]" :show-alpha="false" />
        </NFormItem>
        <IconSelector :default-icon="ctx.config?.icons?.[item.metricsId]" @icon-selected="setIcon(item.metricsId, $event)" />
      </NCollapseItem>
    </NCollapse>
  </NForm>
</template>
