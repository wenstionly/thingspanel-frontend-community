<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NSlider, NRadioGroup, NRadioButton } from 'naive-ui';
import type { DeviceSourceItem, ICardData } from '@/components/panel/card';
import { $t } from '@/locales';
import { getDeviceValue, setDeviceValue } from '@/service/api/device';

import * as ionicons5 from '@vicons/ionicons5';
import dayjs from 'dayjs';

// 看起来应该是固定写法，用来接收卡片相关配置信息
const props = defineProps<{
  card: ICardData;
}>();

// 拿到卡片自定义配置信息
const config = computed(() => props.card?.config || {});
// 拿到卡片关联的数据源
const deviceSource = computed<DeviceSourceItem | null>(() => props.card?.dataSource?.deviceSource || null);
console.log('ac-control component setup');
console.log('card', props.card);
console.log('config', config);
console.log('deviceSource', deviceSource);

// 图标
const iconComponent = computed(() => (ionicons5 as any)[config.value.iconName || 'ImageOutline']);
const PowerOutline = ionicons5.PowerOutline;
const AddOutline = ionicons5.AddOutline;
const RemoveOutline = ionicons5.RemoveOutline;

// 设备名称
const deviceName = computed(() => (deviceSource.value?.name || '设备名称'));
// 设备在线状态
const isDeviceOnline = computed(() => true);
// 室内温度
const envTemp = ref('');
// 开关状态
const power = ref('');
// 速度模式
const speedMode = ref('');
// 模式
const mode = ref('');
// 设定温度
const temp = ref(26);
const tempForDisplay = computed(() => {
  return temp.value.toFixed(1);
});
const minTemp = ref(16);
const maxTemp = ref(50);
const tempStep = ref(0.1);
// 更新时间
const updateTime = ref('');

const updateData = (_deviceId: string | undefined, metricsId: string | undefined, data: any) => {
  console.log('updateData', config.value, _deviceId, metricsId, data);
  if (metricsId && data) {
    if (metricsId === config.value.envTempSource) {
      envTemp.value = data[metricsId];
    } else if (metricsId === config.value.modeSource) {
      mode.value = data[metricsId];
    } else if (metricsId === config.value.powerSource) {
      power.value = data[metricsId];
    } else if (metricsId === config.value.speedSource) {
      speedMode.value = data[metricsId];
    } else if (metricsId === config.value.tempSource) {
      temp.value = data[metricsId];
    }
    updateTime.value = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
  }
  // if (metricsId && data[metricsId] !== undefined) {
  //   detail.value = Number(data[metricsId]);
  // }
};

// 初始化数据
const initialData = async () => {
  if (!deviceSource.value || !deviceSource.value.length) return;
  const { deviceId } = deviceSource.value[0];
  if (!deviceId) return;
  for (let i = 0, l = deviceSource.value.length; i < l; i += 1) {
    const ds = deviceSource.value[i];
    // 根据数据源类型，获取设备数据
    const value = await getDeviceValue(ds);
    if (value !== null) {
      updateData(ds.deviceId, ds.metricsId, { [ds.metricsId]: value });
    }
  }
};

const getDeviceSourceById = (metricsId: string) => {
  return (deviceSource.value || []).filter(item => item.metricsId === metricsId)[0] || null;
};

const changePower = async () => {
  const powerSource = getDeviceSourceById(config.value.powerSource);
  if (powerSource) {
    const value = power.value === '1' ? '0' : '1';
    await setDeviceValue(powerSource, value);
    power.value = value;
  }
};

const changeSpeed = async (value) => {
  const speedSource = getDeviceSourceById(config.value.speedSource);
  if (speedSource) {
    await setDeviceValue(speedSource, value);
    speedMode.value = value;
  }
};

const changeMode = async (value) => {
  const modeSource = getDeviceSourceById(config.value.modeSource);
  if (modeSource) {
    await setDeviceValue(modeSource, value);
    mode.value = value;
  }
};

const changeTemp = async (value) => {
  const tempSource = getDeviceSourceById(config.value.tempSource);
  if (tempSource) {
    await setDeviceValue(tempSource, value);
    temp.value = value;
  }
};
const minusTemp = () => {
  changeTemp(temp.value - tempStep.value);
};
const addTemp = () => {
  changeTemp(temp.value + tempStep.value);
};

// 为卡片选择的数据源发生变化，或者卡片自定义配置发生变化
watch(
  () => [props.card?.config, props.card?.dataSource?.deviceSource],
  () => {
    initialData();
  },
  { deep: true }
);

defineExpose({
  updateData
});
</script>

<template>
  <div ref="cardRef" class="card-container">
    <div class="card-header">
      <component :is="iconComponent" />
      <span>{{ deviceName }}</span>
      <span>{{ $t('custom.devicePage.online') }}</span>
    </div>
    <div class="card-content">
      <div class="line">
        <div>
          <div class="temp-value">{{ envTemp || '--' }}℃</div>
          <div style="margin-top: -24px;"><small>{{ $t('card.acControl.envTemp') }}</small></div>
        </div>
        <!-- 开关图标 -->
        <PowerOutline style="width: 30px;" :class="power === '1' ? 'color-primary-700' : 'color-gray-500'"
                      @click="changePower" />
      </div>
      <div class="line">
        <span>{{ $t('card.acControl.speed') }}：</span>
        <NRadioGroup :value="speedMode" name="speed" @update:value="changeSpeed">
          <NRadioButton v-for="item in config.speedButtons" :key="item.value"
                        :label="item.label" :value="item.value" />
        </NRadioGroup>
      </div>
      <div class="line">
        <span>{{ $t('card.acControl.mode') }}：</span>
        <NRadioGroup :value="mode" name="mode" @update:value="changeMode">
          <NRadioButton v-for="item in config.modeButtons" :key="item.value"
                        :label="item.label" :value="item.value" />
        </NRadioGroup>
      </div>
      <div class="line">
        <span>{{ $t('card.acControl.temp') }}：</span>
        <div class="temp-editor">
          <div class="indicator">
            <RemoveOutline class="btn" @click="minusTemp" />
            <span class="value">{{ tempForDisplay }}</span>
            <AddOutline class="btn" @click="addTemp" />
          </div>
          <NSlider :value="temp" :min="minTemp" :max="maxTemp" :step="tempStep" @update:value="changeTemp" />
        </div>
      </div>
      <div class="line">
        <span></span>
        <span>更新时间：{{ updateTime || '--' }}</span>
      </div>
    </div>
    <!-- <div class="card-content" :style="{ fontSize: fontSize }">
      <div class="value-container">
        <span class="value">{{ formattedDetail }}</span>
        <span class="unit">{{ unit }}</span>
      </div>
      <NSlider v-model:value="detail" :min="min" :max="max" :step="step" @update:value="updateValue" />
      <div class="metric-name">
        {{ props.card?.dataSource?.deviceSource?.[0]?.metricsName || $t('generate.device') + '1' }}
      </div>
    </div> -->
  </div>
</template>

<style scoped lang="scss">
.card-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  padding: 10px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  & > svg {
    width: 20px;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;

  .line {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .temp-value {
      font-size: 4em;
    }
  }
}

.value-container {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.value {
  font-size: 2em;
  font-weight: bold;
}

.unit {
  font-size: 0.8em;
  margin-left: 5px;
}

.metric-name {
  text-align: center;
  font-size: 0.9em;
  margin-top: 10px;
}

.temp-editor {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 20px;

  & > .indicator {
    display: flex;
    flex-direction: row;
    align-items: center;

    .btn {
      width: 20px;
      cursor: pointer;
    }

    .value {
      flex: 1;
      font-size: 24px;
      text-align: center;
    }
  }
}
</style>
