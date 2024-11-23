'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface TreeDataItem {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  selectedIcon?: React.ComponentType<{ className?: string }>;
  openIcon?: React.ComponentType<{ className?: string }>;
  children?: TreeDataItem[];
  actions?: React.ReactNode;
  onClick?: () => void;
}

interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TreeDataItem[] | TreeDataItem;
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

  // 如果提供了 selectedItemId，则使用受控模式
  const selectedItemId = controlledSelectedItemId ?? uncontrolledSelectedItemId;

  const handleSelectChange = (item: TreeDataItem) => {
    setUncontrolledSelectedItemId(item.id);
    onSelectChange?.(item);

    // 如果是文件夹，确保它被展开
    if (item.children) {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        newSet.add(item.id);
        return newSet;
      });
    }

    // 确保所有父级目录都展开
    const parts = item.id.split('/');
    let currentPath = '';
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        newSet.add(currentPath);
      }
      return newSet;
    });
  };

  const toggleExpand = (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // 阻止事件冒泡，防止触发选择

    // 检查是否是当前选中文件的父级目录
    if (selectedItemId) {
      const selectedParts = selectedItemId.split('/');
      const currentParts = itemId.split('/');
      const isParentOfSelected = 
        selectedParts.length > currentParts.length && 
        selectedParts.slice(0, currentParts.length).join('/') === itemId;

      // 如果是父级目录，不允许折叠
      if (isParentOfSelected) {
        return;
      }
    }

    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        // 如果是手动折叠，记录这个状态
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderTreeItem = (item: TreeDataItem, level: number = 0) => {
    // 如果当前项是选中项的父级，也要保持展开
    const shouldKeepExpanded = (itemId: string): boolean => {
      if (selectedItemId === itemId) return true;
      const selected = selectedItemId?.split('/') || [];
      const current = itemId.split('/');
      return (
        selected.length > current.length && selected.slice(0, current.length).join('/') === itemId
      );
    };

    const isExpanded = expandAll || expandedItems.has(item.id) || shouldKeepExpanded(item.id);
    const hasChildren = (item.children && item.children.length > 0) ?? false;
    const IconComponent = item.icon || (hasChildren ? defaultNodeIcon : defaultLeafIcon);

    // 检查是否是当前选中文件的父级目录
    const isParentOfSelected = selectedItemId ? (
      (() => {
        const selectedParts = selectedItemId.split('/');
        const currentParts = item.id.split('/');
        return (
          selectedParts.length > currentParts.length && 
          selectedParts.slice(0, currentParts.length).join('/') === item.id
        );
      })()
    ) : false;

    return (
      <div key={item.id} className="relative">
        <div
          className={cn(
            'flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-md',
            selectedItemId === item.id && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-4'
          )}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-4 w-4 p-0 mr-1',
                isParentOfSelected && 'opacity-30 cursor-not-allowed hover:bg-transparent'
              )}
              onClick={(e) => toggleExpand(item.id, e)}
              title={isParentOfSelected ? "Cannot collapse while containing selected item" : undefined}
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
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {item.children!.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleItemClick = (item: TreeDataItem) => {
    handleSelectChange(item);
    item.onClick?.();
  };

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {Array.isArray(data) ? data.map((item) => renderTreeItem(item)) : renderTreeItem(data)}
    </div>
  );
}
