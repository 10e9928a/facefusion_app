<template>
  <view class="content">
    <view class="section-card">
      <view class="card-head">
        <view class="step-num">1</view>
        <view class="card-title">上传目标</view>
        <view class="card-sub">图片 / 视频</view>
      </view>
      <target-upload :target="state.targetList[0]" @choose="chooseTarget" />
      <target-detect
        :disabled="!state.targetList[0] || state.targetList[0].status !== 'success'"
        :detecting="state.detecting"
        :status="state.detectStatus"
        :statusType="state.detectStatusType"
        @detect="detectTarget"
      />
    </view>

    <view class="section-card" :class="{ locked: !state.detectStatusType }">
      <view class="card-head">
        <view class="step-num">2</view>
        <view class="card-title">选择要替换的人脸</view>
        <view class="card-sub">{{ state.faceCount ? `${state.faceCount} 张` : '' }}</view>
      </view>
      <target-faces
        :faces="state.faces"
        :selectedPosition="state.selectedFace?.position"
        :detected="state.detectStatusType === 'ok'"
        :frameNumber="state.frameNumber"
        @select="selectFace"
      />
    </view>

    <view class="section-card" :class="{ locked: !state.faces.length }">
      <view class="card-head">
        <view class="step-num">3</view>
        <view class="card-title">上传源人脸</view>
        <view class="card-sub">清晰正脸</view>
      </view>
      <face-source @select="selectSource" />
      <view class="card-hint">源脸库最多可保存 10 张。长按已上传源脸可删除。</view>
    </view>

    <view class="section-card" :class="{ locked: !state.faces.length || !state.source?.url }">
      <view class="card-head">
        <view class="step-num">4</view>
        <view class="card-title">开始换脸</view>
      </view>
      <up-button
        :color="'#383a49'"
        :customStyle="{ height: '43px' }"
        :text="state.submitting ? '生成中...' : '开始换脸'"
        :disabled="state.submitting"
        @click="generate"
      />
      <view class="tips">{{ tips }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import faceSource from '../swap-face/components/face-source.vue';
import targetDetect from '../swap-face/components/target-detect.vue';
import targetFaces from '../swap-face/components/target-faces.vue';
import targetUpload from '../swap-face/components/target-upload.vue';
import { useSwapFace } from '../swap-face/hooks/useSwapFace';

const tips = '· 生成需消耗积分，任务完成后可在「任务记录」查看并保存。\n· 视频任务耗时较长，请耐心等待。\n· 请勿上传涉及侵权、违法或不良内容，违规将封号处理。';

const { state, selectSource, chooseTarget, detectTarget, selectFace, generate } = useSwapFace();
</script>

<style scoped lang="scss">
.section-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 14px;
  margin-top: 18px;
}

.section-card:first-child {
  margin-top: 0;
}

.section-card.locked {
  opacity: 0.55;
  pointer-events: none;
}

.section-card.locked .step-num {
  background: #d0d0d4;
}

.card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.step-num {
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: #383a49;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: #000000;
}

.card-sub {
  margin-left: auto;
  font-size: 12px;
  color: #909193;
}

.card-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #909193;
  line-height: 1.5;
}

.tips {
  margin-top: 14px;
  font-size: 12px;
  line-height: 22px;
  color: #909193;
  text-align: justify;
  white-space: pre-line;
}
</style>
