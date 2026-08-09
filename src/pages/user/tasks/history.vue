<template>
  <view class="content">
    <up-empty v-if="state.outputs.length === 0" mode="data" text="暂时没有记录"></up-empty>
    <view v-else>
      <up-cell-group :border="false" :customStyle="{ 'background-color': '#ffffff' }">
        <up-cell v-for="(output, index) in state.outputs" :key="output.id" :border="!isLast(index)"
          title="换脸任务" :clickable="true" @click="itemClick(output)"
          :label="formatDateTime(output.createdAt)">
          <template #value>
            <view style="margin-top: -20px">
              <u-loading-icon v-if="output.status === 'queued' || output.status === 'running'" mode="circle" :size="12"
                color="#585858" :textSize="12" textColor="#585858"
                :text="output.status === 'running' ? `生成中 ${output.progress}%` : '排队中'">
              </u-loading-icon>
              <u-icon v-else-if="output.status === 'succeeded'" name="checkmark" :size="12" color="#32CD32"
                :labelSize="12" labelColor="#32CD32" label="生成成功"></u-icon>
              <u-icon v-else name="close" :size="12" color="#FF0000" :labelSize="12" labelColor="#FF0000"
                :label="output.status === 'cancelled' ? '已取消' : '生成失败'"></u-icon>
            </view>
          </template>
        </up-cell>
      </up-cell-group>
    </view>

    <up-action-sheet round="10" :actions="[
      { name: '立即下载' },
      { name: '复制链接' },
      { name: '立即删除' },
      { name: '取消' },
    ]" title="操作" :show="state.show" @select="selectClick" :safeAreaInsetBottom="false" @close="state.show = false">
    </up-action-sheet>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow, onUnload } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { deleteOutput, fetchOutputs, type Output } from '@/services/facefusionApi';
import { copyText, downloadFileAndSaveToAlbum, formatDateTime } from '@/utils';
import { ensureLogin, isLoggedIn } from '@/stores/auth';

const state = reactive({
  show: false,
  timer: undefined as any,
  outputs: [] as Output[],
  current: undefined as Output | undefined,
});

const load = async () => {
  if (!isLoggedIn()) {
    const ok = await ensureLogin();
    if (!ok) {
      state.outputs = [];
      return;
    }
  }
  try {
    const res = await fetchOutputs({ page: 1, size: 30 });
    state.outputs = res.list || [];
  } catch (e: any) {
    state.outputs = [];
    uni.showToast({ title: e?.message || '加载任务失败', icon: 'none' });
  }
};

onLoad(() => {
  void load();
  state.timer = setInterval(() => void load(), 2000);
});

onShow(() => {
  void load();
});

onUnload(() => clearInterval(state.timer));

const isLast = (index: number) => index === state.outputs.length - 1;

const itemClick = (item: Output) => {
  if (item.status === 'failed' || item.status === 'cancelled') {
    uni.showModal({
      title: '任务失败',
      content: (item.error || '未知原因, 请重试') + ', 是否删除?',
      success: (res) => {
        if (res.confirm) deleteOutput(item.id).then(load);
      },
    });
    return;
  }
  state.current = item;
  state.show = true;
};

const selectClick = async (action: any) => {
  const item = state.current;
  if (!item) return;
  if (action.name === '复制链接') {
    if (item.status !== 'succeeded' || !item.resultUrl) {
      uni.showToast({ title: '结果尚未就绪', icon: 'none' });
      return;
    }
    copyText(item.resultUrl);
  }
  if (action.name === '立即下载') {
    if (item.status !== 'succeeded' || !item.resultUrl) {
      uni.showToast({ title: '结果尚未就绪', icon: 'none' });
      return;
    }
    uni.showToast({ title: '下载中0%', icon: 'loading', duration: 1000000 });
    const result = (await downloadFileAndSaveToAlbum(item.resultUrl)) as any;
    uni.hideToast();
    uni.showToast(result);
  }
  if (action.name === '立即删除') {
    if (item.status === 'queued' || item.status === 'running') {
      uni.showToast({ title: '正在生成, 请稍候', icon: 'none' });
      return;
    }
    uni.showModal({
      title: '温馨提示',
      content: '确定要删除吗?',
      success: (res) => {
        if (res.confirm) deleteOutput(item.id).then(load);
      },
    });
  }
};
</script>
