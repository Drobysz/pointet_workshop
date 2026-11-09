import {
  ChartNoAxesCombined,
  ClipboardList,
  Inbox,
  Package,
  ShieldCheck,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavigationKey =
  | "dashboard"
  | "users"
  | "orders"
  | "preorders"
  | "sellerApplications"
  | "goods"
  | "admins"
  | "markers";

export interface NavigationItem {
  /** Key of the label below the `navigation` namespace. */
  key: NavigationKey;
  href: string;
  icon: LucideIcon;
}

/** Admin sections, shared by the desktop sidebar and the mobile drawer. */
export const navigation: NavigationItem[] = [
  { key: "dashboard", href: "/dashboard", icon: ChartNoAxesCombined },
  { key: "orders", href: "/orders", icon: ShoppingBag },
  { key: "preorders", href: "/preorders", icon: ClipboardList },
  { key: "goods", href: "/goods", icon: Package },
  { key: "markers", href: "/markers", icon: Tags },
  { key: "users", href: "/users", icon: Users },
  { key: "sellerApplications", href: "/seller-applications", icon: Inbox },
  { key: "admins", href: "/admins", icon: ShieldCheck },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
