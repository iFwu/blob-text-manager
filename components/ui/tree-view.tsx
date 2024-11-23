'use client';

import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TreeDataItem } from '../../types';

interface TreeViewProps extends React.HTMLAttributes<HTMLDivElement> {
  data: TreeDataItem[];
  selectedItemId?: string;
  expandedItems: Set<string>;
  hoveredItemId?: string | null;
  expandAll?: boolean;
  defaultNodeIcon?: React.ComponentType<{ className?: string }>;
  defaultLeafIcon?: React.ComponentType<{ className?: string }>;
  onItemClick: (item: TreeDataItem) => void;
  onItemHover: (itemId: string | null) => void;
  onToggleExpand: (itemId: string, e?: React.MouseEvent) => void;
  isParentOfSelected: (itemId: string) => boolean;
}

function TreeView({
  data,
  selectedItemId,
  expandedItems,
  hoveredItemId,
  expandAll = false,
  defaultNodeIcon,
  defaultLeafIcon,
  onItemClick,
  onItemHover,
  onToggleExpand,
  isParentOfSelected,
  className,
  ...props
}: TreeViewProps) {
  const renderTreeItem = React.useCallback(
    (item: TreeDataItem, level: number = 0) => {
      const isExpanded = expandAll || expandedItems.has(item.id);
      const hasChildren = (item.children && item.children.length > 0) ?? false;
      const IconComponent = item.icon || (hasChildren ? defaultNodeIcon : defaultLeafIcon);
      const isParentOfSelectedItem = isParentOfSelected(item.id);

      return (
        <div key={item.id} className="relative">
          <div
            className={cn(
              'flex items-center py-1 px-2 cursor-pointer hover:bg-accent/50 rounded-md',
              selectedItemId === item.id && 'bg-accent text-accent-foreground',
              level > 0 && 'ml-4'
            )}
            onClick={() => onItemClick(item)}
            onMouseEnter={() => onItemHover(item.id)}
            onMouseLeave={() => onItemHover(null)}
          >
            {hasChildren && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-4 w-4 p-0 mr-1',
                  isParentOfSelectedItem && 'opacity-30 cursor-not-allowed hover:bg-transparent'
                )}
                onClick={(e) => onToggleExpand(item.id, e)}
                title={
                  isParentOfSelectedItem ? 'Cannot collapse while containing selected item' : undefined
                }
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
    },
    [
      expandAll,
      expandedItems,
      selectedItemId,
      defaultNodeIcon,
      defaultLeafIcon,
      hoveredItemId,
      onItemClick,
      onItemHover,
      onToggleExpand,
      isParentOfSelected,
    ]
  );

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {Array.isArray(data) ? data.map((item) => renderTreeItem(item)) : renderTreeItem(data)}
    </div>
  );
}

export default TreeView;
