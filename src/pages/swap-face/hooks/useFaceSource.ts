import { onShow } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { addSource, deleteSource, fetchSources, type Source } from '@/services/facefusionApi';
import { uploadMedia } from '@/services/hubApi';

const MAX_SOURCE_COUNT = 10;

export const useFaceSource = () => {
  const state = reactive({
    selectedIndex: 0,
    sources: [] as Source[],
    uploading: false,
    longTimer: null as any,
  });

  const isSelected = (index: number) => state.selectedIndex === index;

  const load = async () => {
    try {
      state.sources = await fetchSources();
    } catch (e: any) {
      // 未登录等
    }
  };

  const uploadFace = async () => {
    if (state.sources.length >= MAX_SOURCE_COUNT) {
      uni.showToast({ title: `源脸最多保存 ${MAX_SOURCE_COUNT} 张`, icon: 'none' });
      return;
    }
    const chosen: any = await uni.chooseImage({ count: 1, sizeType: ['compressed'] }).catch(() => null);
    const filePath = chosen?.tempFilePaths?.[0];
    if (!filePath) return;
    state.uploading = true;
    try {
      const up = await uploadMedia(filePath);
      await addSource({ url: up.url });
      await load();
      state.selectedIndex = 0;
    } catch (e: any) {
      uni.showToast({ title: e.message || '上传失败', icon: 'none' });
    } finally {
      state.uploading = false;
    }
  };

  const longPress = (id: number) => {
    uni.showModal({
      title: '温馨提示',
      content: '确定要删除这张人脸吗?',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await deleteSource(id);
          await load();
          if (state.selectedIndex >= state.sources.length) state.selectedIndex = 0;
        } catch (e: any) {
          uni.showToast({ title: e.message || '删除失败', icon: 'none' });
        }
      },
    });
  };

  const touchStart = (id: number) => {
    state.longTimer = setTimeout(() => longPress(id), 800);
  };
  const touchEnd = () => clearTimeout(state.longTimer);

  onShow(() => load());

  return { state, isSelected, uploadFace, touchStart, touchEnd, load };
};
