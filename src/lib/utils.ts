import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse and format tags in news content
 * Converts text in the format "**Tags:** tag1, tag2, tag3" to HTML tags
 * @param content - The HTML content to parse
 * @returns Formatted HTML content with tags
 */
export function parseNewsContent(content: string): string {
  // Regular expression to match tag format: **Tags:** tag1, tag2, tag3
  const tagRegex = /\*\*Tags:\*\*\s*([^<]+)(?=<\/p>|$)/g;

  // Replace matched tag sections with formatted tags
  return content.replace(tagRegex, (match, tagList) => {
    // Split the tag list by commas and trim whitespace
    const tags = tagList.split(',').map(tag => tag.trim()).filter(Boolean);

    if (tags.length === 0) {
      return match; // No valid tags found, return original text
    }

    // Create HTML for tags
    const tagsHtml = tags.map(tag =>
      `<span class="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800 mr-2 mb-2">${tag}</span>`
    ).join('');

    return `<div class="mt-4"><span class="font-semibold">Tags:</span> <div class="flex flex-wrap mt-1">${tagsHtml}</div></div>`;
  });
}
