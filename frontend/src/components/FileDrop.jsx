import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AttachIcon } from './icons';

/**
 * Drop target shared by Capture and Attach notes. Capture takes many images on
 * a dark sheet, Attach takes one file of any type on a white one. Session only:
 * the API has nowhere to put a file, so nothing leaves the browser.
 */

const IMAGE_TYPES =
  'image/jpeg,image/jpg,image/pjpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/x-icon';

export const DROP_KINDS = {
  capture: {
    accept: IMAGE_TYPES,
    multiple: true,
    imagesOnly: true,
    lines: ['Choose or Drop Image', 'or', 'Choose an image to upload'],
  },
  attach: {
    accept: undefined, // any type
    multiple: false,
    imagesOnly: false,
    lines: ['Drag and Drop File', 'or', 'Choose a File to Upload'],
  },
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileDrop({ kind }) {
  const config = DROP_KINDS[kind];
  const [files, setFiles] = useState([]);
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  // object URLs stick around until you revoke them
  useEffect(
    () => () => files.forEach((f) => f.url && URL.revokeObjectURL(f.url)),
    [files]
  );

  const add = (fileList) => {
    let picked = [...fileList];
    if (config.imagesOnly) picked = picked.filter((f) => f.type.startsWith('image/'));
    if (!picked.length) return;
    if (!config.multiple) picked = picked.slice(0, 1);

    const mapped = picked.map((file) => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      name: file.name,
      size: file.size,
      // only images get a preview, everything else shows as a file row
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }));

    setFiles((prev) => (config.multiple ? [...prev, ...mapped] : mapped));
  };

  const remove = (id) =>
    setFiles((prev) => {
      const gone = prev.find((f) => f.id === id);
      if (gone?.url) URL.revokeObjectURL(gone.url);
      return prev.filter((f) => f.id !== id);
    });

  const [head, or, pick] = config.lines;
  const openPicker = () => inputRef.current?.click();

  return (
    <div
      className={clsx(`filedrop filedrop--${kind}`, {
        'filedrop--over': over,
        'filedrop--empty': files.length === 0,
      })}
      // the whole empty area is clickable, not just the prompt line
      onClick={files.length === 0 ? openPicker : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        add(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        accept={config.accept}
        multiple={config.multiple}
        onChange={(e) => {
          add(e.target.files);
          // reset so the same file can be picked again after a removal
          e.target.value = '';
        }}
      />

      {files.length === 0 ? (
        <div className="filedrop__empty">
          <p className="filedrop__line">{head}</p>
          <p className="filedrop__or">{or}</p>
          {/* a real button so it's still reachable by keyboard */}
          <button
            type="button"
            className="filedrop__pick"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            {pick}
          </button>
        </div>
      ) : (
        <div className="filedrop__items">
          {files.map((file) =>
            file.url ? (
              <figure key={file.id} className="filedrop__thumb">
                <img src={file.url} alt={file.name} />
                <button
                  type="button"
                  className="filedrop__remove"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => remove(file.id)}
                >
                  ×
                </button>
              </figure>
            ) : (
              <div key={file.id} className="filedrop__file">
                <AttachIcon />
                <span className="filedrop__name">{file.name}</span>
                <span className="filedrop__size">{formatSize(file.size)}</span>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => remove(file.id)}
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
