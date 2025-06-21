import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FileText, Image, Users, Eye, ChevronRight, BarChart3, PieChart, MessageSquare, Mail, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Define a type for the visit data
interface VisitDay {
  date: string;
  totalVisits: number;
  uniqueVisits: number;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch analytics data (super-admin only)
  const { data: visitData } = useQuery({
    queryKey: ["visitStats"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/admin/analytics/visits?days=7');
        return response.data;
      } catch (error) {
        console.error("Error fetching visit stats:", error);
        return { dates: [], counts: [], totalVisits: 0, uniqueVisits: 0, visitsByDay: [] };
      }
    },
    enabled: user?.role === "super-admin",
  });

  const { data: onlineData } = useQuery({
    queryKey: ["onlineCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/admin/analytics/online');
        return response.data;
      } catch (error) {
        console.error("Error fetching online count:", error);
        return { count: 0 };
      }
    },
    enabled: user?.role === "super-admin",
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch news count
  const { data: newsData } = useQuery({
    queryKey: ["newsCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/news?limit=1');
        return response.data;
      } catch (error) {
        console.error("Error fetching news count:", error);
        return { news: [], pagination: { total: 0, page: 1, pages: 0 } };
      }
    },
  });

  // Fetch albums count
  const { data: albumsData } = useQuery({
    queryKey: ["albumsCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/gallery/albums');
        return response.data;
      } catch (error) {
        console.error("Error fetching albums count:", error);
        return { albums: [] };
      }
    },
  });

  // Fetch users count (super-admin only)
  const { data: usersData } = useQuery({
    queryKey: ["usersCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/admin/users');
        return response.data;
      } catch (error) {
        console.error("Error fetching users count:", error);
        return { users: [] };
      }
    },
    enabled: user?.role === "super-admin",
  });

  // Fetch contact messages count (super-admin only)
  const { data: contactData } = useQuery({
    queryKey: ["contactMessages"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/contact?limit=1');
        return response.data;
      } catch (error) {
        console.error("Error fetching contact messages:", error);
        return { contacts: [], pagination: { total: 0, page: 1, pages: 0 } };
      }
    },
    enabled: user?.role === "super-admin",
  });

  // Fetch subscribers count (super-admin only)
  const { data: subscribersData } = useQuery({
    queryKey: ["subscribersCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/subscribers?limit=1');
        return response.data;
      } catch (error) {
        console.error("Error fetching subscribers:", error);
        return { subscribers: [], pagination: { total: 0, page: 1, pages: 0 } };
      }
    },
    enabled: user?.role === "super-admin",
  });

  // Fetch FAQ count (available to both editors and admins)
  const { data: faqData } = useQuery({
    queryKey: ["faqCount"],
    queryFn: async () => {
      try {
        const response = await api.get('/api/admin/faqs');
        return response.data;
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        return { faqs: [] };
      }
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.username}. Here's an overview of your website.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Users Online - High Priority */}
        {user?.role === "super-admin" && (
          <Card className="border-2 border-green-200 shadow-md bg-gradient-to-br from-white to-green-50 md:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Eye className="h-5 w-5 text-green-600 mr-2" />
                Users Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-4xl font-bold text-green-600">
                  {onlineData?.count || 0}
                </div>
                <div className="ml-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Live
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="text-sm text-gray-600">
                Real-time visitor count
              </div>
            </CardFooter>
          </Card>
        )}

        {/* News Articles */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              Total News Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-500">
                {newsData?.pagination?.total || 0}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              className="text-blue-500 p-0 h-auto font-medium"
              onClick={() => navigate("/admin/news")}
            >
              Manage News <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Gallery Albums */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <Image className="h-5 w-5 text-purple-500 mr-2" />
              Gallery Albums
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-purple-500">
                {albumsData?.albums?.length || 0}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              className="text-purple-500 p-0 h-auto font-medium"
              onClick={() => navigate("/admin/gallery")}
            >
              Manage Gallery <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* System Users - High Priority */}
        {user?.role === "super-admin" && (
          <Card className="border-2 border-orange-200 shadow-md bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                System Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-orange-600">
                  {usersData?.users?.length || 0}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                className="text-orange-600 p-0 h-auto font-medium"
                onClick={() => navigate("/admin/users")}
              >
                Manage Users <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Contact Messages - Medium Priority */}
        {user?.role === "super-admin" && (
          <Card className="border border-purple-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
                Contact Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-purple-500">
                  {contactData?.pagination?.total || 0}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                className="text-purple-500 p-0 h-auto font-medium"
                onClick={() => navigate("/admin/contact")}
              >
                View Messages <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Newsletter Subscribers - Medium Priority */}
        {user?.role === "super-admin" && (
          <Card className="border border-teal-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Mail className="h-5 w-5 text-teal-500 mr-2" />
                Newsletter Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="text-3xl font-bold text-teal-500">
                  {subscribersData?.pagination?.total || 0}
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                variant="ghost"
                className="text-teal-500 p-0 h-auto font-medium"
                onClick={() => navigate("/admin/subscribers")}
              >
                Manage Subscribers <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* FAQ Management - Available to both editors and admins */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
              <HelpCircle className="h-5 w-5 text-blue-500 mr-2" />
              FAQ Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-500">
                {faqData?.faqs?.length || 0}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              className="text-blue-500 p-0 h-auto font-medium"
              onClick={() => navigate("/admin/faqs")}
            >
              Manage FAQs <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activity & Analytics (Super-admin only) */}
      {user?.role === "super-admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" /> Recent Activity
              </CardTitle>
              <CardDescription>
                The latest updates across your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visitData?.visitsByDay?.length > 0 ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <div className="text-sm font-medium">Total Visits: <span className="font-bold text-teal-600">{visitData.totalVisits}</span></div>
                        <div className="text-sm font-medium">Unique Visitors: <span className="font-bold text-blue-600">{visitData.uniqueVisits}</span></div>
                      </div>
                      <div className="h-64 w-full bg-gray-50 rounded-lg border border-gray-200 p-4">
                        <div className="h-full flex items-end justify-between">
                          {visitData.visitsByDay.map((day: VisitDay, index: number) => (
                            <div key={index} className="flex flex-col items-center">
                              <div className="flex-1 w-12 flex flex-col justify-end">
                                <div
                                  className="bg-teal-500 rounded-t-sm w-8"
                                  style={{ height: `${Math.max(5, (day.totalVisits / Math.max(...visitData.visitsByDay.map((d: VisitDay) => d.totalVisits))) * 150)}px` }}
                                ></div>
                              </div>
                              <div className="text-xs mt-1">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No visitor data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" /> Visitor Stats
              </CardTitle>
              <CardDescription>
                Detailed visitor statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visitData?.visitsByDay?.length > 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {visitData.visitsByDay.slice(-4).map((day: VisitDay, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="text-sm font-medium mb-1">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          <div className="flex justify-between">
                            <div>
                              <div className="text-xs text-gray-500">Total</div>
                              <div className="text-lg font-bold text-teal-600">{day.totalVisits}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Unique</div>
                              <div className="text-lg font-bold text-blue-600">{day.uniqueVisits}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No visitor data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
