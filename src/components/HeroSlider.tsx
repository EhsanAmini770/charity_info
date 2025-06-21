import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { galleryApi } from '@/services/api';

interface HeroSliderProps {
  className?: string;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ className }) => {
  const [images, setImages] = useState<string[]>([]);
  const [albumTitle, setAlbumTitle] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch images from a randomly selected album
  useEffect(() => {
    const fetchRandomAlbumImages = async () => {
      try {
        setLoading(true);
        // Get all albums
        const albumsData = await galleryApi.getAllAlbums();

        if (!albumsData.albums || albumsData.albums.length === 0) {
          setError('No gallery albums found');
          setLoading(false);
          return;
        }

        // Randomly select one album
        const randomIndex = Math.floor(Math.random() * albumsData.albums.length);
        const selectedAlbum = albumsData.albums[randomIndex];

        console.log(`Randomly selected album: ${selectedAlbum.title}`);
        setAlbumTitle(selectedAlbum.title);

        // Get the details of the selected album
        const albumDetail = await galleryApi.getAlbumBySlug(selectedAlbum.slug);

        if (!albumDetail.images || albumDetail.images.length === 0) {
          // If the selected album has no images, try to find another album with images
          let foundAlbumWithImages = false;

          for (const album of albumsData.albums) {
            if (album._id === selectedAlbum._id) continue; // Skip the already checked album

            const anotherAlbumDetail = await galleryApi.getAlbumBySlug(album.slug);

            if (anotherAlbumDetail.images && anotherAlbumDetail.images.length > 0) {
              // Use this album instead
              console.log(`Selected album had no images. Using album: ${album.title} instead`);
              setAlbumTitle(album.title);

              const albumImages = anotherAlbumDetail.images.map(image => {
                return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/gallery/${album._id}/${image.filename}`;
              });

              setImages(albumImages);
              foundAlbumWithImages = true;
              break;
            }
          }

          if (!foundAlbumWithImages) {
            setError('No images found in any albums');
          }
        } else {
          // Use the images from the randomly selected album
          const albumImages = albumDetail.images.map(image => {
            return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/gallery/${selectedAlbum._id}/${image.filename}`;
          });

          setImages(albumImages);
        }
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('Failed to load gallery images');
      } finally {
        setLoading(false);
      }
    };

    fetchRandomAlbumImages();
  }, []);

  // Auto-advance the slider
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToNextSlide = () => {
    if (images.length <= 1) return;
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const goToPrevSlide = () => {
    if (images.length <= 1) return;
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className={`relative min-h-[80vh] flex items-center justify-center bg-gray-200 ${className}`}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-gray-300 mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || images.length === 0) {
    return (
      <div className={`relative min-h-[80vh] flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-background.jpg"
            alt="Community volunteers working together"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-700/60"></div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
            Creating <span className="text-teal-300">Positive Change</span> In Our Community
          </h1>
          <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-10">
            Join us in our mission to build a better world through compassion,
            support, and community-driven initiatives.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[80vh] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Image Slider */}
      <div className="absolute inset-0 z-0">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={imageUrl}
              alt={`Gallery image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=2070';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-teal-700/60"></div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white hover:bg-black/40 rounded-full h-12 w-12"
            onClick={goToPrevSlide}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 text-white hover:bg-black/40 rounded-full h-12 w-12"
            onClick={goToNextSlide}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
          Creating <span className="text-teal-300">Positive Change</span> In Our Community
        </h1>
        <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-4">
          Join us in our mission to build a better world through compassion,
          support, and community-driven initiatives.
        </p>
        {albumTitle && (
          <p className="text-lg text-teal-200 font-medium mb-8">
            Featured Album: <span className="text-white">{albumTitle}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
            <a href="/about">
              Learn More
            </a>
          </Button>
        </div>
      </div>

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
