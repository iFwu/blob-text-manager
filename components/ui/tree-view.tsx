'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TreeDataItem } from '@/types';

interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TreeDataItem[];
  selectedItemId?: string | null;
  onSelectChange?: (item: TreeDataItem | undefined) => void;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
}

export function TreeView({
  data,
  selectedItemId: controlledSelectedItemId,
  onSelectChange,
  defaultNodeIcon,
  defaultLeafIcon,
  className,
  ...props
}: TreeViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const expandedItemsRef = useRef<Set<string>>(expandedItems);
  expandedItemsRef.current = expandedItems;

  useEffect(() => {
    if (controlledSelectedItemId === null) {
      setSelectedItemId(null);
    }
  }, [controlledSelectedItemId]);

  const activeItemId = controlledSelectedItemId ?? selectedItemId;

  const updateExpandedItems = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      const parts = itemId.split('/');
      let currentPath = '';
      for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i] === '') continue;
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        newSet.add(currentPath);
      }
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (activeItemId) {
      updateExpandedItems(activeItemId);
    }
  }, [activeItemId, updateExpandedItems]);

  const handleSelectChange = useCallback(
    (item: TreeDataItem) => {
      setSelectedItemId(item.id);
      onSelectChange?.(item);
      updateExpandedItems(item.id);
    },
    [onSelectChange, updateExpandedItems]
  );

  const handleItemClick = (item: TreeDataItem) => {
    if (Array.isArray(item.children)) {
      toggleExpand(item.id);
      return;
    }
    
    handleSelectChange(item);
    item.onClick?.();
  };

  const renderTreeItem = (
    item: TreeDataItem, 
    level: number = 0, 
    isLastItem: boolean = false,
    parentIsLast: boolean[] = []
  ) => {
    const isExpanded = expandedItemsRef.current.has(item.id);
    const isDirectory = Array.isArray(item.children);
    // empty directories are treated as nodes
    const IconComponent = item.icon || (isDirectory ? defaultNodeIcon : defaultLeafIcon);

    return (
      <div key={item.id} className="relative group">
        {/* Indent guides */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0">
            {Array.from({ length: level }).map((_, i) => {
              const isParentLast = parentIsLast[i];
              // Don't render the line for last items of last parents
              if (isParentLast) return null;
              
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute w-px bg-border",
                    "left-[12px]"
                  )}
                  style={{
                    left: `${(i * 16) + 16}px`,
                    top: 0,
                    bottom: 0,
                  }}
                />
              );
            })}
          </div>
        )}

        <div
          className={cn(
            'flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-md relative',
            activeItemId === item.id && 'bg-accent text-accent-foreground'
          )}
          style={{
            marginLeft: level > 0 ? `${level * 16}px` : undefined,
          }}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          <div className="w-4 mr-1 flex-shrink-0">
            {isDirectory && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={(e) => toggleExpand(item.id, e)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          {IconComponent && (
            <IconComponent
              className={cn(
                'h-4 w-4 mr-2 shrink-0',
                isExpanded && item.openIcon ? 'hidden' : 'inline-block'
              )}
            />
          )}
          {isExpanded && item.openIcon && <item.openIcon className="h-4 w-4 mr-2 shrink-0" />}
          <span className="text-sm truncate flex-grow">{item.name}</span>
          <div className="w-6 h-6 flex items-center justify-center">
            {item.actions && hoveredItemId === item.id && item.actions}
          </div>
        </div>
        {isDirectory && isExpanded && (
          <div>
            {item.children?.map((child, index) => 
              renderTreeItem(
                child,
                level + 1,
                index === (item.children?.length || 0) - 1,
                [...parentIsLast, isLastItem]
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const toggleExpand = useCallback((itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {data.map((item, index) => renderTreeItem(item, 0, index === data.length - 1, []))}
    </div>
  );
}
