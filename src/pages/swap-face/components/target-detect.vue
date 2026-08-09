<template>
  <view>
    <view class="actions">
      <button class="detect-btn" :disabled="disabled || detecting" @click="emit('detect')">
        {{ detecting ? '检测中...' : '检测人脸' }}
      </button>
    </view>
    <view v-if="status" class="status" :class="statusType">
      <view class="dot"></view>
      <view>{{ status }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  detecting?: boolean;
  status?: string;
  statusType?: '' | 'ok' | 'err' | 'busy';
}>();

const emit = defineEmits(['detect']);
</script>

<style scoped lang="scss">
.actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 14px;
}

.detect-btn {
  margin: 0;
  padding: 6px 16px;
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #383a49;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.detect-btn::after {
  border: none;
}

.detect-btn[disabled] {
  background: #c8c9d0;
  color: #ffffff;
}

.status {
  font-size: 13px;
  margin-top: 12px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #909193;
  white-space: pre-wrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c8c9d0;
  flex: none;
  margin-top: 6px;
}

.status.ok {
  color: #383a49;
}

.status.ok .dot {
  background: #383a49;
}

.status.err {
  color: #cf222e;
}

.status.err .dot {
  background: #cf222e;
}

.status.busy .dot {
  background: #909193;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.7);
  }
}
</style>
