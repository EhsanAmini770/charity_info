
import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Calendar, Image, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchApi } from "@/services/api";
import { format } from "date-fns";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  // Update search input when URL query changes
  useEffect(() => {
    setSearchQuery(queryParam);
  }, [queryParam]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["search", queryParam],
    queryFn: () => searchApi.search(queryParam),
    enabled: queryParam.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalResults = (data?.news?.length || 0) + (data?.albums?.length || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Results</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="Search for news, gallery albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {queryParam && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {isLoading ? (
              <span className="flex items-center">
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Searching for "{queryParam}"...
              </span>
            ) : (
              <span>
                {totalResults} results for "{queryParam}"
              </span>
            )}
          </h2>
        </div>
      )}

      {queryParam && !isLoading && !isError && totalResults > 0 && (
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Results ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="news">
              News ({data?.news?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="albums">
              Albums ({data?.albums?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {data?.news && data.news.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" /> News
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.news.slice(0, 3).map((item: any) => (
                    <Card key={item._id}>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {format(new Date(item.publishDate), "MMM d, yyyy")}
                        </p>
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button asChild variant="outline" className="w-full">
                          <Link to={`/news/${item.slug}`}>Read More</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {data.news.length > 3 && (
                  <div className="mt-4 text-right">
                    <Button variant="ghost" onClick={() => setActiveTab("news")}>
                      View All News Results
                    </Button>
                  </div>
                )}
              </div>
            )}

            {data?.albums && data.albums.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2" /> Gallery Albums
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.albums.slice(0, 3).map((item: any) => (
                    <Card key={item._id}>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        )}
                      </CardContent>
                      <CardFooter className="px-4 pb-4 pt-0">
                        <Button asChild className="w-full">
                          <Link to={`/gallery/${item.slug}`}>View Album</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
                {data.albums.length > 3 && (
                  <div className="mt-4 text-right">
                    <Button variant="ghost" onClick={() => setActiveTab("albums")}>
                      View All Album Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="news">
            {data?.news && data.news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.news.map((item: any) => (
                  <Card key={item._id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {format(new Date(item.publishDate), "MMM d, yyyy")}
                      </p>
                    </CardContent>
                    <CardFooter className="px-4 pb-4 pt-0">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/news/${item.slug}`}>Read More</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No news results found.</p>
            )}
          </TabsContent>

          <TabsContent value="albums">
            {data?.albums && data.albums.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.albums.map((item: any) => (
                  <Card key={item._id}>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-lg mb-2">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                    </CardContent>
                    <CardFooter className="px-4 pb-4 pt-0">
                      <Button asChild className="w-full">
                        <Link to={`/gallery/${item.slug}`}>View Album</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No album results found.</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      {queryParam && !isLoading && !isError && totalResults === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any matches for "{queryParam}". Please try another search.
          </p>
          <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
        </div>
      )}

      {queryParam && isError && (
        <div className="text-center py-12 bg-red-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 text-red-700">Error</h3>
          <p className="text-gray-600 mb-6">
            An error occurred while searching. Please try again.
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      )}

      {!queryParam && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Search Our Website</h3>
          <p className="text-gray-600 mb-6">
            Enter a search term above to find news articles and gallery albums.
          </p>
        </div>
      )}
    </div>
  );
}
