
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Maximize2, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { galleryApi } from "@/services/api";
import { cn } from "@/lib/utils";

export function GalleryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [imageDimensions, setImageDimensions] = useState<Record<string, { height: number, width: number }>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["albumDetail", slug],
    queryFn: async () => {
      if (!slug) return Promise.reject("No slug provided");
      const result = await galleryApi.getAlbumBySlug(slug);
      console.log('Album detail data:', result);
      return result;
    },
    enabled: !!slug,
  });

  const openLightbox = (imageUrl: string, index: number) => {
    setSelectedImage(imageUrl);
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedIndex(-1);
    document.body.style.overflow = "auto";
  };

  const navigateLightbox = useCallback(
    (direction: "next" | "prev") => {
      if (!data?.images || selectedIndex === -1) return;

      const imagesCount = data.images.length;
      let newIndex;

      if (direction === "next") {
        newIndex = (selectedIndex + 1) % imagesCount;
      } else {
        newIndex = (selectedIndex - 1 + imagesCount) % imagesCount;
      }

      const newImage = data.images[newIndex];
      setSelectedIndex(newIndex);
      setSelectedImage(`http://localhost:5000/uploads/gallery/${data.album._id}/${newImage.filename}`);
    },
    [data, selectedIndex]
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

  // We don't need to calculate aspect ratio with the column-based layout

  const handleImageLoad = (imageId: string, event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;

    // Calculate the aspect ratio and determine the grid row span
    const height = img.naturalHeight;
    const width = img.naturalWidth;

    setImageDimensions(prev => ({
      ...prev,
      [imageId]: { height, width }
    }));

    setImagesLoaded(prev => ({
      ...prev,
      [imageId]: true
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/4 mb-8"></div>
          <div className="masonry-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="masonry-item bg-gray-200 rounded-lg overflow-hidden">
                <div
                  className="w-full"
                  style={{ paddingBottom: `${Math.floor(Math.random() * 50) + 50}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Album Not Found</h1>
        <p className="text-gray-600 mb-6">The album you're looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link to="/gallery">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
          </Link>
        </Button>
      </div>
    );
  }

  const { album, images } = data;
  // Use the imageCount from the API or fallback to the length of the images array
  const imageCount = album.imageCount !== undefined ? album.imageCount : images.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link to="/gallery">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Gallery
        </Link>
      </Button>

      <h1 className="text-3xl font-bold text-gray-800 mb-3">{album.title}</h1>

      {album.description && (
        <p className="text-gray-600 mb-8 max-w-3xl">{album.description}</p>
      )}

      {images.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg">This album has no images yet.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {images.map((image: any, index: number) => {
            const imageUrl = `http://localhost:5000/uploads/gallery/${album._id}/${image.filename}`;
            const isLoaded = imagesLoaded[image._id];

            return (
              <div
                key={image._id}
                className={cn(
                  "masonry-item group relative overflow-hidden",
                  isLoaded ? "loaded" : "opacity-0"
                )}
                // No need for custom style with column-based layout
              >
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white border border-white/30 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(imageUrl, index);
                    }}
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </div>
                <img
                  src={imageUrl}
                  alt={`Gallery image ${image._id}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onLoad={(e) => {
                    console.log(`Image loaded successfully: ${image.filename}`);
                    handleImageLoad(image._id, e);
                  }}
                  onError={(e) => {
                    console.error(`Failed to load image: ${image.filename}`);
                    console.error(`Image URL: ${imageUrl}`);
                    e.currentTarget.src = '/placeholder.svg';
                    // Use a default dimension for failed images
                    setImageDimensions(prev => ({
                      ...prev,
                      [image._id]: { height: 200, width: 200 }
                    }));
                    setImagesLoaded(prev => ({
                      ...prev,
                      [image._id]: true
                    }));
                  }}
                  onClick={() => openLightbox(imageUrl, index)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
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
              alt="Enlarged gallery image"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 text-center text-white text-sm py-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}

      {/* CSS for masonry grid is in index.css */}
    </div>
  );
}
