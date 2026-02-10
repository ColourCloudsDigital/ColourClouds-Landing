# Colour Clouds Digital - Modern Design Guide

## 🎨 Design Philosophy

The enhanced design follows these core principles:
1. **Minimalism & Clarity** - Clean layouts with generous whitespace
2. **Visual Hierarchy** - Clear distinction between content levels
3. **Smooth Interactions** - Subtle animations that enhance UX
4. **Responsive Excellence** - Seamless adaptation across devices
5. **Accessibility First** - WCAG 2.1 AA compliance
6. **Brand Consistency** - Colour Clouds identity throughout

## 🌈 Color System

### Primary Brand Colors
```css
/* Green - Primary CTAs, Success States */
--cc-green-50: #E6F7EF;
--cc-green-500: #01A750;  /* Main brand color */
--cc-green-600: #018540;

/* Blue - Secondary CTAs, Links, Info */
--cc-blue-50: #E6F2FF;
--cc-blue-500: #0072FF;   /* Main brand color */
--cc-blue-600: #005BCC;

/* Red - Errors, Warnings, Urgent Actions */
--cc-red-500: #EF4444;    /* Main brand color */
--cc-red-600: #DC2626;
```

### Usage Guidelines
- **Primary Actions**: Green buttons, success messages
- **Secondary Actions**: Blue buttons, links, informational elements
- **Attention/Errors**: Red for errors, warnings, destructive actions
- **Text**: Gray-700 to Gray-900 for body text
- **Backgrounds**: White primary, Gray-50 secondary

## 📐 Typography

### Font Stack
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Type Scale
```css
/* Hero Headings */
.hero-title {
  font-size: 6rem;      /* 96px on desktop */
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.025em;
}

/* Page Titles */
.page-title {
  font-size: 3.75rem;   /* 60px on desktop */
  font-weight: 700;
  line-height: 1;
}

/* Section Headings */
.section-heading {
  font-size: 2.25rem;   /* 36px */
  font-weight: 600;
  line-height: 2.5rem;
}

/* Body Text */
.body-text {
  font-size: 1.125rem;  /* 18px */
  line-height: 1.75rem;
  color: #374151;       /* gray-700 */
}
```

## 🎭 Component Patterns

### Modern Card Design
```tsx
<div className="
  group
  bg-white
  rounded-xl
  shadow-sm hover:shadow-2xl
  border border-gray-200 hover:border-cc-green/30
  transition-all duration-300
  hover:-translate-y-1
">
  {/* Card content */}
</div>
```

**Features:**
- Rounded corners (12px)
- Subtle shadow that grows on hover
- Border color change on hover
- Lift effect (translate-y)
- Smooth 300ms transitions

### Button Styles

#### Primary Button
```tsx
<button className="
  px-6 py-3
  bg-cc-green hover:bg-cc-green-600
  text-white
  font-medium
  rounded-lg
  shadow-lg hover:shadow-xl
  transition-all duration-300
  hover:scale-105 active:scale-95
">
  Get Started
</button>
```

#### Secondary Button
```tsx
<button className="
  px-6 py-3
  bg-cc-blue hover:bg-cc-blue-600
  text-white
  font-medium
  rounded-lg
  shadow-lg hover:shadow-xl
  transition-all duration-300
  hover:scale-105 active:scale-95
">
  Learn More
</button>
```

#### Outline Button
```tsx
<button className="
  px-6 py-3
  border-2 border-gray-300
  hover:border-cc-green hover:text-cc-green
  font-medium
  rounded-lg
  transition-all duration-300
  hover:scale-105 active:scale-95
">
  View Details
</button>
```

### Badge Components

#### Category Badge
```tsx
<span className="
  inline-block
  px-3 py-1.5
  text-xs font-semibold
  text-white bg-cc-green
  rounded-lg
  shadow-lg
">
  Development
</span>
```

#### Tag Badge
```tsx
<span className="
  inline-block
  px-3 py-1
  text-xs font-medium
  text-cc-blue bg-cc-blue/10
  rounded-full
  hover:bg-cc-blue/20
  transition-colors
">
  #nextjs
</span>
```

## ✨ Animation Patterns

### Hover Effects

#### Card Hover
```css
.card {
  transition: all 300ms ease-in-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

#### Image Zoom
```css
.image-container {
  overflow: hidden;
}

.image-container img {
  transition: transform 500ms ease-in-out;
}

.image-container:hover img {
  transform: scale(1.1);
}
```

#### Button Scale
```css
.button {
  transition: all 300ms ease-in-out;
}

.button:hover {
  transform: scale(1.05);
}

.button:active {
  transform: scale(0.95);
}
```

### Loading States

#### Shimmer Effect
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
}
```

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.6s ease-out;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
.container {
  padding: 1rem;           /* Mobile: 16px */
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;         /* Tablet: 32px */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 3rem;         /* Desktop: 48px */
  }
}
```

### Typography Scaling
```css
.heading {
  font-size: 2.25rem;      /* Mobile: 36px */
}

@media (min-width: 768px) {
  .heading {
    font-size: 3rem;       /* Tablet: 48px */
  }
}

@media (min-width: 1024px) {
  .heading {
    font-size: 3.75rem;    /* Desktop: 60px */
  }
}
```

## 🎯 Layout Patterns

### Hero Section
```tsx
<section className="
  relative
  min-h-screen
  flex items-center
  bg-gradient-to-br from-cc-green/5 via-cc-blue/5 to-background
">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Content */}
    </div>
  </div>
</section>
```

### Content Section
```tsx
<section className="py-20 md:py-32 bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
      {/* Section Header */}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* Content Grid */}
    </div>
  </div>
</section>
```

### CTA Banner
```tsx
<section className="
  py-20 md:py-24
  bg-gradient-to-br from-cc-green via-cc-green-600 to-cc-blue
  text-white
  relative overflow-hidden
">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* CTA Content */}
  </div>
</section>
```

## ♿ Accessibility

### Focus States
```css
*:focus-visible {
  outline: none;
  ring: 2px solid #01A750;
  ring-offset: 2px;
}
```

### Keyboard Navigation
- All interactive elements accessible via Tab
- Clear focus indicators
- Logical tab order
- Skip to main content link

### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for all images
- Proper heading hierarchy

### Color Contrast
- Text on white: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear focus states

## 🚀 Performance

### Image Optimization
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={1200}
  height={630}
  priority={false}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

### Animation Performance
- Use CSS transforms (GPU-accelerated)
- Avoid animating width/height
- Use will-change sparingly
- Respect prefers-reduced-motion

## 📊 Design Metrics

### Spacing Scale
```
4px   → gap-1
8px   → gap-2
12px  → gap-3
16px  → gap-4
24px  → gap-6
32px  → gap-8
48px  → gap-12
64px  → gap-16
96px  → gap-24
128px → gap-32
```

### Shadow Scale
```css
shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.05)
shadow:      0 1px 3px rgba(0, 0, 0, 0.1)
shadow-md:   0 4px 6px rgba(0, 0, 0, 0.1)
shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1)
shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1)
shadow-2xl:  0 25px 50px rgba(0, 0, 0, 0.25)
```

## 🎨 Design Tokens

### Border Radius
```css
rounded-sm:   0.125rem  /* 2px */
rounded:      0.25rem   /* 4px */
rounded-md:   0.375rem  /* 6px */
rounded-lg:   0.5rem    /* 8px */
rounded-xl:   0.75rem   /* 12px */
rounded-2xl:  1rem      /* 16px */
rounded-full: 9999px
```

### Transition Durations
```css
duration-150: 150ms
duration-200: 200ms
duration-300: 300ms  /* Default */
duration-500: 500ms
duration-700: 700ms
```

## 🎯 Best Practices

1. **Consistency**
   - Use design tokens consistently
   - Follow established patterns
   - Maintain brand colors

2. **Performance**
   - Optimize images
   - Use CSS animations
   - Lazy load content

3. **Accessibility**
   - Test with keyboard
   - Use semantic HTML
   - Provide alt text

4. **Responsiveness**
   - Mobile-first approach
   - Test all breakpoints
   - Touch-friendly targets

5. **Maintainability**
   - Use Tailwind utilities
   - Follow naming conventions
   - Document custom code

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)

---

**Remember**: The goal is to create a beautiful, functional, and accessible website that represents the Colour Clouds Digital brand while providing an excellent user experience.
