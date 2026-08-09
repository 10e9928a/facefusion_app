<template>
  <view class="p-14px">
    <view class="text-18px font-bold text-center mb-14px">{{ state.title }}</view>
    <view class="text-14px leading-26px text-#383a49 text-justify whitespace-pre-line">{{ state.content }}</view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { text } from '@/utils';

const state = reactive({ title: 'FaceFusion', content: '' });

onLoad((options: any) => {
  const key = options?.key || '';
  const item = (text as any)[key];
  if (item) {
    state.title = item.title || 'FaceFusion';
    state.content = (item.content || '').trim();
    uni.setNavigationBarTitle({ title: state.title });
  }
});
</script>
