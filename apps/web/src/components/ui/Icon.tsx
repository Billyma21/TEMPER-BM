import {
  Boxes,
  Clock,
  Cog,
  Factory,
  Gamepad2,
  Handshake,
  HardHat,
  IdCard,
  Landmark,
  LineChart,
  type LucideIcon,
  MessageSquare,
  Network,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Boxes,
  Clock,
  Cog,
  Factory,
  Gamepad2,
  Handshake,
  HardHat,
  IdCard,
  Landmark,
  LineChart,
  MessageSquare,
  Network,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wrench,
};

export function ModuleIcon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Boxes;
  return <I className={className} aria-hidden />;
}
