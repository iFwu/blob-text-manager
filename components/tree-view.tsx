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
  initialSelectedItemId: string | undefined;
  onSelectChange?: (item: TreeDataItem | undefined) => void;
  expandAll?: boolean;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
}

export function TreeView({
  data,
  initialSelectedItemId,
  onSelectChange,
  expandAll = false,
  defaultNodeIcon,
  defaultLeafIcon,
  className,
  ...props
}: TreeViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(initialSelectedItemId);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  const handleSelectChange = (item: TreeDataItem) => {
    setSelectedItemId(item.id);
    onSelectChange?.(item);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderTreeItem = (item: TreeDataItem, level: number = 0) => {
    const isExpanded = expandAll || expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const IconComponent = item.icon || (hasChildren ? defaultNodeIcon : defaultLeafIcon);

    return (
      <div key={item.id} className="relative">
        <div
          className={cn(
            'flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-md',
            selectedItemId === item.id && 'bg-accent text-accent-foreground',
            level > 0 && 'ml-4'
          )}
          onClick={() => {
            handleSelectChange(item);
            item.onClick?.();
            if (hasChildren) {
              toggleExpand(item.id);
            }
          }}
          onMouseEnter={() => setHoveredItemId(item.id)}
          onMouseLeave={() => setHoveredItemId(null)}
        >
          {hasChildren && (
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0 mr-1">
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

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {Array.isArray(data) ? data.map((item) => renderTreeItem(item)) : renderTreeItem(data)}
    </div>
  );
}
