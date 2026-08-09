<template>
  <view class="drop" :class="{ has: target }" @click="onChoose">
    <view v-if="!target" class="empty">
      <view class="ic">
        <view class="frame"></view>
        <view class="mountain"></view>
        <view class="sun"></view>
      </view>
      <view class="t">点击选择图片或视频</view>
      <view class="h">支持 JPG、PNG、MP4、MOV 等格式</view>
    </view>
    <view v-else class="filepill">
      <image class="thumb" mode="aspectFill" :src="target.thumbUrl || target.url" />
      <view class="fi">
        <view class="nm">{{ target.name || '目标文件' }}</view>
        <view class="sz">{{ target.message || formatSize(target.size) || '已上传' }}</view>
      </view>
      <view class="re" @click.stop="onChoose">重新选择</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  target?: {
    status: string;
    url: string;
    message?: string;
    name?: string;
    size?: number;
    thumbUrl?: string;
  };
}>();

const emit = defineEmits(['choose']);

const onChoose = () => emit('choose');

const formatSize = (size?: number) => {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};
</script>

<style scoped lang="scss">
.drop {
  display: block;
  position: relative;
  border: 1px dashed #d8d8de;
  border-radius: 8px;
  padding: 20px 16px;
  text-align: center;
  background: #f5f6fb;
  transition: border-color 0.15s, background 0.15s;
}

.drop:active {
  border-color: #909193;
  background: #eceef3;
}

.drop.has {
  padding: 12px;
  text-align: left;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ic {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  position: relative;
}

.frame {
  width: 40px;
  height: 32px;
  border: 2px solid #909193;
  border-radius: 4px;
  position: absolute;
  left: 0;
  top: 4px;
}

.mountain {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 10px solid #c8c9d0;
  position: absolute;
  left: 8px;
  bottom: 10px;
}

.mountain::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 8px solid #b0b1b8;
  position: absolute;
  left: 6px;
  bottom: -10px;
}

.sun {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c8c9d0;
  position: absolute;
  right: 8px;
  top: 10px;
}

.t {
  font-size: 14px;
  font-weight: 500;
  color: #383a49;
}

.h {
  font-size: 12px;
  color: #909193;
  margin-top: 4px;
}

.filepill {
  display: flex;
  align-items: center;
  gap: 12px;
}

.re {
  font-size: 13px;
  color: #0969da;
  background: none;
  border: 0;
  padding: 6px 8px;
  font-weight: 500;
  flex: none;
}

.thumb {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: #eaeef2;
  flex: none;
  border: 1px solid #d0d7de;
}

.fi {
  min-width: 0;
  flex: 1;
}

.nm {
  font-size: 13px;
  font-weight: 500;
  color: #383a49;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sz {
  font-size: 12px;
  color: #909193;
  margin-top: 2px;
}
</style>
