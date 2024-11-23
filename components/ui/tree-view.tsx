'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TreeDataItem } from '@/types';

interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TreeDataItem[];
  initialSelectedItemId?: string | undefined;
  selectedItemId?: string | undefined;
  onSelectChange?: (item: TreeDataItem) => void;
  expandAll?: boolean;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
}

export function TreeView({
  data,
  initialSelectedItemId,
  selectedItemId: controlledSelectedItemId,
  onSelectChange,
  expandAll = false,
  defaultNodeIcon,
  defaultLeafIcon,
  className,
  ...props
}: TreeViewProps) {
  const [uncontrolledSelectedItemId, setUncontrolledSelectedItemId] = useState<string | undefined>(
    initialSelectedItemId
  );
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const expandedItemsRef = useRef<Set<string>>(expandedItems);
  expandedItemsRef.current = expandedItems;

  const selectedItemId = controlledSelectedItemId ?? uncontrolledSelectedItemId;

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

  const handleSelectChange = useCallback(
    (item: TreeDataItem) => {
      setUncontrolledSelectedItemId(item.id);
      onSelectChange?.(item);
      updateExpandedItems(item.id);
    },
    [onSelectChange, updateExpandedItems]
  );

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

  useEffect(() => {
    if (selectedItemId) {
      updateExpandedItems(selectedItemId);
    }
  }, [selectedItemId, updateExpandedItems]);

  const renderTreeItem = (item: TreeDataItem, level: number = 0) => {
    const isExpanded = expandAll || expandedItemsRef.current.has(item.id);
    const isDirectory = item.children !== undefined;
    const IconComponent = item.icon || (isDirectory ? defaultNodeIcon : defaultLeafIcon);

    return (
      <div key={item.id} className="relative">
        <div
          className={cn(
            'flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-md',
            'relative',
            selectedItemId === item.id && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-6'
          )}
          style={{
            backgroundImage: level > 0 ? 'linear-gradient(to right, rgb(203 213 225 / 0.5) 1px, transparent 1px)' : 'none',
            backgroundPosition: '0 50%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1px 100%'
          }}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {isDirectory && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 mr-1"
              onClick={(e) => toggleExpand(item.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
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
          <div className="ml-2 relative">
            {item.children?.map((child) => renderTreeItem(child, level + 1)) || null}
          </div>
        )}
      </div>
    );
  };

  const handleItemClick = (item: TreeDataItem) => {
    // 如果是文件夹，只处理展开/折叠
    if (item.children && item.children.length > 0) {
      toggleExpand(item.id);
      return;
    }
    
    // 如果是文件，处理选中
    handleSelectChange(item);
    item.onClick?.();
  };

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {data.map((item) => renderTreeItem(item))}
    </div>
  );
}
