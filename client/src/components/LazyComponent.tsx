import { lazy, Suspense, ComponentType } from "react";

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  children?: any;
}

export function LazyComponent({ component, fallback = <div className="animate-pulse bg-muted h-32 rounded-lg" />, ...props }: LazyComponentProps & any) {
  const Component = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
}

export default LazyComponent;