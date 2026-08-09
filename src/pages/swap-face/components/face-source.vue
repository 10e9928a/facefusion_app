<template>
  <view>
    <view class="source-count">{{ state.sources.length }}/10</view>
    <view class="source-scroll">
      <view class="source-row">
        <!-- 上传按钮 -->
        <view class="source-upload" @click="onUpload">
          <u-loading-icon v-if="state.uploading" mode="circle" :size="18"></u-loading-icon>
          <u-icon v-else name="plus" color="#909193" :size="22"></u-icon>
        </view>

        <!-- 人脸库 -->
        <view v-for="(item, index) in state.sources" :key="item.id" class="source-item">
          <image class="source-img" mode="aspectFill" :src="item.url"
            :style="{ border: isSelected(index) ? '2px solid #383a49' : '2px solid #ffffff' }"
            @click="toggle(index)" @touchstart="touchStart(item.id)" @touchend="touchEnd" @touchcancel="touchEnd">
          </image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useFaceSource } from '../hooks/useFaceSource';

const emit = defineEmits(['select']);
const { state, isSelected, uploadFace, touchStart, touchEnd } = useFaceSource();

const emitSelect = () => {
  emit('select', {
    source: state.sources[state.selectedIndex],
    index: state.selectedIndex,
  });
};

const toggle = (index: number) => {
  state.selectedIndex = index;
  emitSelect();
};

const onUpload = async () => {
  await uploadFace();
};

watch(() => state.sources.length, () => emitSelect());
</script>

<style scoped lang="scss">
.source-count {
  margin: -2px 0 8px;
  text-align: right;
  font-size: 12px;
  color: #909193;
}

.source-scroll {
  width: calc(100% - 10px);
  padding: 5px;
  height: 64px;
  border-radius: 8px;
  background: #ffffff;
  overflow-x: scroll;
  position: relative;
}

.source-row {
  width: max-content;
  position: absolute;
  display: flex;
}

.source-upload,
.source-item,
.source-img {
  width: 58px;
  height: 58px;
  border-radius: 8px;
}

.source-upload {
  margin-right: 5px;
  border: 2px dashed #d8d8de;
  background: #f5f6fb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-item {
  margin-right: 5px;
}
</style>
