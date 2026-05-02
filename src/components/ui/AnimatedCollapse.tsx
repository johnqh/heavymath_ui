import type { ReactNode } from 'react';

interface AnimatedCollapseProps {
  open: boolean;
  children: ReactNode;
  duration?: number;
}

export function AnimatedCollapse({ open, children, duration = 200 }: AnimatedCollapseProps) {
  return (
    <div
      className="grid overflow-hidden"
      style={{
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: `grid-template-rows ${duration}ms ease-in-out`,
      }}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
}
