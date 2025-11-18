# Cinematic Style Guide

## Design Philosophy
Modern, dark, moody aesthetic inspired by Netflix, HBO Max, and A24 studio branding with electric blue highlights and film grain textures.

## Color Palette

### Primary Colors
- **Background**: `#0a0a0f` - Deep black with subtle blue tint
- **Card Background**: `#141418` - Slightly lighter dark gray
- **Border**: `#1f1f23` - Subtle border color
- **Electric Blue**: `#0095ff` - Primary accent color
- **Electric Cyan**: `#00d4ff` - Secondary accent

### Text Colors
- **Primary Text**: `#e5e7eb` - Light gray
- **Muted Text**: `#6b7280` - Medium gray
- **Electric Blue**: `#0095ff` - Accent text

## Typography

### Font Families
- **Serif (Headings)**: `'Playfair Display', serif` - Elegant, cinematic
- **Sans (Body)**: `'Inter', sans-serif` - Clean, modern

### Usage
```jsx
// Headings - use serif
<h1 className="font-serif text-4xl">Title</h1>

// Body text - use sans (default)
<p className="text-base">Content</p>

// Electric accent
<span className="text-electric-blue">Highlight</span>
```

## Components

### Glass Card
```jsx
<div className="glass-card rounded-xl p-6">
  {/* Content */}
</div>
```

### Film Grain Effect
```jsx
<div className="film-grain">
  {/* Adds subtle film grain texture */}
</div>
```

### Electric Border
```jsx
<div className="border-electric rounded-lg">
  {/* Subtle electric blue border */}
</div>
```

### Glow Effect
```jsx
<button className="glow-blue">
  {/* Subtle blue glow on hover */}
</button>
```

## Tailwind Classes

### Background Colors
- `bg-cinematic-bg` - Main background
- `bg-cinematic-card` - Card background
- `bg-electric-blue` - Electric blue

### Text Colors
- `text-cinematic-text` - Primary text
- `text-cinematic-muted` - Muted text
- `text-electric-blue` - Electric blue accent

### Border Colors
- `border-cinematic-border` - Subtle border
- `border-electric-blue` - Electric blue border

## Design Patterns

### Hero Section
```jsx
<section className="relative min-h-screen flex items-center justify-center">
  <div className="text-center">
    <h1 className="font-serif text-6xl mb-4">
      Cinematic Title
    </h1>
    <p className="text-cinematic-muted text-lg">
      Subtitle text
    </p>
  </div>
</section>
```

### Movie Card
```jsx
<div className="glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform">
  <img src={poster} alt={title} className="w-full" />
  <div className="p-4">
    <h3 className="font-serif text-xl mb-2">{title}</h3>
    <p className="text-cinematic-muted text-sm">{description}</p>
  </div>
</div>
```

### Button Styles
```jsx
// Primary button
<button className="bg-electric-blue hover:bg-[#0080dd] text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Watch Now
</button>

// Ghost button
<button className="border border-electric-blue text-electric-blue hover:bg-electric-blue hover:text-white px-6 py-3 rounded-lg font-medium transition-all">
  Learn More
</button>
```

## Effects

### Film Grain
Applied globally via body::after pseudo-element. For additional grain on specific elements, use `.film-grain` class.

### Subtle Glow
Background has subtle radial gradients with electric blue tones for depth.

### Animations
- `animate-fade-in-up` - Fade in with upward motion
- `animate-glow-pulse` - Pulsing glow effect
- `hover:scale-105` - Subtle scale on hover

## Best Practices

1. **Minimal UI**: Keep interfaces clean with plenty of negative space
2. **Serif for Impact**: Use Playfair Display for headings and important text
3. **Sans for Readability**: Use Inter for body text and UI elements
4. **Electric Blue Sparingly**: Use as accent, not dominant color
5. **Film Grain**: Already applied globally, don't overuse
6. **Dark Hierarchy**: Use subtle variations of dark grays for depth
7. **Smooth Transitions**: Always include transition classes for interactive elements

## Inspiration References
- Netflix: Dark UI, bold typography, minimal chrome
- HBO Max: Elegant serif fonts, sophisticated color palette
- A24: Moody aesthetics, film grain, artistic presentation
