<template>
  <view class="content">
    <up-empty v-if="state.list.length === 0" mode="data" text="暂时没有记录"></up-empty>
    <up-cell-group v-else :border="false" :customStyle="themes.light.cellGroupBackground">
      <up-cell v-for="(item, index) in state.list" :key="index" :title="actionLabel(item.action)"
        :border="index !== state.list.length - 1"
        :label="formatDateTime(item.created_at)">
        <template #value>
          <view class="text-14px m-r-5px float-left">
            <text :style="{ color: item.amount < 0 ? '#909193' : '#383a49' }">
              {{ item.amount > 0 ? '+' + item.amount : item.amount }}
            </text>
          </view>
          <view class="float-right">
            <u-icon name="https://cdn.evaplat.com/app/usercenter/coin.png" size="15"></u-icon>
          </view>
        </template>
      </up-cell>
    </up-cell-group>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { fetchTransactions } from '@/services/hubApi';
import { themes } from '@/themes';
import { formatDateTime } from '@/utils';

const state = reactive({ list: [] as any[] });

const LABELS: Record<string, string> = {
  sign_in: '每日签到',
  'check_in': '每日签到',
  watch_ad: '观看广告',
  invite_reward: '邀请奖励',
  redeem: '兑换码',
  recharge: '充值',
  signup_bonus: '注册奖励',
};

const actionLabel = (action: string) => {
  if (!action) return '积分变动';
  if (LABELS[action]) return LABELS[action];
  if (action.startsWith('hold:')) return '换脸预扣';
  if (action.startsWith('settle:')) return '换脸结算';
  if (action.startsWith('refund:')) return '换脸退还';
  if (action.startsWith('tool:')) return '换脸消耗';
  return action;
};

onShow(() => {
  fetchTransactions(50)
    .then((rows) => (state.list = rows || []))
    .catch(() => { });
});
</script>
