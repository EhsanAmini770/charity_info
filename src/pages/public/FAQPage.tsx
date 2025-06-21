import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader } from 'lucide-react';
import { faqApi } from '@/services/api';

const FAQPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: faqApi.getAll,
  });

  // Group FAQs by category
  const groupedFaqs = React.useMemo(() => {
    if (!data?.faqs) return {};

    const grouped: Record<string, typeof data.faqs> = {
      'All': data.faqs.filter(faq => faq.isActive)
    };

    data.faqs.forEach(faq => {
      if (!faq.isActive) return;

      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });

    return grouped;
  }, [data]);

  // Get unique categories
  const categories = React.useMemo(() => {
    return Object.keys(groupedFaqs).sort();
  }, [groupedFaqs]);

  // Get FAQs for the selected category
  const displayFaqs = React.useMemo(() => {
    return selectedCategory === 'All'
      ? groupedFaqs['All'] || []
      : groupedFaqs[selectedCategory] || [];
  }, [groupedFaqs, selectedCategory]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading FAQs. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-teal-800">Frequently Asked Questions</h1>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {displayFaqs.length > 0 ? (
          <Accordion type="single" collapsible className="space-y-4">
            {displayFaqs.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={faq._id}
                className="border rounded-lg p-2 shadow-sm"
              >
                <AccordionTrigger className="text-lg font-medium text-teal-700 hover:text-teal-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2 pb-4 px-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No FAQs found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
