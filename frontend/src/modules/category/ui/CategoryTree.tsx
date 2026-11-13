import { useCallback, useRef, useState, type DragEvent } from 'react';
import type { Category } from '../model/category.types';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './CategoryTree.module.css';

interface CategoryTreeProps {
  categories: Category[];
  onReorder: (updates: { id: number; parentId: number | null; order: number }[]) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: number) => void;
}

interface FlatItem {
  category: Category;
  depth: number;
}

const INDENT = 32;

function buildFlat(categories: Category[]): FlatItem[] {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const childrenMap = new Map<number | null, Category[]>();

  for (const cat of sorted) {
    const key = cat.parentId;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(cat);
  }

  const result: FlatItem[] = [];
  function walk(parentId: number | null, depth: number) {
    const children = childrenMap.get(parentId) ?? [];
    for (const cat of children) {
      result.push({ category: cat, depth });
      walk(cat.id, depth + 1);
    }
  }
  walk(null, 0);
  return result;
}

function resolveUpdates(items: FlatItem[]): { id: number; parentId: number | null; order: number }[] {
  const updates: { id: number; parentId: number | null; order: number }[] = [];
  const stack: number[] = [];

  for (let i = 0; i < items.length; i++) {
    const { category, depth } = items[i];
    while (stack.length > depth) stack.pop();
    const parentId = stack.length > 0 ? stack[stack.length - 1] : null;
    updates.push({ id: category.id, parentId, order: i });
    stack.push(category.id);
  }
  return updates;
}

export default function CategoryTree({ categories, onReorder, onEdit, onDelete }: CategoryTreeProps) {
  const flat = buildFlat(categories);
  const dragId = useRef<number | null>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  // drop indicator: position between rows + depth
  const [indicator, setIndicator] = useState<{ beforeIndex: number; depth: number } | null>(null);

  const getDepthFromX = useCallback((clientX: number, rowIndex: number): number => {
    if (!treeRef.current) return 0;
    const rect = treeRef.current.getBoundingClientRect();
    const relX = clientX - rect.left - 12; // subtract base padding
    const rawDepth = Math.max(0, Math.floor(relX / INDENT));

    // Max allowed depth: depth of item above + 1 (can be child of it)
    // or if dropping at top, depth 0
    const aboveIndex = rowIndex - 1;
    if (aboveIndex < 0) return 0;

    // Item above in the NEW position (before the dragged item is removed)
    const aboveItem = flat.filter(f => f.category.id !== dragId.current)[aboveIndex >= 0 ? Math.min(aboveIndex, flat.length - 2) : 0];
    const maxDepth = aboveItem ? aboveItem.depth + 1 : 0;
    return Math.min(rawDepth, maxDepth);
  }, [flat]);

  const handleDragStart = (e: DragEvent, id: number) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
    // Ghost image opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '';
    }
    setIndicator(null);
    dragId.current = null;
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (dragId.current === null) return;
    if (flat[index]?.category.id === dragId.current) return;

    // Determine: drop before or after this row based on mouse Y within the row
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const beforeIndex = e.clientY < midY ? index : index + 1;

    const depth = getDepthFromX(e.clientX, beforeIndex);
    setIndicator({ beforeIndex, depth });
  };

  const handleDragOverTree = (e: DragEvent) => {
    // Allow drop on empty space at the end
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    if (dragId.current === null || !indicator) {
      setIndicator(null);
      return;
    }

    const id = dragId.current;
    const { beforeIndex, depth } = indicator;

    // Remove dragged item and its children
    const dragIdx = flat.findIndex(f => f.category.id === id);
    if (dragIdx === -1) { setIndicator(null); return; }

    // Collect dragged + subtree
    const dragDepth = flat[dragIdx].depth;
    let endIdx = dragIdx + 1;
    while (endIdx < flat.length && flat[endIdx].depth > dragDepth) endIdx++;
    const draggedItems = flat.slice(dragIdx, endIdx);
    const remaining = [...flat.slice(0, dragIdx), ...flat.slice(endIdx)];

    // Adjust depths of dragged subtree
    const depthDelta = depth - draggedItems[0].depth;
    const adjusted = draggedItems.map(item => ({
      ...item,
      depth: item.depth + depthDelta,
    }));

    // Insert at correct position
    const insertAt = beforeIndex > dragIdx ? beforeIndex - draggedItems.length : beforeIndex;
    const clamped = Math.max(0, Math.min(insertAt, remaining.length));
    remaining.splice(clamped, 0, ...adjusted);

    onReorder(resolveUpdates(remaining));
    setIndicator(null);
    dragId.current = null;
  };

  return (
    <div
      ref={treeRef}
      className={styles.tree}
      onDragOver={handleDragOverTree}
      onDrop={handleDrop}
    >
      {flat.map((item, index) => (
        <div key={item.category.id} className={styles.rowWrap}>
          {/* Drop indicator line */}
          {indicator && indicator.beforeIndex === index && (
            <div
              className={styles.dropLine}
              style={{ marginLeft: indicator.depth * INDENT + 12 }}
            >
              <div className={styles.dropDot} />
              <div className={styles.dropBar} />
            </div>
          )}

          <div
            className={styles.row}
            style={{ paddingLeft: item.depth * INDENT + 12 }}
            draggable
            onDragStart={(e) => handleDragStart(e, item.category.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
          >
            <div className={styles.dragHandle}>
              <Icon name="drag_indicator" />
            </div>

            {item.depth > 0 && (
              <div className={styles.nestLine} style={{ left: (item.depth - 1) * INDENT + 28 }} />
            )}

            {item.depth > 0 && (
              <div className={styles.nestIcon}>
                <Icon name="subdirectory_arrow_right" />
              </div>
            )}

            <div className={styles.rowContent}>
              <div className={styles.rowInfo}>
                <span className={styles.rowName}>{item.category.name}</span>
                <code className={styles.rowSlug}>{item.category.slug}</code>
              </div>
              <span className={styles.rowCount}>{item.category.booksCount} книг</span>
            </div>

            <div className={styles.rowActions}>
              <button
                className={styles.actionBtn}
                title="Редактировать"
                onClick={() => onEdit(item.category)}
              >
                <Icon name="edit" />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                title="Удалить"
                onClick={() => onDelete(item.category.id)}
              >
                <Icon name="delete_outline" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Indicator at the end */}
      {indicator && indicator.beforeIndex >= flat.length && (
        <div
          className={styles.dropLine}
          style={{ marginLeft: indicator.depth * INDENT + 12 }}
        >
          <div className={styles.dropDot} />
          <div className={styles.dropBar} />
        </div>
      )}

      {flat.length === 0 && (
        <div className={styles.empty}>Нет категорий</div>
      )}
    </div>
  );
}
