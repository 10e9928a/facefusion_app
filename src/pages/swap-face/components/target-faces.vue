<template>
  <view>
    <view v-if="!faces.length && !detected" class="faces-info muted">
      完成上一步后，这里会显示检测到的人脸。
    </view>
    <view v-else-if="faces.length" class="faces-info">
      {{ frameNumber !== null && frameNumber !== undefined
        ? `已自动选取最正脸的一帧（第 ${frameNumber} 帧）检测，点选要替换的人脸：`
        : '点选要替换的人脸：' }}
    </view>
    <view v-else-if="detected" class="faces-info">未检测到人脸，请更换目标后重试。</view>

    <view v-if="faces.length" class="faces">
      <view
        v-for="face in faces"
        :key="face.position"
        class="face"
        :class="{ sel: selectedPosition === face.position }"
        @click="emit('select', face)"
      >
        <view class="badge">#{{ face.position }}</view>
        <view class="check"></view>
        <image class="face-img" mode="aspectFill" :src="face.image_url" />
        <view class="meta">
          <text>正脸 {{ formatScore(face.frontal_score) }}</text>
          <text class="tag" :class="face.is_valid_reference ? 'ok' : 'no'">
            {{ face.is_valid_reference ? '合格' : '偏侧' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { DetectedFace } from '@/services/facefusionApi';

defineProps<{
  faces: DetectedFace[];
  selectedPosition?: number;
  detected?: boolean;
  frameNumber?: number | null;
}>();

const emit = defineEmits(['select']);

const formatScore = (score?: number) => Number(score || 0).toFixed(2);
</script>

<style scoped lang="scss">
.faces-info {
  color: #656d76;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.faces-info.muted {
  margin-bottom: 0;
}

.faces {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 6px;
}

@media (min-width: 400px) {
  .faces {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.face {
  position: relative;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.face.sel {
  border-color: #383a49;
  box-shadow: 0 0 0 2px rgba(56, 58, 73, 0.15);
}

.face-img {
  width: 100%;
  height: 112px;
  display: block;
  background: #eaeef2;
}

.badge {
  position: absolute;
  top: 6px;
  left: 6px;
  background: rgba(31, 35, 40, 0.75);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  z-index: 1;
}

.check {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #383a49;
  display: none;
  z-index: 1;
}

.check::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border-right: 2px solid #ffffff;
  border-bottom: 2px solid #ffffff;
  transform: rotate(45deg);
}

.face.sel .check {
  display: block;
}

.meta {
  padding: 6px 8px;
  font-size: 11px;
  color: #656d76;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: space-between;
  border-top: 1px solid #d8dee4;
}

.tag {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 20px;
  font-weight: 600;
}

.tag.ok {
  color: #383a49;
  background: #f5f6fb;
}

.tag.no {
  color: #909193;
  background: #f5f6fb;
}
</style>
