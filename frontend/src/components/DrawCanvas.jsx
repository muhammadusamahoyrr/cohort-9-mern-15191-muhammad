import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { RedoIcon, RotateIcon, UndoIcon } from './icons';

const TOOLS = [
  { key: 'pencil', label: 'Pencil', width: 40, size: 1.5, alpha: 0.75, cap: 'round' },
  { key: 'pen', label: 'Pen', width: 40, size: 3, alpha: 1, cap: 'round' },
  { key: 'highlight', label: 'Highlighter', width: 60, size: 18, alpha: 0.32, cap: 'butt' },
  { key: 'erase', label: 'Eraser', width: 60, size: 24, alpha: 1, cap: 'round' },
];

const SPEC = Object.fromEntries(TOOLS.map((t) => [t.key, t]));
const COLORS = ['#212121', '#e42527', '#1e7ae4', '#12a150', '#f5a623'];

const DEFAULT_INK = {
  pencil: '#888888',
  pen: '#212121',
  highlight: '#12a150',
  erase: '#888888',
};

export default function DrawCanvas() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const drawing = useRef(false);

  const [tool, setTool] = useState('pencil');
  const [inks, setInks] = useState(DEFAULT_INK);
  const color = inks[tool];
  const [pickerOpen, setPickerOpen] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [undone, setUndone] = useState([]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    strokes.forEach((stroke) => {
      const spec = SPEC[stroke.tool];
      ctx.globalCompositeOperation = stroke.tool === 'erase' ? 'destination-out' : 'source-over';
      ctx.globalAlpha = spec.alpha;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = spec.size;
      ctx.lineCap = spec.cap;
      ctx.lineJoin = 'round';

      ctx.beginPath();
      stroke.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      if (stroke.points.length === 1) ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y);
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [strokes]);

  useLayoutEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = wrap.clientWidth * dpr;
      canvas.height = wrap.clientHeight * dpr;
      canvas.style.width = `${wrap.clientWidth}px`;
      canvas.style.height = `${wrap.clientHeight}px`;
      paint();
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (wrapRef.current) observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(paint, [paint]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = () => setPickerOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [pickerOpen]);

  const pointFrom = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    setUndone([]);
    setStrokes((prev) => [...prev, { tool, color, points: [pointFrom(e)] }]);
  };

  const move = (e) => {
    if (!drawing.current) return;
    const point = pointFrom(e);
    setStrokes((prev) => {
      const next = prev.slice();
      const last = next[next.length - 1];
      next[next.length - 1] = { ...last, points: [...last.points, point] };
      return next;
    });
  };

  const end = () => {
    drawing.current = false;
  };

  const undo = () => {
    if (!strokes.length) return;
    setUndone((prev) => [...prev, strokes[strokes.length - 1]]);
    setStrokes((prev) => prev.slice(0, -1));
  };

  const redo = () => {
    if (!undone.length) return;
    setStrokes((prev) => [...prev, undone[undone.length - 1]]);
    setUndone((prev) => prev.slice(0, -1));
  };

  const pick = (key) => {
    if (key === tool && key !== 'erase') setPickerOpen((v) => !v);
    else {
      setTool(key);
      setPickerOpen(false);
    }
  };

  return (
    <div className="draw">
      <div className="draw__surface" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className={`draw__canvas draw__canvas--${tool}`}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label="Drawing canvas"
        />
      </div>

      <div className="draw__tray">
        <button type="button" className="iconbtn" aria-label="Undo" disabled={!strokes.length} onClick={undo}>
          <UndoIcon />
        </button>
        <button type="button" className="iconbtn" aria-label="Redo" disabled={!undone.length} onClick={redo}>
          <RedoIcon />
        </button>

        <div className="draw__implements">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={clsx(`pentool pentool--${t.key}`, tool === t.key && 'pentool--on')}
              style={{ '--pen-w': `${t.width}px`, '--pen-ink': inks[t.key] }}
              aria-label={t.label}
              aria-pressed={tool === t.key}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => pick(t.key)}
            >
              <span className="pentool__body" />
              <span className="visually-hidden">{t.label}</span>
            </button>
          ))}

          {pickerOpen && (
            <div className="draw__colors" role="dialog" aria-label="Stroke colour">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={clsx('swatch', c === color && 'swatch--on')}
                  style={{ background: c }}
                  aria-label={c}
                  aria-pressed={c === color}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setInks((prev) => ({ ...prev, [tool]: c }));
                    setPickerOpen(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button type="button" className="iconbtn" aria-label="Rotate" disabled>
          <RotateIcon />
        </button>
      </div>
    </div>
  );
}

