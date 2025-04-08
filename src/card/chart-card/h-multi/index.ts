import { defineAsyncComponent } from 'vue';
import type { ICardDefine } from '@/components/panel/card';
import { $t } from '@/locales';
import poster from './poster.png';

export default {
  // id必须符合 类型-唯一标识 的格式，中间以-隔开，并且整个id只出现一次-
  id: 'chart-hmulti',
  type: 'chart',
  component: defineAsyncComponent(() => import('./component.vue')),
  configForm: defineAsyncComponent(() => import('./card-config.vue')),
  poster,
  title: $t('card.hMulti.name'),
  preset: {
    dataSource: {
      origin: 'device',
      systemSource: [{}],
      deviceSource: [{}]
    },
    iCardViewDefault: {
      w: 4,
      h: 2,
      minW: 1,
      minH: 1
    },
    config: {
      units: {},
      colors: {},
      icons: {}
    }
  }
} as ICardDefine;
