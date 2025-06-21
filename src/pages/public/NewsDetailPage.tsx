import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader, Paperclip, FileText, FileImage, File, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { newsApi } from "@/services/api";
import { ApiError } from "@/components/ui/api-error";
import { parseNewsContent } from "@/lib/utils";

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper type for author
type Author = string | { _id: string; username: string };

// Helper function to render author safely
export function formatAuthor(author: Author): string {
  if (typeof author === "object" && author !== null) {
    return author.username;
  }
  return String(author);
}

export function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [textContents, setTextContents] = useState<Record<string, { content: string, filename: string }>>({});
  const [loadingAttachments, setLoadingAttachments] = useState<Record<string, boolean>>({});
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  const { data: newsItem, isLoading: isNewsLoading, error, refetch } = useQuery({
    queryKey: ['news', slug],
    queryFn: () => newsApi.getBySlug(slug || ''),
    enabled: !!slug,
  });

  // Function to load text content for an attachment
  const loadTextContent = async (attachmentId: string) => {
    try {
      setLoadingAttachments(prev => ({ ...prev, [attachmentId]: true }));
      const data = await newsApi.getAttachmentContent(attachmentId);
      setTextContents(prev => ({ ...prev, [attachmentId]: data }));
    } catch (error) {
      console.error('Error fetching text content:', error);
    } finally {
      setLoadingAttachments(prev => ({ ...prev, [attachmentId]: false }));
    }
  };

  useEffect(() => {
    if (newsItem?.attachments) {
      // If attachments are already included in the news item
      console.log('Attachments from news item:', newsItem.attachments);
      setAttachments(newsItem.attachments);

      // Find the first image to use as featured image
      const firstImage = newsItem.attachments.find((attachment: any) =>
        attachment.mimeType?.startsWith('image/'));
      if (firstImage) {
        setFeaturedImageId(firstImage._id);
      }

      // Load text content for text files
      newsItem.attachments.forEach((attachment: any) => {
        if (attachment.mimeType === 'text/plain' ||
            attachment.filename.toLowerCase().endsWith('.txt')) {
          loadTextContent(attachment._id);
        }
      });
    } else if (newsItem?._id) {
      // Otherwise, fetch them separately
      const fetchAttachments = async () => {
        try {
          const data = await newsApi.getAttachments(newsItem._id);
          if (data?.attachments) {
            console.log('Attachments fetched separately:', data.attachments);
            setAttachments(data.attachments);

            // Find the first image to use as featured image
            const firstImage = data.attachments.find((attachment: any) =>
              attachment.mimeType?.startsWith('image/'));
            if (firstImage) {
              setFeaturedImageId(firstImage._id);
            }

            // Load text content for text files
            data.attachments.forEach((attachment: any) => {
              if (attachment.mimeType === 'text/plain' ||
                  attachment.filename.toLowerCase().endsWith('.txt')) {
                loadTextContent(attachment._id);
              }
            });
          } else {
            console.log('No attachments found for this news item');
          }
        } catch (error) {
          console.error('Error fetching attachments:', error);
        }
      };
      fetchAttachments();
    }
  }, [newsItem]);

  // Lightbox navigation functions
  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedImageIndex(-1);
    document.body.style.overflow = "auto";
  };

  const navigateLightbox = useCallback(
    (direction: "next" | "prev") => {
      const imageAttachments = attachments.filter(
        att => att.mimeType?.startsWith('image/') && att._id !== featuredImageId
      );

      if (!imageAttachments.length || selectedImageIndex === -1) return;

      const imagesCount = imageAttachments.length;
      let newIndex: number;

      if (direction === "next") {
        newIndex = (selectedImageIndex + 1) % imagesCount;
      } else {
        newIndex = (selectedImageIndex - 1 + imagesCount) % imagesCount;
      }

      const newImage = imageAttachments[newIndex];
      setSelectedImageIndex(newIndex);
      setSelectedImage(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${newImage._id}/content`);
    },
    [attachments, selectedImageIndex, featuredImageId]
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "ArrowRight") {
          navigateLightbox("next");
        } else if (e.key === "ArrowLeft") {
          navigateLightbox("prev");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, navigateLightbox]);

  if (isNewsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ApiError
          title="Failed to load news article"
          error={error}
          onRetry={refetch}
        />
        <div className="mt-4">
          <Link to="/news">
            <Button variant="outline">Back to News</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/news" className="text-primary hover:underline mb-4 inline-block">
        &larr; Back to News
      </Link>

      <Card className="mt-4 overflow-hidden">
        {/* Display featured image if available */}
        {featuredImageId && (
          <div className="w-full h-[350px] md:h-[450px] bg-gray-100 relative overflow-hidden">
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${featuredImageId}/content`}
              alt={newsItem.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error(`Failed to load featured image`);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{newsItem.title}</h1>
              <div className="flex items-center text-white/80 text-sm md:text-base">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {newsItem.publishDate && format(new Date(newsItem.publishDate), 'MMMM dd, yyyy')}
                </span>
                {newsItem.author && (
                  <span className="ml-4">
                    by {formatAuthor(newsItem.author)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {!featuredImageId && (
                <>
                  <CardTitle className="text-3xl">{newsItem.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Calendar className="h-4 w-4" />
                    {newsItem.publishDate && (
                      <span className="text-gray-500">
                        {format(new Date(newsItem.publishDate), 'MMMM dd, yyyy')}
                      </span>
                    )}
                    {newsItem.author && (
                      <span className="ml-2 text-gray-500">
                        by {formatAuthor(newsItem.author)}
                      </span>
                    )}
                  </CardDescription>
                </>
              )}
            </div>

            {!newsItem.published && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                Draft
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseNewsContent(newsItem.body) }} />

          {attachments && attachments.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Paperclip className="mr-2 h-5 w-5" /> Attachments
              </h3>
              <div className="grid gap-4">
                {/* Display non-featured images in a grid */}
                {attachments.some(att => att.mimeType?.startsWith('image/') && att._id !== featuredImageId) && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <FileImage className="h-4 w-4 mr-2 text-gray-500" /> Images
                    </h4>
                    <div className="news-images-grid">
                      {attachments
                        .filter(att => att.mimeType?.startsWith('image/') && att._id !== featuredImageId)
                        .map(attachment => (
                          <div
                            key={attachment._id}
                            className="news-image-item cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${attachment._id}/content`;
                              setSelectedImage(imageUrl);
                              const index = attachments
                                .filter(att => att.mimeType?.startsWith('image/') && att._id !== featuredImageId)
                                .findIndex(att => att._id === attachment._id);
                              setSelectedImageIndex(index);
                              document.body.style.overflow = "hidden";
                            }}
                          >
                            <div className="relative group overflow-hidden rounded-lg">
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${attachment._id}/content`}
                                alt={attachment.originalname || attachment.filename}
                                className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  console.error(`Failed to load image: ${attachment.filename}`);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white border border-white/30 hover:bg-white/20 h-12 w-12 rounded-full"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="M11 8v6"></path><path d="M8 11h6"></path></svg>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Display other file types */}
                {attachments.some(att => !att.mimeType?.startsWith('image/')) && (
                  <div>
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <File className="h-4 w-4 mr-2 text-gray-500" /> Files
                    </h4>
                    <div className="grid gap-2">
                      {attachments
                        .filter(att => !att.mimeType?.startsWith('image/'))
                        .map(attachment => {
                          // Determine icon based on mime type
                          let Icon = File;
                          if (attachment.mimeType) {
                            if (attachment.mimeType.includes('pdf')) {
                              Icon = FileText;
                            } else if (attachment.mimeType.includes('document') ||
                                    attachment.mimeType.includes('text')) {
                              Icon = FileText;
                            }
                          }

                          return (
                            <div key={attachment._id} className="border rounded-md hover:bg-gray-50 overflow-hidden">
                              <div className="flex items-center p-3">
                                <Icon className="h-5 w-5 mr-3 text-gray-500" />
                                <div className="flex-1">
                                  <p className="font-medium">{attachment.originalname || attachment.filename}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                              </div>

                              {/* Display text content for text files */}
                              {(attachment.mimeType === 'text/plain' ||
                                attachment.filename.toLowerCase().endsWith('.txt')) && (
                                <div className="px-3 pb-3">
                                  {loadingAttachments[attachment._id] ? (
                                    <div className="flex justify-center py-4">
                                      <Loader className="h-5 w-5 animate-spin text-primary" />
                                    </div>
                                  ) : textContents[attachment._id] ? (
                                    <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded-md border max-h-[300px] overflow-y-auto">
                                      {textContents[attachment._id].content}
                                    </div>
                                  ) : (
                                    <div className="text-center py-2 text-gray-500 text-sm">
                                      Failed to load content.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Lightbox for news images */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 md:left-8 text-white hover:bg-white/10 h-12 w-12 rounded-full opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("prev");
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 md:right-8 text-white hover:bg-white/10 h-12 w-12 rounded-full opacity-70 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox("next");
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="relative max-h-[90vh] max-w-[90vw] animate-fadeIn">
            <img
              src={selectedImage}
              alt="Enlarged news image"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 text-center text-white text-sm py-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
              {selectedImageIndex + 1} / {attachments.filter(att => att.mimeType?.startsWith('image/') && att._id !== featuredImageId).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
