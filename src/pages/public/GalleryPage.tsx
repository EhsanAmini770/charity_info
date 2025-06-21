
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Image } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { galleryApi } from "@/services/api";

export function GalleryPage() {
  const [albumThumbnails, setAlbumThumbnails] = useState<Record<string, string>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["albums"],
    queryFn: galleryApi.getAllAlbums,
  });

  // Fetch thumbnails for each album
  useEffect(() => {
    const fetchThumbnails = async () => {
      if (data?.albums && data.albums.length > 0) {
        const thumbnails: Record<string, string> = {};

        for (const album of data.albums) {
          try {
            // Get the first image of each album to use as thumbnail
            const albumDetail = await galleryApi.getAlbumBySlug(album.slug);
            if (albumDetail.images && albumDetail.images.length > 0) {
              const firstImage = albumDetail.images[0];
              thumbnails[album._id] = `http://localhost:5000/uploads/gallery/${album._id}/${firstImage.filename}`;
              console.log(`Thumbnail URL for ${album.title}:`, thumbnails[album._id]);
            } else {
              console.log(`No images found for album: ${album.title}`);
            }
          } catch (error) {
            console.error(`Error fetching thumbnail for album ${album.title}:`, error);
          }
        }

        setAlbumThumbnails(thumbnails);
      }
    };

    fetchThumbnails();
  }, [data?.albums]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gallery</h1>
        <p className="text-gray-600">Browse our collection of images and photos</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Failed to load albums.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : data?.albums?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No albums found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data?.albums?.map((album: any) => (
            <Card key={album._id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                {albumThumbnails[album._id] ? (
                  <img
                    src={albumThumbnails[album._id]}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                      // Safely try to show the default icon
                      try {
                        e.currentTarget.style.display = 'none';
                        const iconElement = e.currentTarget.parentElement?.querySelector('.default-icon');
                        if (iconElement) {
                          (iconElement as HTMLElement).style.display = 'block';
                        }
                      } catch (error) {
                        console.error('Error handling image load failure:', error);
                      }
                    }}
                  />
                ) : (
                  <Image className="h-24 w-24 text-gray-300 group-hover:scale-110 transition-transform duration-300 default-icon" style={{ display: 'block' }} />
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">{album.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {album.description || "No description available"}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex flex-col gap-2 w-full mt-auto">
                <p className="text-sm text-gray-500 w-full">
                  {album.imageCount || 0} {(album.imageCount === 1) ? 'image' : 'images'}
                </p>
                <Button asChild className="w-full">
                  <Link to={`/gallery/${album.slug}`}>View Album</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
