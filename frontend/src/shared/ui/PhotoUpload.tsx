import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import Icon from './Icon.tsx';
import styles from './PhotoUpload.module.css';

interface PhotoUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  size?: 'normal' | 'compact';
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ value, onChange, size = 'normal' }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await fileToDataUrl(file);
    onChange(dataUrl);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  if (value) {
    return (
      <div className={`${styles.preview} ${size === 'compact' ? styles.previewCompact : ''}`}>
        <div className={styles.previewImageWrap}>
          <img src={value} alt="Preview" className={styles.previewImage} />
          <div className={styles.previewOverlay}>
            <button
              type="button"
              className={styles.previewBtn}
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="swap_horiz" />
            </button>
            <button
              type="button"
              className={`${styles.previewBtn} ${styles.previewBtnDanger}`}
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
            >
              <Icon name="delete_outline" />
            </button>
          </div>
        </div>
        <div className={styles.previewInfo}>
          <span className={styles.previewLabel}>Фото загружено</span>
          <button
            type="button"
            className={styles.previewChange}
            onClick={() => inputRef.current?.click()}
          >
            <Icon name="swap_horiz" />
            Заменить
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleChange}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dropzoneActive : ''} ${size === 'compact' ? styles.dropzoneCompact : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleChange}
      />
      <div className={styles.dropzoneIcon}>
        <Icon name="cloud_upload" />
      </div>
      <p className={styles.dropzoneText}>
        Перетащите фото сюда или <span className={styles.dropzoneLink}>выберите файл</span>
      </p>
      <p className={styles.dropzoneHint}>PNG, JPG, WebP до 5 MB</p>
    </div>
  );
}
