
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Images,
  ChevronRight,
  LogOut,
  Menu,
  X,
  HelpCircle,
  MapPin,
  Award,
  Info,
  UserCircle,
  MessageSquare,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error signing you out",
      });
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      exact: true
    },
    {
      name: "News Management",
      path: "/admin/news",
      icon: FileText,
      exact: false
    },
    {
      name: "Gallery Management",
      path: "/admin/gallery",
      icon: Images,
      exact: false
    },
    // FAQ Management (accessible to both editors and super-admin)
    {
      name: "FAQ Management",
      path: "/admin/faqs",
      icon: HelpCircle,
      exact: false
    },
    // Only show Partners Management to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "Partners & Sponsors",
        path: "/admin/partners",
        icon: Award,
        exact: false
      }
    ] : []),
    // Only show Locations Management to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "Office Locations",
        path: "/admin/locations",
        icon: MapPin,
        exact: false
      }
    ] : []),

    // Only show About Page Management to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "About Page",
        path: "/admin/about",
        icon: Info,
        exact: false
      }
    ] : []),

    // Only show Team Management to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "Team Members",
        path: "/admin/team",
        icon: UserCircle,
        exact: false
      }
    ] : []),

    // Only show Contact Messages to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "Contact Messages",
        path: "/admin/contact",
        icon: MessageSquare,
        exact: false
      }
    ] : []),

    // Only show Subscribers to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "Newsletter Subscribers",
        path: "/admin/subscribers",
        icon: Mail,
        exact: false
      }
    ] : []),

    // Only show Users section to super-admin
    ...(user?.role === "super-admin" ? [
      {
        name: "User Management",
        path: "/admin/users",
        icon: Users,
        exact: false
      }
    ] : [])
  ];

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-white shadow-md"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
        >
          {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-full max-w-[260px] transform bg-white border-r border-gray-200 p-5 pb-3 transition-transform duration-200 ease-in-out lg:fixed lg:translate-x-0 lg:min-h-screen lg:w-[260px] lg:flex-shrink-0",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-screen overflow-y-auto">
          <div className="mb-5">
            <h1 className="font-bold text-xl text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage your content</p>
          </div>

          <nav className="space-y-0.5 flex-grow overflow-y-auto max-h-[calc(100vh-180px)]">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
                onClick={() => setIsMobileNavOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-60" />
              </NavLink>
            ))}
          </nav>

          <div className="pt-3 border-t border-gray-200 mt-auto sticky bottom-9 bg-white pb-0">
            <div className="mb-2">
              <p className="text-primary font-semibold text-sm">{user?.username}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="bg-gray-50 px-4 pb-12 pt-16 lg:pt-6 flex-1 overflow-auto ml-0 lg:ml-[260px]">
        <Outlet />
      </main>

      {/* Mobile nav backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  );
}
