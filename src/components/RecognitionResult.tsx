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
      <div className="result-actions"><AudioGuide monument={monument}/><button className="button button-ghost" type="button" onClick={onReset}>重新扫描</button></div>
    </section>
  );
}
