import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-full bg-brand-beige flex items-center justify-center mb-4 text-brand-muted">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-brand-dark mb-1">{title}</h3>
      {description && <p className="text-sm text-brand-muted max-w-sm mb-6">{description}</p>}
      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="primary" size="md">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="primary" size="md" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  );
}
