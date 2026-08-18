import { onLoad } from '@dcloudio/uni-app';
import { reactive } from 'vue';
import { detectTargetFaces, detectTargetFacesByFile, submitFaceSwap, type DetectedFace, type Source } from '@/services/facefusionApi';
import { uploadMedia } from '@/services/hubApi';
import { isLoggedIn, refreshCredits, ensureLogin } from '@/stores/auth';
import { navigateTo } from '@/utils';

type TargetKind = 'image' | 'video';
type TargetFile = {
  status: string;
  url: string;
  localPath?: string;
  message?: string;
  name?: string;
  size?: number;
  thumbUrl?: string;
};

const imageExtensions = /\.(jpe?g|png|webp|bmp|gif|heic)(\?.*)?$/i;
const videoExtensions = /\.(mp4|mov|m4v|avi|webm|mkv|3gp)(\?.*)?$/i;

const inferTargetKind = (file: any, fallbackUrl = ''): TargetKind | null => {
  const fileType = String(file?.type || file?.fileType || '').toLowerCase();
  const url = String(file?.url || file?.path || fallbackUrl || '').toLowerCase();
  if (fileType.includes('video') || videoExtensions.test(url)) return 'video';
  if (fileType.includes('image') || imageExtensions.test(url)) return 'image';
  return null;
};

const getFileName = (path = '') => {
  const clean = path.split('?')[0];
  return decodeURIComponent(clean.split('/').pop() || '目标文件');
};

const normalizeTargetFile = (file: any): TargetFile | null => {
  const localPath = file?.tempFilePath || file?.path || '';
  const previewUrl = localPath || file?.url || '';
  if (!previewUrl) return null;
  return {
    status: 'uploading',
    url: '',
    localPath: localPath || undefined,
    message: '上传中',
    name: file?.name || getFileName(previewUrl),
    size: file?.size,
    thumbUrl: file?.thumbUrl || file?.thumbTempFilePath || previewUrl,
  };
};

export const useSwapFace = () => {
  const state = reactive({
    kind: null as TargetKind | null,
    targetList: [] as TargetFile[],
    faces: [] as DetectedFace[],
    selectedFace: null as DetectedFace | null,
    faceCount: 0,
    frameNumber: null as number | null,
    detecting: false,
    detectStatus: '',
    detectStatusType: '' as '' | 'ok' | 'err' | 'busy',
    source: null as Source | null,
    submitting: false,
  });

  onLoad((options: any) => {
    void ensureLogin();
    const optionKind = options?.kind === 'video' || options?.kind === 'image' ? options.kind : null;
    if (options?.target) {
      const targetUrl = decodeURIComponent(options.target);
      state.kind = optionKind ?? inferTargetKind(null, targetUrl);
      state.targetList = [{ status: 'success', url: targetUrl, name: getFileName(targetUrl), thumbUrl: targetUrl }];
    } else if (optionKind) {
      state.kind = optionKind;
    }
  });

  const selectSource = (payload: any) => {
    state.source = payload?.source ?? null;
  };

  const uploadTargetFile = async (file: any) => {
    const target = normalizeTargetFile(file);
    if (!target) return;
    state.faces = [];
    state.selectedFace = null;
    state.faceCount = 0;
    state.frameNumber = null;
    state.detectStatus = '';
    state.detectStatusType = '';
    state.kind = inferTargetKind(file, target.localPath || target.thumbUrl || '');
    state.targetList = [target];
    try {
      const uploadPath = target.localPath || target.thumbUrl || '';
      const up = await uploadMedia(uploadPath);
      state.kind = state.kind ?? inferTargetKind(null, up.url);
      state.targetList = [{
        ...target,
        status: 'success',
        message: '',
        url: up.url,
      }];
    } catch (e: any) {
      state.targetList = [];
      uni.showToast({ title: e.message || '上传失败', icon: 'none' });
    }
  };

  const chooseTarget = async () => {
    if (!isLoggedIn()) {
      const ok = await ensureLogin();
      if (!ok) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => navigateTo('/pages/user/auth/login'), 800);
        return;
      }
    }
    const chosen: any = await new Promise((resolve) => {
      uni.chooseMedia({
        count: 1,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
        success: resolve,
        fail: () => resolve(null),
      });
    });
    const file = chosen?.tempFiles?.[0];
    if (!file) return;
    await uploadTargetFile({ ...file, fileType: file.fileType || chosen.type });
  };

  const selectFace = (face: DetectedFace) => {
    state.selectedFace = face;
  };

  const detectTarget = async () => {
    const target = state.targetList[0];
    if (!target || target.status !== 'success') {
      uni.showToast({ title: '请先上传目标文件', icon: 'none' });
      return;
    }
    if (!target.localPath && !target.url.startsWith('http')) {
      uni.showToast({ title: '目标文件未就绪', icon: 'none' });
      return;
    }
    state.detecting = true;
    state.detectStatus = '上传并检测人脸中…';
    state.detectStatusType = 'busy';
    try {
      const result = target.localPath
        ? await detectTargetFacesByFile(target.localPath)
        : await detectTargetFaces(target.url);
      state.faces = result.faces || [];
      state.faceCount = result.face_count || state.faces.length;
      state.frameNumber = result.frame_number ?? null;
      state.selectedFace = state.faces[0] || null;
      state.detectStatus = `检测完成，发现 ${state.faceCount} 张人脸`;
      state.detectStatusType = 'ok';
    } catch (e: any) {
      state.faces = [];
      state.selectedFace = null;
      state.faceCount = 0;
      state.frameNumber = null;
      state.detectStatus = `错误：${e.message || '检测失败'}`;
      state.detectStatusType = 'err';
    } finally {
      state.detecting = false;
    }
  };

  const validate = (): boolean => {
    const target = state.targetList[0];
    if (!target || target.status !== 'success' || !target.url.startsWith('http')) {
      uni.showToast({ title: '请上传并等待模板上传完成', icon: 'none' });
      return false;
    }
    if (!state.source?.url) {
      uni.showToast({ title: '请选择或上传人脸', icon: 'none' });
      return false;
    }
    if (!state.selectedFace) {
      uni.showToast({ title: '请先检测并选择目标人脸', icon: 'none' });
      return false;
    }
    if (!state.kind) {
      uni.showToast({ title: '无法识别目标类型,请重新上传', icon: 'none' });
      return false;
    }
    return true;
  };

  const generate = async () => {
    if (!isLoggedIn()) {
      const ok = await ensureLogin();
      if (!ok) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => navigateTo('/pages/user/auth/login'), 800);
        return;
      }
    }
    if (!validate()) return;
    state.submitting = true;
    try {
      await submitFaceSwap({
        type: state.kind!,
        targetUrl: state.targetList[0].url,
        sourceUrl: state.source!.url,
        options: {
          face_selector_mode: 'reference',
          reference_face_position: state.selectedFace!.position,
          target_face_count: state.faceCount,
        },
      });
      refreshCredits();
      uni.showToast({ title: '已提交,正在生成', icon: 'none' });
      setTimeout(() => navigateTo('/pages/user/tasks/history'), 600);
    } catch (e: any) {
      const msg = e.message || '提交失败';
      uni.showToast({ title: msg, icon: 'none' });
      if (e.statusCode === 402 || msg.includes('积分不足')) {
        setTimeout(() => navigateTo('/pages/user/points/redeem'), 900);
      }
    } finally {
      state.submitting = false;
    }
  };

  return { state, selectSource, chooseTarget, detectTarget, selectFace, generate };
};
