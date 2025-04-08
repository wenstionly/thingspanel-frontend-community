<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { NIcon } from 'naive-ui';
import type { DeviceSourceItem, ICardData } from '@/components/panel/card';
import { getAttributeDataSet, getDeviceValue, telemetryDataCurrentKeys } from '@/service/api/device';
import { icons as iconOptions } from '@/components/common/icons';
import { createLogger } from '@/utils/logger';
import { $t } from '@/locales';

const logger = createLogger('Indicator');
const props = defineProps<{
  card: ICardData;
}>();

const deviceSources = computed<DeviceSourceItem[]>(() => props.card?.dataSource?.deviceSource || []);
const units = computed<string[]>(() => props.card?.config?.units || []);
const colors = computed<string[]>(() => props.card?.config?.colors || []);
const icons = computed<string[]>(() => props.card?.config?.icons || []);

const values = ref({});

const detail = ref<string>('');
const unit = ref<string>(''); // Unit will be '%' for humidity
const fontSize = ref('14px');
const cardRef = ref(null);
let resizeObserver: ResizeObserver | null = null;

const updateData = (_deviceId: string | undefined, metricsId: string | undefined, data: any) => {
  if (metricsId && data) {
    values.value[metricsId] = data[metricsId];
  }
  // if (metricsId && data[metricsId] !== undefined) {
  //   detail.value = Number(data[metricsId]);
  // }
};

const initialData = async () => {
  if (!deviceSources.value[0]) return;

  for(let i = 0, l = deviceSources.value.length; i < l; i++) {
    const source = deviceSources.value[i];
    const value = await getDeviceValue(source);
    if (value !== null) {
      updateData(source.deviceId, source.metricsId, { [source.metricsId]: value });
    }
  };
};

const handleResize = (entries: ResizeObserverEntry[]) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    const newFontSize = `${Math.min(width, height) / 15}px`;
    fontSize.value = newFontSize;
  }
};

watch(
  () => props.card?.dataSource?.deviceSource,
  () => {
    initialData();
  },
  { deep: true }
);

onMounted(() => {
  if (cardRef.value) {
    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(cardRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

defineExpose({
  updateData
});
</script>

<template>
  <div ref="cardRef" class="card-container">
    <div class="card-content" :style="{ fontSize: fontSize }" v-for="item in deviceSources" :key="item.metricsId">
      <div class="icon-container">
        <NIcon class="iconclass" :color="colors[item.metricsId] || 'blue'">
          <component :is="iconOptions[icons[item.metricsId] || 'Water']" />
        </NIcon>
      </div>
      <div class="value-container">
        <span class="value" :title="(values[item.metricsId] || '45') + (units[item.metricsId] || '')">
          {{ values[item.metricsId] || '--' }} {{ units[item.metricsId] || '' }}
        </span>
      </div>
      <div class="metric-name-container">
        <span class="metric-name" :title="item.metricsName">
          {{ item.metricsName || $t('card.humidity') }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: stretch;
}

.card-content:not(:last-child) {
  border-right: 1px solid rgb(239,239,245);
}
.card-content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 5% 5%;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.iconclass {
  font-size: 3em;
}

.value-container {
  display: flex;
  justify-content: center;
  align-items: baseline;
  width: 100%;
}

.value {
  font-size: 2em;
  font-weight: bold;
  text-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unit {
  margin-left: 0.3em;
  font-size: 2em;
}

.metric-name-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
}

.metric-name {
  font-size: 1em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
}
</style>
