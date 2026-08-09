<template>
  <view class="content">
    <!-- 用户信息 -->
    <view class="bg-#ffffff text-#000 h-40px p-14px b-rd-8px">
      <view class="float-left w-52px">
        <u-avatar :src="state.avatarUrl"></u-avatar>
      </view>
      <span class="leading-20px text-15px">普通用户</span>
      <br />
      <span class="mt-6px text-12px" @click="copyText(state.userId)">
        <span class="float-left m-r-5px"> 账号: {{ state.userId || '未登录' }} </span>
        <view class="p-2px">
          <u-icon :size="12" :name="state.copyIcon"></u-icon>
        </view>
      </span>
    </view>

    <!-- 快捷入口 -->
    <view class="mt-18px w-100% h-70px">
      <view class="w-[calc(50%-9px)] float-left">
        <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
          <up-cell :isLink="true" :border="false" title="积分兑换" label="兑换码兑换积分"
            :title-style="themes.light.taskCellGroupTitle" :right-icon-style="{ marginTop: '-23px !important' }"
            @click="navigateTo('/pages/user/points/redeem')">
          </up-cell>
        </up-cell-group>
      </view>
      <view class="w-[calc(50%-9px)] float-right">
        <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
          <up-cell :isLink="true" :border="false" title="任务记录" label="历史任务记录"
            :title-style="themes.light.taskCellGroupTitle" :right-icon-style="{ marginTop: '-23px !important' }"
            @click="navigateTo('/pages/user/tasks/history')">
          </up-cell>
        </up-cell-group>
      </view>
    </view>

    <!-- 积分任务 -->
    <view class="mt-18px">
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :titleStyle="themes.light.taskCellGroupTitle" :isLink="true" :icon="state.coinIcon" title="积分"
          @click="navigateTo('/pages/user/points/history')">
          <template #value>
            <text class="up-cell-value text-bold">{{ state.credits }}</text>
          </template>
        </up-cell>
        <up-cell-group :customStyle="themes.light.taskCellGroupBackground" :border="false">
          <up-cell :titleStyle="themes.light.taskCellGroupTitle" title="每日签到" label="每日签到可获得积分">
            <template #value>
              <view class="w-66px">
                <up-button size="small" text="立即签到" shape="circle" :color="'#383a49'" @click="checkIn()"></up-button>
              </view>
            </template>
          </up-cell>
          <!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
          <up-cell :titleStyle="themes.light.taskCellGroupTitle" title="观看广告" label="观看广告得积分">
            <template #value>
              <view class="w-66px">
                <up-button size="small" text="立即观看" shape="circle" :color="'#383a49'" @click="watchAd()"></up-button>
              </view>
            </template>
          </up-cell>
          <up-cell :titleStyle="themes.light.taskCellGroupTitle" title="推荐好友" label="推荐有效用户得积分" :border="false">
            <template #value>
              <view class="w-66px">
                <up-button size="small" text="立即推荐" shape="circle" :color="'#383a49'" open-type="share"></up-button>
              </view>
            </template>
          </up-cell>
          <!-- #endif -->
        </up-cell-group>
      </up-cell-group>
    </view>

    <!-- 协议 -->
    <view class="mt-18px">
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :isLink="true" icon="tags-fill" title="隐私政策"
          @click="navigateTo('/pages/common/tcontent?key=privacyPolicy')">
        </up-cell>
        <up-cell :isLink="true" icon="pushpin-fill" title="用户协议" :border="false"
          @click="navigateTo('/pages/common/tcontent?key=termsAndConditions')">
        </up-cell>
      </up-cell-group>
    </view>

    <!-- #ifdef MP-WEIXIN || MP-KUAISHOU -->
    <view class="mt-18px" v-if="!state.loggedIn">
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :border="false" title="登录 / 注册" label="微信登录或手机号登录" :isLink="true"
          @click="navigateTo('/pages/user/auth/login')"></up-cell>
      </up-cell-group>
    </view>
    <view class="mt-18px" v-else>
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :border="false" title="退出登录" @click="onLogout()"></up-cell>
      </up-cell-group>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 || APP-PLUS -->
    <view class="mt-18px" v-if="!state.loggedIn">
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :border="false" title="登录 / 注册" :isLink="true" @click="navigateTo('/pages/user/auth/login')"></up-cell>
      </up-cell-group>
    </view>
    <view class="mt-18px" v-else>
      <up-cell-group :customStyle="themes.light.cellGroupBackground" :border="false">
        <up-cell :border="false" title="退出登录" @click="onLogout()"></up-cell>
      </up-cell-group>
    </view>
    <!-- #endif -->

  </view>
</template>

<script lang="ts">
export default {
  // @ts-ignore
  onShareAppMessage() {
    const inviterId = uni.getStorageSync('ff:userId');
    return {
      title: 'AI 换脸，一键生成',
      path: `/pages/home/index?inviterId=${encodeURIComponent(inviterId || '')}`,
      imageUrl: '',
    };
  },
};
</script>

<script setup lang="ts">
import { themes } from '@/themes';
import { copyText, navigateTo } from '@/utils';
import { logout } from '@/stores/auth';
import { useUser } from './hooks/useUser';

const { state, checkIn, watchAd } = useUser();

const onLogout = () => {
  logout();
  state.loggedIn = false;
  uni.showToast({ title: '已退出', icon: 'none' });
  setTimeout(() => navigateTo('/pages/user/auth/login'), 500);
};
</script>
