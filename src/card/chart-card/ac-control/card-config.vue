<script lang="ts" setup>
import { inject, onMounted, watch, computed } from 'vue';
import { NButton, NCollapse, NCollapseItem, NForm, NFormItem, NIcon, NInput, NSelect } from 'naive-ui';
import type { IConfigCtx } from '@/components/panel/card';
import { $t } from '@/locales';
import { DefaultModeButtons, DefaultSpeedButtons } from './default-values';
import { DeleteOutlined, PlusOutlined } from '@vicons/antd';

const ctx = inject<IConfigCtx>('config-ctx')!;

const props = defineProps<{
  data: any;
}>();

watch(() => props.data, () => {
  console.log('props.data changed', props.data);
}, { deep: true });

// 遥测数据源列表
const allSources = computed(
  () => (
    props.data?.dataSource?.deviceSource?.map?.(
      item => ({
        label: item.metricsName,
        value: item.metricsId
      })
    ) || []
  )
);

const removeModeButton = (index) => {
  ctx.config.modeButtons = ctx.config.modeButtons.filter((_, i) => i !== index);
};

const addModeButton = () => {
  ctx.config.modeButtons.push({
    label: '',
    value: ''
  });
};

const removeSpeedButton = (index) => {
  ctx.config.speedButtons = ctx.config.speedButtons.filter((_, i) => i !== index);
};

const addSpeedButton = () => {
  ctx.config.speedButtons.push({
    label: '',
    value: ''
  });
};

onMounted(() => {
  console.log('ac-control card-config ', ctx);
  console.log('ctx.config.iconName', ctx.config.iconName);
  console.log('props.data', props.data);
  if (ctx.config.iconName === undefined) ctx.config.iconName = 'ImageOutline';
  if (!ctx.config.speedButtons) {
    ctx.config.speedButtons = [...DefaultSpeedButtons];
  }
  if (!ctx.config.modeButtons) {
    ctx.config.modeButtons = [...DefaultModeButtons];
  }
  // if (ctx.config.min === undefined) ctx.config.min = 0;
  // if (ctx.config.max === undefined) ctx.config.max = 100;
  // if (ctx.config.step === undefined) ctx.config.step = 0.1;
  // if (ctx.config.decimals === undefined) ctx.config.decimals = 1;
});

const setIcon = (icon: string) => {
  ctx.config.iconName = icon;
};
</script>

<template>
  <NForm :model="ctx.config">
    <NFormItem :label="$t('card.acControl.icon')">
      <IconSelector :default-icon="ctx.config.iconName" @icon-selected="setIcon" />
    </NFormItem>
    <NCollapse default-expanded-names="1" accordion>
      <NCollapseItem name="1" title="绑定数据源">
        <NFormItem :label="$t('card.acControl.envTemp')">
          <NSelect v-model:value="ctx.config.envTempSource" :options="allSources" />
        </NFormItem>
        <NFormItem :label="$t('card.acControl.power')">
          <NSelect v-model:value="ctx.config.powerSource" :options="allSources" />
        </NFormItem>
        <NFormItem :label="$t('card.acControl.speed')">
          <NSelect v-model:value="ctx.config.speedSource" :options="allSources" />
        </NFormItem>
        <NFormItem :label="$t('card.acControl.mode')">
          <NSelect v-model:value="ctx.config.modeSource" :options="allSources" />
        </NFormItem>
        <NFormItem :label="$t('card.acControl.temp')">
          <NSelect v-model:value="ctx.config.tempSource" :options="allSources" />
        </NFormItem>
      </NCollapseItem>
      <NCollapseItem name="2" title="模式配置">
        <div v-for="(button, index) in ctx.config.modeButtons" :key="index" class="button-config">
          <div class="flex flex-row items-center gap-2">
            <span>{{ index + 1 }}</span>
            <NInput v-model:value="button.label" :placeholder="$t('card.inputButtonName')" />
            <NInput v-model:value="button.value" :placeholder="$t('card.inputButtonValue')" />
            <NButton v-if="ctx.config.modeButtons.length > 2" type="error" text @click="removeModeButton(index)">
              <NIcon size="20">
                <DeleteOutlined />
              </NIcon>
            </NButton>
          </div>
          <!-- 删除按钮 -->
        </div>

        <!-- 添加按钮 -->
        <NButton type="primary" @click="addModeButton">
          <NIcon size="20">
            <PlusOutlined />
          </NIcon>
          {{ $t('card.addButton') }}
        </NButton>
      </NCollapseItem>
      <NCollapseItem name="3" title="风速配置">
        <div v-for="(button, index) in ctx.config.speedButtons" :key="index" class="button-config">
          <div class="flex flex-row items-center gap-2">
            <span>{{ index + 1 }}</span>
            <NInput v-model:value="button.label" :placeholder="$t('card.inputButtonName')" />
            <NInput v-model:value="button.value" :placeholder="$t('card.inputButtonValue')" />
            <NButton v-if="ctx.config.speedButtons.length > 2" type="error" text @click="removeSpeedButton(index)">
              <NIcon size="20">
                <DeleteOutlined />
              </NIcon>
            </NButton>
          </div>
          <!-- 删除按钮 -->
        </div>

        <!-- 添加按钮 -->
        <NButton type="primary" @click="addSpeedButton">
          <NIcon size="20">
            <PlusOutlined />
          </NIcon>
          {{ $t('card.addButton') }}
        </NButton>
      </NCollapseItem>
    </NCollapse>
    <!-- <NFormItem :label="$t('device_template.table_header.unit')">
      <NInput v-model:value="ctx.config.unit" :placeholder="$t('device_template.table_header.pleaseEnterTheUnit')" />
    </NFormItem>
    <NFormItem :label="$t('generate.min-value')">
      <NInputNumber v-model:value="ctx.config.min" :placeholder="$t('generate.min-value')" />
    </NFormItem>
    <NFormItem :label="$t('generate.max-value')">
      <NInputNumber v-model:value="ctx.config.max" :placeholder="$t('generate.max-value')" />
    </NFormItem>
    <NFormItem :label="$t('generate.step')">
      <NInputNumber v-model:value="ctx.config.step" :placeholder="$t('generate.step')" :step="0.1" />
    </NFormItem>
    <NFormItem :label="$t('generate.decimals')">
      <NInputNumber
        v-model:value="ctx.config.decimals"
        :placeholder="$t('generate.decimals')"
        :precision="0"
        :min="0"
        :max="10"
      />
    </NFormItem> -->
  </NForm>
</template>
