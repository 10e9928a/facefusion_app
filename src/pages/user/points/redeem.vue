<template>
  <view class="content">
    <image class="w-100% b-rd-8px overflow-hidden" mode="widthFix" :src="state.redeemBack"></image>
    <view class="mt-18px w-100% b-rd-8px">
      <view class="mt-5px text-14px font-bold">兑换积分</view>
      <view class="h-25px p-7.5px leading-30px mt-12px b-rd-8px bg-#ffffff">
        <up-input :border="'none'" placeholder="请输入兑换码" v-model="state.rechargeId" clearable></up-input>
      </view>
      <view class="mt-18px b-rd-8px overflow-hidden">
        <up-button text="立即兑换" :color="'#383a49'" @click="iRedeem"></up-button>
      </view>
    </view>
    <view class="text-12px leading-22px text-#909193 text-justify whitespace-pre-line">
      · 输入有效兑换码即可获得对应积分。
      · 每个兑换码有使用次数与有效期限制，过期或用尽后失效。
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUser } from '../hooks/useUser';

const { state, iRedeem } = useUser();
</script>
