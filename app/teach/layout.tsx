import { archivo } from "@/lib/fonts/area";
import { cn } from "@/lib/utils";

/**
 * Only the tutor area's type (see `.scope-area`): Archivo, as it launched, so
 * the public site's redesign does not reach the tutors' tools. It sits above
 * the error boundary, so an error page keeps the same face.
 */
export default function TeachRootLayout({ children }: LayoutProps<"/teach">) {
  return <div className={cn(archivo.variable, "scope-area contents")}>{children}</div>;
}
