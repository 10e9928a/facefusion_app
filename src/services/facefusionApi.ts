/**
 * facefusion_api(业务后端) HTTP 客户端: 人脸库 / 换脸任务。
 * 鉴权: Bearer JWT(来自 user_hub 登录) + X-App-Key, 由后端经 user_hub verify-user 校验。
 */

import { FACEFUSION_CONFIG, FACEFUSION_ENGINE_CONFIG, HUB_CONFIG, STORAGE_KEYS } from '@/config/hub';

type ApiResponse<T> = { ok: boolean; data?: T; error?: { code?: number | string; message?: string } };

function getToken(): string {
  return uni.getStorageSync(STORAGE_KEYS.token) || '';
}

function ffRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: any,
): Promise<T> {
  const token = getToken();
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Key': HUB_CONFIG.appKey,
    'X-Platform': HUB_CONFIG.platform,
  };
  if (token) header.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${FACEFUSION_CONFIG.baseUrl}${path}`,
      method,
      header,
      ...(body !== undefined ? { data: body } : {}),
      success: (res) => {
        const payload = res.data as ApiResponse<T>;
        if (payload && payload.ok) resolve(payload.data as T);
        else {
          const err: any = new Error(payload?.error?.message || `请求失败(${res.statusCode})`);
          err.statusCode = res.statusCode;
          reject(err);
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '网络错误')),
    });
  });
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
}

// ── 引擎检测 ──

export type DetectedFace = {
  position: number;
  frontal_score: number;
  is_valid_reference: boolean;
  image_url: string;
};

export type ReferenceResult = {
  target: string;
  face_count: number;
  frame_number?: number | null;
  faces: DetectedFace[];
};

function engineUrl(path: string) {
  const base = FACEFUSION_ENGINE_CONFIG.baseUrl.replace(/\/$/, '');
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function parseEngineError(data: any, statusCode: number) {
  const detail = data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
  }
  return data?.message || `检测失败(${statusCode})`;
}

function mapReferenceResult(data: any): ReferenceResult {
  const faces = (data?.faces || []).map((face: DetectedFace) => ({
    ...face,
    image_url: engineUrl(face.image_url),
  }));
  return { ...data, faces };
}

/** 直接上传本地文件到引擎 /reference 检测(推荐, 避免图床 URL 拉取失败)。 */
export function detectTargetFacesByFile(filePath: string): Promise<ReferenceResult> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: engineUrl('/reference'),
      filePath,
      name: 'target',
      formData: { padding: '0.4' },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
          if (res.statusCode >= 400) {
            reject(new Error(parseEngineError(data, res.statusCode)));
            return;
          }
          resolve(mapReferenceResult(data));
        } catch (e: any) {
          reject(new Error(e.message || '检测响应解析失败'));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '检测失败')),
    });
  });
}

export function detectTargetFaces(targetUrl: string): Promise<ReferenceResult> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: engineUrl('/reference/url'),
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { target_url: targetUrl },
      success: (res) => {
        const data = res.data as any;
        if (res.statusCode >= 400) {
          reject(new Error(parseEngineError(data, res.statusCode)));
          return;
        }
        resolve(mapReferenceResult(data));
      },
      fail: (err) => reject(new Error(err.errMsg || '检测失败')),
    });
  });
}

// ── 人脸库 ──

export type Source = { id: number; name: string; url: string; thumbUrl: string; createdAt: string };

export function fetchSources() {
  return ffRequest<Source[]>('GET', '/api/sources');
}

export function addSource(body: { url: string; thumbUrl?: string; name?: string }) {
  return ffRequest<Source>('POST', '/api/sources', body);
}

export function deleteSource(id: number) {
  return ffRequest<{ deleted: number }>('DELETE', `/api/sources/${id}`);
}

// ── 换脸任务 ──

export type Output = {
  id: number;
  type: 'image' | 'video';
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progress: number;
  jobId: string | null;
  sourceUrl: string;
  targetUrl: string;
  resultUrl: string;
  error: string;
  createdAt: string;
};

export function submitFaceSwap(body: {
  type: 'image' | 'video';
  targetUrl: string;
  sourceUrl?: string;
  sourceId?: number;
  options?: Record<string, any>;
}) {
  return ffRequest<Output>('POST', '/api/faceswap', body);
}

export function fetchOutputs(params: { page?: number; size?: number } = {}) {
  const q = buildQuery({ page: params.page ?? 1, size: params.size ?? 20 });
  return ffRequest<{ list: Output[]; total: number }>('GET', `/api/outputs?${q}`);
}

export function deleteOutput(id: number) {
  return ffRequest<{ deleted: number }>('DELETE', `/api/outputs/${id}`);
}
