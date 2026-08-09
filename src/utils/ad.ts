export async function videoAd(): Promise<boolean> {
  let rewardedVideoAd: any = null;

  //#ifdef MP-WEIXIN
  if (uni.createRewardedVideoAd) {
    rewardedVideoAd = uni.createRewardedVideoAd({
      // adUnitId: "adunit-d1fca83f1edf2da2",
      adUnitId: "adunit-025866f2637e6651",
    });
  }
  //#endif

  //#ifdef MP-KUAISHOU
  if (uni.createRewardedVideoAd) {
    rewardedVideoAd = uni.createRewardedVideoAd({
      // @ts-ignore
      unitId: 100034697,
      type: 100011056,
    });
  }
  //#endif

  if (!rewardedVideoAd) return false;

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (watched: boolean) => {
      if (settled) return;
      settled = true;
      rewardedVideoAd.offClose?.(handleClose);
      resolve(watched);
    };
    const handleClose = (res: any) => finish(Boolean(res?.isEnded));

    rewardedVideoAd.onClose(handleClose);
    void (async () => {
      try {
        await rewardedVideoAd.show();
      } catch {
        try {
          await rewardedVideoAd.load();
          await rewardedVideoAd.show();
        } catch {
          finish(false);
        }
      }
    })();
  });
}
