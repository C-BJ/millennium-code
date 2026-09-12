import { useEffect, useRef, useState } from 'react';
import type { Monument } from '../types/monument';

export function AudioGuide({ monument }: { monument: Monument }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => { speechSynthesis?.cancel(); }, [monument.id]);

  const toggle = async () => {
    if (monument.audio && audioRef.current) {
      if (audioRef.current.paused) await audioRef.current.play(); else audioRef.current.pause();
      return;
    }
    if (!('speechSynthesis' in window)) return;
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return; }
    const speech = new SpeechSynthesisUtterance(`${monument.name}。${monument.description}${monument.interpretation ?? ''}`);
    speech.lang = 'zh-CN'; speech.rate = 0.92;
    speech.onend = () => setPlaying(false); speech.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(speech); setPlaying(true);
  };

  return (
    <>
      {monument.audio && <audio ref={audioRef} src={monument.audio} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />}
      <button className="button button-secondary" type="button" onClick={() => void toggle()}>
        <span className="audio-icon">{playing ? 'Ⅱ' : '▶'}</span>{playing ? '暂停讲解' : '语音讲解'}
      </button>
    </>
  );
}
