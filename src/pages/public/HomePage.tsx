
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Heart, Gift, Users, Image, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { newsApi, galleryApi } from '@/services/api';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import NewsletterSignup from '@/components/NewsletterSignup';
import PartnersSection from '@/components/PartnersSection';
import InteractiveMap from '@/components/InteractiveMap';
import HeroSlider from '@/components/HeroSlider';

const HomePage = () => {
  const [newsThumbnails, setNewsThumbnails] = useState<Record<string, string>>({});
  const [galleryThumbnails, setGalleryThumbnails] = useState<Record<string, string>>({});

  // Fetch latest news
  const {
    data: newsData,
    isLoading: isNewsLoading,
    isError: isNewsError
  } = useQuery({
    queryKey: ['latestNews'],
    queryFn: () => newsApi.getAll(1, 3), // Get first page with 3 items
  });

  // Fetch gallery albums
  const {
    data: galleryData,
    isLoading: isGalleryLoading,
    isError: isGalleryError
  } = useQuery({
    queryKey: ['galleryAlbums'],
    queryFn: galleryApi.getAllAlbums,
  });

  // Set news thumbnails
  useEffect(() => {
    const fetchNewsThumbnails = async () => {
      if (newsData?.news && newsData.news.length > 0) {
        const thumbnails: Record<string, string> = {};

        for (const article of newsData.news) {
          try {
            // Check if article has attachments
            if (article.attachments && article.attachments.length > 0) {
              // Find the first image attachment
              const firstImage = article.attachments.find((att: any) =>
                att.mimeType && att.mimeType.startsWith('image/'));

              if (firstImage && firstImage._id) {
                const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${firstImage._id}/content`;
                thumbnails[article._id] = imageUrl;
                continue;
              }
            }

            // If no attachments in the article data, fetch the full article
            const newsItem = await newsApi.getBySlug(article.slug);

            if (newsItem.attachments && newsItem.attachments.length > 0) {
              // Find the first image attachment
              const firstImage = newsItem.attachments.find((att: any) =>
                att.mimeType && att.mimeType.startsWith('image/'));

              if (firstImage && firstImage._id) {
                const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${firstImage._id}/content`;
                thumbnails[article._id] = imageUrl;
              }
            }
          } catch (error) {
            console.error(`Error setting thumbnail for article ${article._id}:`, error);
          }
        }

        setNewsThumbnails(thumbnails);
      }
    };

    fetchNewsThumbnails();
  }, [newsData?.news]);

  // Set gallery thumbnails
  useEffect(() => {
    const fetchGalleryThumbnails = async () => {
      if (galleryData?.albums && galleryData.albums.length > 0) {
        const thumbnails: Record<string, string> = {};

        // Only process the first 3 albums
        const albumsToProcess = galleryData.albums.slice(0, 3);

        for (const album of albumsToProcess) {
          try {
            // Get the first image of each album to use as thumbnail
            const albumDetail = await galleryApi.getAlbumBySlug(album.slug);
            if (albumDetail.images && albumDetail.images.length > 0) {
              const firstImage = albumDetail.images[0];
              thumbnails[album._id] = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/gallery/${album._id}/${firstImage.filename}`;
            }
          } catch (error) {
            console.error(`Error fetching thumbnail for album ${album.title}:`, error);
          }
        }

        setGalleryThumbnails(thumbnails);
      }
    };

    fetchGalleryThumbnails();
  }, [galleryData?.albums]);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroSlider />

      {/* Impact Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-teal-800">Our Collective Impact</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-teal-700 mb-2">10,000+</h3>
              <p className="text-teal-600">Lives Changed</p>
            </div>

            <div className="text-center p-6 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Gift className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-teal-700 mb-2">$2.5M</h3>
              <p className="text-teal-600">Donations Facilitated</p>
            </div>

            <div className="text-center p-6 rounded-lg border border-teal-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-teal-700 mb-2">500+</h3>
              <p className="text-teal-600">Community Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Information about donations is available on the How to Donate page */}

      {/* Latest News Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-teal-800">Latest News</h2>
            <Button asChild variant="ghost" className="text-teal-600 hover:text-teal-700">
              <Link to="/news" className="flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isNewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden flex flex-col h-full">
                  <div className="aspect-video bg-gray-200"></div>
                  <CardContent className="p-4 flex-grow">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-2 w-full mt-auto">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-100 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isNewsError ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-600">Failed to load latest news.</p>
            </div>
          ) : !newsData?.news || newsData.news.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No news articles available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {newsData.news.map((article) => (
                <Card key={article._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {newsThumbnails[article._id] ? (
                      <img
                        src={newsThumbnails[article._id]}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-2 w-full mt-auto">
                    <p className="text-sm text-gray-500 w-full">
                      {format(new Date(article.publishDate), "MMM d, yyyy")}
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/news/${article.slug}`}>Read More</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-teal-800">Gallery</h2>
            <Button asChild variant="ghost" className="text-teal-600 hover:text-teal-700">
              <Link to="/gallery" className="flex items-center">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isGalleryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden flex flex-col h-full">
                  <div className="aspect-square bg-gray-200"></div>
                  <CardContent className="p-4 flex-grow">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-2 w-full mt-auto">
                    <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
                    <div className="h-8 bg-gray-100 rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isGalleryError ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-600">Failed to load gallery albums.</p>
            </div>
          ) : !galleryData?.albums || galleryData.albums.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No gallery albums available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {galleryData.albums.slice(0, 3).map((album) => (
                <Card key={album._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {galleryThumbnails[album._id] ? (
                      <img
                        src={galleryThumbnails[album._id]}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4 flex-grow">
                    <h3 className="font-semibold text-lg mb-2">{album.title}</h3>
                  </CardContent>
                  <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-2 w-full mt-auto">
                    {album.imageCount !== undefined && (
                      <p className="text-sm text-gray-500 w-full">
                        {album.imageCount} {album.imageCount === 1 ? 'image' : 'images'}
                      </p>
                    )}
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/gallery/${album.slug}`}>View Album</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Partners & Sponsors Section */}
      <PartnersSection />

      {/* Interactive Map Section */}
      <InteractiveMap />

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-teal-800">Stay Connected</h2>
              <p className="text-lg text-gray-700 mb-6">
                Subscribe to our newsletter to receive updates on our latest initiatives,
                success stories, and ways you can get involved in making a difference.
              </p>
              <div className="flex items-center space-x-4 mb-8">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-700">Weekly Updates</h3>
                  <p className="text-gray-600">Get the latest news delivered to your inbox</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-teal-700">Join Our Community</h3>
                  <p className="text-gray-600">Be part of a network of changemakers</p>
                </div>
              </div>
            </div>
            <div>
              <NewsletterSignup className="shadow-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8 text-teal-50">
            Join our community of changemakers and help us create a better world for everyone.
          </p>
          <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
            <Link to="/contact">
              Get Involved Today
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
