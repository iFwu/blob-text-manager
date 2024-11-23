import { useState, useCallback } from 'react';

export function useTreeExpansion(selectedItemId?: string) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const normalizePath = useCallback((path: string) => path.replace(/\/+$/, ''), []);

  const isParentOfSelected = useCallback(
    (itemId: string): boolean => {
      if (!selectedItemId) return false;
      const normalizedSelected = normalizePath(selectedItemId);
      const normalizedCurrent = normalizePath(itemId);
      if (normalizedSelected === normalizedCurrent) return true;

      const selected = normalizedSelected.split('/');
      const current = normalizedCurrent.split('/');
      return (
        selected.length > current.length &&
        selected.slice(0, current.length).join('/') === normalizedCurrent
      );
    },
    [normalizePath, selectedItemId]
  );

  const expandToItem = useCallback(
    (itemId: string) => {
      const parts = itemId.split('/');
      let currentPath = '';
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
          newSet.add(currentPath);
        }
        return newSet;
      });
    },
    []
  );

  const toggleExpand = useCallback(
    (itemId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();

      if (isParentOfSelected(itemId)) {
        return;
      }

      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    },
    [isParentOfSelected]
  );

  return {
    expandedItems,
    isParentOfSelected,
    expandToItem,
    toggleExpand,
    normalizePath,
  };
}
