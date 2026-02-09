# Breadcrumb Component Usage Examples

## Overview
The Breadcrumb component provides dynamic breadcrumb navigation with SEO-optimized structured data and accessible navigation.

## Features
- ✅ Dynamic breadcrumb generation based on items prop
- ✅ Structured data markup (JSON-LD) for SEO
- ✅ Accessible navigation with aria-labels
- ✅ Consistent styling with brand colors (cc-blue, cc-green)
- ✅ Responsive design
- ✅ Hover effects with smooth transitions

## Basic Usage

### Import
```tsx
import { Breadcrumb, BreadcrumbItem } from '@/components/breadcrumb';
```

### Example 1: Blog Post Page
```tsx
// app/blog/[slug]/page.tsx
const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: post.title, href: `/blog/${post.slug}` }
];

<Breadcrumb items={breadcrumbItems} />
```

### Example 2: Services Page
```tsx
// app/services/page.tsx
const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' }
];

<Breadcrumb items={breadcrumbItems} />
```

### Example 3: About Page
```tsx
// app/about/page.tsx
const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' }
];

<Breadcrumb items={breadcrumbItems} />
```

### Example 4: Contact Page
```tsx
// app/contact/page.tsx
const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Contact', href: '/contact' }
];

<Breadcrumb items={breadcrumbItems} />
```

## Styling

### Brand Colors Used
- **Links**: `text-cc-blue` (#0072FF)
- **Hover**: `hover:text-cc-green` (#01A750)
- **Current Page**: `text-gray-600`
- **Separators**: `text-gray-400`

### Customization
The component uses Tailwind CSS classes. You can wrap it in a container to adjust positioning:

```tsx
<div className="container mx-auto max-w-7xl">
  <Breadcrumb items={breadcrumbItems} />
</div>
```

## SEO Benefits

The component automatically generates JSON-LD structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://colourclouds.digital/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://colourclouds.digital/blog"
    }
  ]
}
```

This helps search engines understand your site structure and may result in rich snippets in search results.

## Accessibility Features

1. **Semantic HTML**: Uses `<nav>` and `<ol>` elements
2. **ARIA Labels**: 
   - Navigation has `aria-label="Breadcrumb navigation"`
   - Links have descriptive `aria-label` attributes
   - Current page has `aria-current="page"`
3. **Keyboard Navigation**: All links are keyboard accessible
4. **Screen Reader Friendly**: Proper structure and labels for screen readers

## Requirements Validation

### Requirement 10.4: Breadcrumb Navigation Functionality
✅ Breadcrumbs display on all specified pages
✅ Clicking breadcrumb links navigates to corresponding pages
✅ Consistent styling with brand colors

### Requirement 10.5: Breadcrumb Styling
✅ Styled consistently with overall design language
✅ Uses brand colors (cc-blue, cc-green)
✅ Responsive design
✅ Accessible with proper ARIA labels
