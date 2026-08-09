<template>
  <view class="content">
    <view class="mt-40px text-center">
      <image src="/static/logo.png" mode="aspectFit" class="w-96px h-96px b-rd-8px mx-auto" />
      <view class="mt-12px text-28px font-bold">FaceFusion</view>
      <view class="text-15px font-light mt-8px text-#909193">AI 换脸，一键生成</view>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="mt-18px" v-if="state.autoLogging">
      <view class="text-center text-14px text-#909193">正在自动登录...</view>
    </view>
    <view class="mt-18px" v-else>
      <view class="b-rd-8px overflow-hidden">
        <up-button text="微信一键登录" :color="'#07c160'" :customStyle="{ height: '43px' }"
          :loading="state.wxLoading" :disabled="state.wxLoading || state.loading" @click="onWxLogin" />
      </view>
      <view class="divider">
        <view class="divider-line" />
        <text class="divider-text">或使用手机号登录</text>
        <view class="divider-line" />
      </view>
    </view>
    <!-- #endif -->

    <view class="mt-18px">
      <view class="h-44px px-12px b-rd-8px bg-#ffffff flex items-center">
        <up-input v-model="state.phone" border="none" type="number" placeholder="请输入手机号" maxlength="11" />
      </view>
      <view class="mt-12px h-44px px-12px b-rd-8px bg-#ffffff flex items-center">
        <up-input v-model="state.code" border="none" type="number" placeholder="请输入验证码" maxlength="6" />
        <text class="text-13px whitespace-nowrap ml-8px"
          :style="{ color: state.counting ? '#909193' : '#383a49' }" @click="sendCode">
          {{ state.counting ? state.countdown + 's' : '获取验证码' }}
        </text>
      </view>
      <view class="mt-18px b-rd-8px overflow-hidden">
        <up-button text="登录 / 注册" :color="'#383a49'" :customStyle="{ height: '43px' }"
          :loading="state.loading" :disabled="state.loading" @click="onSmsLogin" />
      </view>
    </view>

    <view class="mt-24px text-center text-12px text-#909193 leading-20px">
      登录即代表同意
      <text class="text-#2440b3" @click="openTerms">《服务协议》</text>
      与
      <text class="text-#2440b3" @click="openPrivacy">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { sendSmsCode } from '@/services/smsApi';
import { ensureLogin, isLoggedIn, smsLogin, wxMiniProgramLogin } from '@/stores/auth';
import { navigateTo } from '@/utils/helpers';

const state = reactive({
  phone: '',
  code: '',
  loading: false,
  wxLoading: false,
  autoLogging: false,
  counting: false,
  countdown: 60,
  timer: null as ReturnType<typeof setInterval> | null,
  sending: false,
});

const backHome = () => {
  uni.showToast({ title: '登录成功', icon: 'success' });
  setTimeout(() => uni.switchTab({ url: '/pages/home/index' }), 600);
};

const startCountdown = () => {
  state.counting = true;
  state.countdown = 60;
  if (state.timer) clearInterval(state.timer);
  state.timer = setInterval(() => {
    state.countdown -= 1;
    if (state.countdown <= 0) {
      if (state.timer) clearInterval(state.timer);
      state.timer = null;
      state.counting = false;
    }
  }, 1000);
};

const sendCode = async () => {
  if (state.counting || state.sending) return;
  if (!/^1\d{10}$/.test(state.phone)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return;
  }
  state.sending = true;
  try {
    const res = await sendSmsCode(state.phone);
    if (res.devMode && res.devCode) {
      state.code = res.devCode;
      uni.showModal({
        title: '开发验证码',
        content: `验证码: ${res.devCode}\n(已自动填入)`,
        showCancel: false,
      });
    } else {
      uni.showToast({ title: '验证码已发送', icon: 'none' });
    }
    startCountdown();
  } catch (e: any) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' });
  } finally {
    state.sending = false;
  }
};

const onSmsLogin = async () => {
  if (!/^1\d{10}$/.test(state.phone)) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' });
    return;
  }
  if (!state.code) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }
  state.loading = true;
  try {
    await smsLogin(state.phone, state.code);
    backHome();
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' });
  } finally {
    state.loading = false;
  }
};

const onWxLogin = async () => {
  if (state.wxLoading) return;
  state.wxLoading = true;
  try {
    await wxMiniProgramLogin();
    backHome();
  } catch (e: any) {
    uni.showToast({ title: e.message || '微信登录失败', icon: 'none' });
  } finally {
    state.wxLoading = false;
  }
};

const tryAutoLogin = async () => {
  if (isLoggedIn()) {
    backHome();
    return;
  }
  // #ifdef MP-WEIXIN
  state.autoLogging = true;
  try {
    const ok = await ensureLogin();
    if (ok) backHome();
  } finally {
    state.autoLogging = false;
  }
  // #endif
};

onLoad(() => {
  void tryAutoLogin();
});

const openTerms = () => navigateTo('/pages/common/tcontent?key=termsAndConditions');
const openPrivacy = () => navigateTo('/pages/common/tcontent?key=privacyPolicy');
</script>

<style scoped lang="scss">
.divider {
  display: flex;
  align-items: center;
  margin: 18px 0 0;
  gap: 10px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e5e7ef;
}

.divider-text {
  font-size: 12px;
  color: #909193;
  white-space: nowrap;
}
</style>
