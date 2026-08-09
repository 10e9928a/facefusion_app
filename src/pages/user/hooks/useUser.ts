import { onShow } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { checkIn as apiCheckIn, redeem as apiRedeem, watchAdReward } from '@/services/hubApi';
import { credits, isLoggedIn, refreshCredits, userId } from '@/stores/auth';
import { videoAd } from '@/utils/ad';

export const useUser = () => {
  const state = reactive({
    loggedIn: isLoggedIn(),
    userId,
    credits,
    rechargeId: '',
    coinIcon: 'https://cdn.evaplat.com/app/usercenter/coin.png',
    copyIcon: 'https://cdn.evaplat.com/app/usercenter/copy.png',
    avatarUrl: 'https://cdn.evaplat.com/app/usercenter/avatar.jpeg',
    redeemBack: 'https://cdn.evaplat.com/app/usercenter/points-redeem-back.png',
  });

  onShow(() => {
    state.loggedIn = isLoggedIn();
    if (isLoggedIn()) refreshCredits();
  });

  const checkIn = () => {
    apiCheckIn()
      .then(() => {
        refreshCredits();
        uni.showToast({ title: '签到成功', icon: 'success' });
      })
      .catch((err: any) => {
        uni.showToast({ title: err.message || '今日已签到', icon: 'none' });
      });
  };

  const watchAd = async () => {
    const watched = await videoAd();
    if (!watched) return;
    watchAdReward()
      .then(() => {
        refreshCredits();
        uni.showToast({ title: '奖励已到账', icon: 'success' });
      })
      .catch((err: any) => {
        uni.showToast({ title: err.message || '领取失败', icon: 'none' });
      });
  };

  const iRedeem = () => {
    const code = (state.rechargeId || '').trim();
    if (!code) {
      uni.showToast({ title: '请输入兑换码', icon: 'none' });
      return;
    }
    apiRedeem(code)
      .then(() => {
        refreshCredits();
        state.rechargeId = '';
        uni.showToast({ title: '兑换成功', icon: 'success' });
      })
      .catch((err: any) => {
        uni.showToast({ title: err.message || '已兑换或兑换码错误', icon: 'none' });
      });
  };

  return { state, checkIn, watchAd, iRedeem };
};
