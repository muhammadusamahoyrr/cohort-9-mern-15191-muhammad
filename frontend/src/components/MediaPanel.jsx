import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Recording body shared by Audio and Video notes. The device is only requested
 * once recording starts, so opening the panel doesn't fire a permission
 * prompt. Session only, the clip lives in the browser until reload.
 *
 * TODO: layout here is a first pass, unlike the other note types.
 */

const KINDS = {
  audio: { video: false, idle: 'Tap to record audio', denied: 'Microphone access is blocked' },
  video: { video: true, idle: 'Tap to record video', denied: 'Camera access is blocked' },
};

const clock = (ms) => {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function MediaPanel({ kind }) {
  const config = KINDS[kind];

  const [status, setStatus] = useState('idle'); // idle | recording | recorded | denied
  const [elapsed, setElapsed] = useState(0);
  const [clip, setClip] = useState(null);
  const [levels, setLevels] = useState(() => new Array(28).fill(0.05));

  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const rafRef = useRef(0);
  const previewRef = useRef(null);

  // worth being careful here, a track left running keeps the camera or mic
  // indicator lit
  const release = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => {
    release();
    if (clip) URL.revokeObjectURL(clip);
  }, [release, clip]);

  useEffect(() => {
    if (status !== 'recording') return;
    const started = Date.now();
    const id = setInterval(() => setElapsed(Date.now() - started), 200);
    return () => clearInterval(id);
  }, [status]);

  // drives the level bars off the real signal instead of faking motion
  const meter = (stream) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      setLevels((prev) => prev.map((_, i) => Math.max(0.05, data[i % data.length] / 255)));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return ctx;
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: config.video ? { facingMode: 'user' } : false,
      });
      streamRef.current = stream;

      if (config.video && previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.play?.().catch(() => {});
      } else {
        meter(stream);
      }

      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        setClip(URL.createObjectURL(blob));
        setStatus('recorded');
        release();
      };
      recorderRef.current = recorder;
      recorder.start();

      setElapsed(0);
      setStatus('recording');
    } catch {
      // denied, dismissed, or no device at all
      setStatus('denied');
    }
  };

  const stop = () => recorderRef.current?.stop();

  const reset = () => {
    if (clip) URL.revokeObjectURL(clip);
    setClip(null);
    setElapsed(0);
    setStatus('idle');
  };

  return (
    <div className={`media media--${kind}`}>
      {config.video && (
        <video
          ref={previewRef}
          className="media__preview"
          muted
          playsInline
          hidden={status !== 'recording'}
        />
      )}

      {status === 'recorded' && clip && (
        <div className="media__playback">
          {config.video ? (
            <video className="media__preview" src={clip} controls />
          ) : (
            <audio src={clip} controls />
          )}
        </div>
      )}

      {status !== 'recording' && status !== 'recorded' && (
        <div className="media__idle">
          {kind === 'audio' && (
            <div className="media__bars" aria-hidden="true">
              {levels.map((_, i) => (
                <span key={i} style={{ '--level': 0.08 }} />
              ))}
            </div>
          )}
          <p className="media__hint">{status === 'denied' ? config.denied : config.idle}</p>
        </div>
      )}

      {status === 'recording' && kind === 'audio' && (
        <div className="media__bars media__bars--live" aria-hidden="true">
          {levels.map((level, i) => (
            <span key={i} style={{ '--level': level }} />
          ))}
        </div>
      )}

      <div className="media__controls">
        {status === 'recording' && <span className="media__clock">{clock(elapsed)}</span>}

        {status === 'recording' ? (
          <button type="button" className="recbtn recbtn--stop" aria-label="Stop recording" onClick={stop}>
            <span />
          </button>
        ) : status === 'recorded' ? (
          <button type="button" className="btn btn--secondary btn--small" onClick={reset}>
            Record again
          </button>
        ) : (
          <button
            type="button"
            className="recbtn"
            aria-label={kind === 'audio' ? 'Start recording audio' : 'Start recording video'}
            onClick={start}
          >
            <span />
          </button>
        )}
      </div>
    </div>
  );
}
