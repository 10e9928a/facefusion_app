/** 下载文件并保存到相册(结果 URL 已是可直接访问的签名/公开地址)。 */
export function downloadFileAndSaveToAlbum(url: string) {
  const imageExtensions = /(jpeg|jpg|webp|png|bmp|gif|tiff|svg|ico|heic|raw)(.*)?$/i;
  const videoExtensions = /(mp4|avi|mov|wmv|flv|mkv|webm|m4v|3gp|ts|rmvb|video)(.*)?$/i;
  const fileType = imageExtensions.test(url) ? 'image' : videoExtensions.test(url) ? 'video' : null;
  let waiting: any = null;

  return new Promise((resolve) => {
    const downloadTask = uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode !== 200) {
          resolve({ title: '下载失败,请检查网络', icon: 'none', duration: 3000 });
          return;
        }
        const onOk = () => resolve({ title: '保存成功', icon: 'none', duration: 3000 });
        const onFail = () => resolve({ title: '保存失败,请稍后重试', icon: 'none', duration: 3000 });
        if (fileType === 'image') {
          uni.saveImageToPhotosAlbum({ filePath: res.tempFilePath, success: onOk, fail: onFail });
        } else if (fileType === 'video') {
          uni.saveVideoToPhotosAlbum({ filePath: res.tempFilePath, success: onOk, fail: onFail });
        } else {
          resolve({ title: '保存失败,未知文件类型', icon: 'none', duration: 3000 });
        }
      },
      fail: () => {
        resolve({ title: '下载失败,请检查网络', icon: 'none', duration: 3000 });
      },
      complete: () => {
        if (waiting) {
          waiting.close();
          waiting = null;
        }
      },
    });

    downloadTask.onProgressUpdate((res) => {
      // #ifdef MP-WEIXIN || MP-KUAISHOU
      uni.showToast({ title: `下载中${res.progress}%`, icon: 'loading', duration: 100000 });
      // #endif
      // #ifdef APP-PLUS
      if (!waiting) {
        waiting = plus.nativeUI.showWaiting(`下载中 ${res.progress}%`);
      } else {
        waiting.setTitle(`下载中 ${res.progress}%`);
      }
      // #endif
    });
  });
}
