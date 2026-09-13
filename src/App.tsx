import { useRef, useState } from 'react';
import { CameraView } from './components/CameraView';
import { DebugPanel } from './components/DebugPanel';
import { RecognitionResult } from './components/RecognitionResult';
import { ScannerOverlay } from './components/ScannerOverlay';
import { ZoomControl } from './components/ZoomControl';
import { visionConfig } from './config/visionConfig';
import { useCamera } from './hooks/useCamera';
import { useOpenCv } from './hooks/useOpenCv';
import { useRecognizer } from './hooks/useRecognizer';

type Screen = 'landing' | 'scanner';

function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const videoRef = useRef<HTMLVideoElement>(null);
  const vision = useOpenCv();
  const camera = useCamera(videoRef);
  const digitalZoom = camera.zoom.mode === 'digital' ? camera.zoom.value : 1;
  const recognizer = useRecognizer({
    active: screen === 'scanner' && camera.status === 'ready',
    videoRef,
    cv: vision.cv,
    references: vision.references,
    digitalZoom,
  });

  const begin = async () => {
    setScreen('scanner');
    recognizer.reset();
    await camera.start();
  };

  const exitScanner = () => {
    camera.stop();
    recognizer.reset();
    setScreen('landing');
  };

  const ready = vision.status === 'ready';
  const loadingText = vision.status === 'loading-opencv' ? '载入 OpenCV 引擎'
    : vision.status === 'loading-references' ? '正在建立本地特征库'
      : '本地识别引擎已就绪';

  if (screen === 'landing') {
    return (
      <main className="landing-shell">
        <div className="grain" />
        <div className="landing-mark" aria-hidden="true"><span>岳</span><i /></div>
        <div className="landing-content">
          <p className="eyebrow">YUELU · DIGITAL ARCHIVE</p>
          <h1><span>千年</span><span>一码</span></h1>
          <div className="title-rule"><i /><span>数字技术 · 文化新生</span><i /></div>
          <p className="intro">以镜头为钥，读取石刻中的时间。</p>
          {vision.status !== 'error' ? (
            <button className="start-button" type="button" onClick={() => void begin()} disabled={!ready}>
              <span>{ready ? '开始扫描' : '正在准备'}</span><i>⌁</i>
            </button>
          ) : (
            <div className="landing-error"><strong>识别引擎加载失败</strong><p>{vision.error}</p><button type="button" onClick={() => location.reload()}>重新加载</button></div>
          )}
          <div className={`engine-state ${ready ? 'is-ready' : ''}`}><i /><span>{loadingText}</span></div>
          {vision.failures.length > 0 && <p className="reference-warning">{vision.failures.length} 个参考目标未能载入，其他目标仍可使用。</p>}
        </div>
        <footer><span>岳麓书院 · 数字国学实验项目</span><span>MMXXVI</span></footer>
      </main>
    );
  }

  const scanning = camera.status === 'ready' && !recognizer.result;
  return (
    <main className="scanner-shell">
      <CameraView
        videoRef={videoRef}
        digitalZoom={digitalZoom}
        zoomValue={camera.zoom.value}
        zoomMin={camera.zoom.min}
        zoomMax={camera.zoom.max}
        onZoomChange={camera.setZoom}
      />
      <div className="camera-shade" />
      <ScannerOverlay result={recognizer.result} scanning={scanning} />

      <header className="scanner-header">
        <button className="icon-button" type="button" onClick={exitScanner} aria-label="返回首页">‹</button>
        <div><span>千年一码</span><small>LOCAL VISION</small></div>
        <span className={`live-badge ${camera.status === 'ready' ? 'active' : ''}`}><i /> LIVE</span>
      </header>

      {camera.status !== 'ready' && (
        <section className="camera-status" aria-live="polite">
          {camera.status === 'requesting' && <><span className="loader"/><h2>正在请求摄像头</h2><p>请在系统提示中选择“允许”。</p></>}
          {(camera.status === 'denied' || camera.status === 'unavailable' || camera.status === 'error') && <><div className="error-glyph">!</div><h2>{camera.status === 'denied' ? '需要摄像头权限' : '摄像头不可用'}</h2><p>{camera.errorMessage}</p><button className="button button-secondary" type="button" onClick={() => void camera.start()}>再次尝试</button></>}
        </section>
      )}

      {scanning && <div className="scan-status"><span className="pulse-dot"/><div><strong>{recognizer.hasScanned ? '正在识别' : '正在读取画面'}</strong><small>{recognizer.hasScanned ? '移动缓慢一些，保持碑刻完整可见' : '正在校准特征点…'}</small></div></div>}
      {camera.status === 'ready' && !recognizer.result && <ZoomControl zoom={camera.zoom} onChange={camera.setZoom} />}
      {recognizer.result && <RecognitionResult result={recognizer.result} onReset={recognizer.reset}/>} 
      {visionConfig.demoMode && <span className="demo-badge">拍摄演示模式</span>}
      <DebugPanel debug={recognizer.debug}/>
    </main>
  );
}

export default App;
