
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { newsApi } from '@/services/api';
import { parseNewsContent } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function NewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredImages, setFeaturedImages] = useState<Record<string, string>>({});
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});

  const { data, isLoading, error } = useQuery({
    queryKey: ['news', currentPage],
    queryFn: () => newsApi.getAll(currentPage),
  });

  // Set featured images directly from the news data
  useEffect(() => {
    if (data?.news && data.news.length > 0) {
      // Process all articles at once to set featured images
      const newFeaturedImages: Record<string, string> = {};
      const newImagesLoaded: Record<string, boolean> = {};

      // For each news article, try to find an image attachment
      data.news.forEach((article) => {
        if (!article._id) return;

        // Check if the article already has attachments
        if (article.attachments && article.attachments.length > 0) {
          // Find the first image attachment
          const firstImage = article.attachments.find(att =>
            att.mimeType && att.mimeType.startsWith('image/')
          );

          if (firstImage && firstImage._id) {
            const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${firstImage._id}/content`;
            newFeaturedImages[article._id] = imageUrl;
            newImagesLoaded[article._id] = false; // Will be set to true when the image actually loads
          }
        }
      });

      // Update state once with all images
      if (Object.keys(newFeaturedImages).length > 0) {
        setFeaturedImages(prev => ({ ...prev, ...newFeaturedImages }));
        setImagesLoaded(prev => ({ ...prev, ...newImagesLoaded }));
      }
    }
  }, [data?.news]);

  // Fetch additional images for articles that don't have them
  useEffect(() => {
    if (data?.news && data.news.length > 0) {
      // Find articles without featured images
      const articlesWithoutImages = data.news.filter(
        article => article._id && !featuredImages[article._id] && article.slug
      );

      if (articlesWithoutImages.length === 0) return;

      // Limit the number of concurrent requests
      const fetchImagesForArticles = async () => {
        const newFeaturedImages: Record<string, string> = {};
        const newImagesLoaded: Record<string, boolean> = {};

        // Process up to 3 articles at a time to avoid too many concurrent requests
        const batchSize = 3;
        for (let i = 0; i < articlesWithoutImages.length; i += batchSize) {
          const batch = articlesWithoutImages.slice(i, i + batchSize);

          // Process batch in parallel
          await Promise.all(batch.map(async (article) => {
            try {
              const newsItem = await newsApi.getBySlug(article.slug);

              if (newsItem?.attachments?.length > 0) {
                // Find the first image attachment
                const firstImage = newsItem.attachments.find(att =>
                  att.mimeType && att.mimeType.startsWith('image/')
                );

                if (firstImage && firstImage._id && article._id) {
                  const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${firstImage._id}/content`;
                  newFeaturedImages[article._id] = imageUrl;
                  newImagesLoaded[article._id] = false;
                }
              }
            } catch (error) {
              console.error(`Error fetching image for article ${article.title}:`, error);
            }
          }));
        }

        // Update state once with all fetched images
        if (Object.keys(newFeaturedImages).length > 0) {
          setFeaturedImages(prev => ({ ...prev, ...newFeaturedImages }));
          setImagesLoaded(prev => ({ ...prev, ...newImagesLoaded }));
        }
      };

      fetchImagesForArticles();
    }
  }, [data?.news, featuredImages]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Latest News</h1>
        <div className="news-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="news-grid-item">
              <div className="card animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded"></div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                  <div className="h-4 bg-gray-100 rounded w-1/4 mt-4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-700">
              Failed to load news
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Latest News</h1>

      <div className="news-grid">
        {data.news.map((article, index) => {
          const hasImage = featuredImages[article._id];
          const isLoaded = imagesLoaded[article._id] || !hasImage;

          return (
            <Link
              to={`/news/${article.slug}`}
              key={article._id}
              className={cn(
                "news-grid-item group",
                isLoaded ? "loaded" : "opacity-0"
              )}
            >
              <Card className="h-full flex flex-col overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {hasImage ? (
                    <>
                      <img
                        src={featuredImages[article._id]}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="300"
                        fetchpriority={index < 3 ? "high" : "auto"}
                        onLoad={() => {
                          setImagesLoaded(prev => ({
                            ...prev,
                            [article._id]: true
                          }));
                        }}
                        onError={(e) => {
                          console.error(`Failed to load image for article: ${article.title}`, e);
                          e.currentTarget.src = '/placeholder.svg';
                          setImagesLoaded(prev => ({
                            ...prev,
                            [article._id]: true
                          }));
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Calendar className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{article.title}</h3>
                  <div
                    className="line-clamp-3 text-sm text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: parseNewsContent(article.body.substring(0, 150) + '...')
                    }}
                  />
                </CardContent>
                <CardFooter className="px-5 pb-5 pt-0 flex flex-col gap-2 w-full">
                  <div className="flex items-center text-gray-500 w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(article.publishDate), 'MMMM d, yyyy')}
                  </div>
                  <div className="text-primary font-medium flex items-center w-full">
                    Read More <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.pages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {/* First page */}
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Current page */}
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {currentPage}
              </PaginationLink>
            </PaginationItem>

            {/* Ellipsis */}
            {currentPage < data.pagination.pages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last page */}
            {currentPage < data.pagination.pages - 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentPage(data.pagination.pages); }}
                >
                  {data.pagination.pages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < data.pagination.pages) setCurrentPage(currentPage + 1);
                }}
                className={currentPage === data.pagination.pages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
