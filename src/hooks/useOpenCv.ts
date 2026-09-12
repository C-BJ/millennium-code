import { useEffect, useState } from 'react';
import { monuments } from '../data/monuments';
import { loadOpenCv } from '../vision/opencvLoader';
import type { OpenCv } from '../vision/opencvTypes';
import { buildReferenceCache, releaseReferenceCache, type ReferenceFeatures, type ReferenceLoadFailure } from '../vision/referenceCache';

export type VisionLoadStatus = 'loading-opencv' | 'loading-references' | 'ready' | 'error';

export function useOpenCv() {
  const [status, setStatus] = useState<VisionLoadStatus>('loading-opencv');
  const [cv, setCv] = useState<OpenCv>();
  const [references, setReferences] = useState<ReferenceFeatures[]>([]);
  const [failures, setFailures] = useState<ReferenceLoadFailure[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let loadedReferences: ReferenceFeatures[] = [];
    void loadOpenCv().then(async (runtime) => {
      if (cancelled) return;
      setCv(runtime);
      setStatus('loading-references');
      const cache = await buildReferenceCache(runtime, monuments);
      loadedReferences = cache.references;
      if (cancelled) { releaseReferenceCache(loadedReferences); return; }
      setReferences(cache.references);
      setFailures(cache.failures);
      if (cache.references.length === 0) throw new Error('没有可用的参考图特征，请检查 public/reference。');
      setStatus('ready');
    }).catch((reason: unknown) => {
      if (!cancelled) {
        setError(reason instanceof Error ? reason.message : '视觉引擎初始化失败');
        setStatus('error');
      }
    });
    return () => { cancelled = true; releaseReferenceCache(loadedReferences); };
  }, []);

  return { status, cv, references, failures, error };
}
