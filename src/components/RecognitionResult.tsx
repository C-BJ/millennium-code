import type { RecognitionResult as Result } from '../types/monument';
import { AudioGuide } from './AudioGuide';

export function RecognitionResult({ result, onReset }: { result: Result; onReset: () => void }) {
  const { monument } = result;
  return (
    <section className="result-card" aria-live="polite">
      <div className="result-kicker"><span /> AI 数字修复完成</div>
      <div className="result-heading"><div><p>{monument.subtitle ?? '岳麓书院数字典藏'}</p><h2>{monument.name}</h2></div><span className="seal">麓</span></div>
      <p className="result-description">{monument.description}</p>
      {(monument.originalText || monument.interpretation) && <div className="text-panel">
        {monument.originalText && <blockquote>{monument.originalText}</blockquote>}
        {monument.interpretation && <p>{monument.interpretation}</p>}
      </div>}
      {(monument.sources?.length || monument.imageAttribution) && <div className="source-list">
        {monument.sources?.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">资料：{source.label}</a>
        ))}
        {monument.imageAttribution && (
          <span>
            参考图：<a href={monument.imageAttribution.sourceUrl} target="_blank" rel="noreferrer">{monument.imageAttribution.author}</a>
            {' · '}
            {monument.imageAttribution.licenseUrl
              ? <a href={monument.imageAttribution.licenseUrl} target="_blank" rel="noreferrer">{monument.imageAttribution.license}</a>
              : monument.imageAttribution.license}
          </span>
        )}
      </div>}
      <div className="result-actions"><AudioGuide monument={monument}/><button className="button button-ghost" type="button" onClick={onReset}>重新扫描</button></div>
    </section>
  );
}
