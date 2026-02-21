# AveronSoft Design System

Modern SaaS aesthetic inspired by Linear, Vercel, Notion, and Raycast

---

## ✅ Implementation Status

### Completed
- ✅ CSS Variables and color system
- ✅ Typography system
- ✅ Spacing system
- ✅ Component base styles (Button, Card)
- ✅ Utility classes
- ✅ Dark-first color scheme
- ✅ Build successfully compiling

### In Progress
- ⏳ Full UI component rebuild
- ⏳ Minimal geometric illustrations
- ⏳ Homepage redesign
- ⏳ Tool pages redesign

---

## 1. COLOR SYSTEM (Dark-first)

### Base Colors
```css
--background: #0D0D0D (deep neutral black)
--surface: #111111
--surface-elevated: #161616
--surface-hover: #1A1A1A
--border: rgba(255,255,255,0.08)
--border-hover: rgba(255,255,255,0.12)
```

### Text Colors
```css
--foreground: rgba(255,255,255,0.92) (primary text)
--foreground-secondary: rgba(255,255,255,0.65)
--foreground-muted: rgba(255,255,255,0.45)
```

### Accent Colors
```css
--primary: #3B82F6 (blue)
--primary-hover: #60A5FA
--success: #22C55E (green)
--warning: #FACC15 (yellow)
--error: #EF4444 (red)
```

### Shadows
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3)
--shadow: 0 4px 12px 0 rgb(0 0 0 / 0.4)
--shadow-lg: 0 10px 24px 0 rgb(0 0 0 / 0.5)
```

---

## 2. TYPOGRAPHY SYSTEM

### Font Stack
```css
font-family: Inter, SF Pro, system-ui, sans-serif
```

### Scale
- **H1**: 48–64px, tight leading (3rem → 4rem)
- **H2**: 32–40px (1.875rem → 2.25rem)
- **H3**: 24–28px (1.5rem → 1.875rem)
- **Body**: 16–18px (base)
- **Small**: 13–14px (0.875rem)

### Properties
- **Headings**: font-weight: 600, letter-spacing: -0.025em
- **Body**: line-height: 1.5
- **Font smoothing**: antialiased

---

## 3. SPACING SYSTEM

8px grid system:
```css
--xs: 8px
--sm: 12px
--md: 16px
--lg: 24px
--xl: 32px
--xxl: 48px
```

Section padding: 96px (6rem) top/bottom, 128px (8rem) on large screens

---

## 4. LAYOUT SYSTEM

### Grid
- Max width: 1200px (80rem)
- Centered content
- 12-column grid
- Large whitespace around sections

### Container
```css
.container-custom {
  margin: 0 auto;
  max-width: 80rem;
  padding: 1rem; /* 1.5rem on sm, 2rem on lg */
}
```

---

## 5. COMPONENT SYSTEM

### Buttons

#### Primary Button
```tsx
<Button variant="default">Primary Action</Button>
```
- Background: `rgb(var(--primary))`
- Text: `rgb(var(--primary-foreground))`
- Hover: `brightness(1.1)`
- Active: `scale(0.98)`
- Transition: 150ms

#### Secondary Button
```tsx
<Button variant="secondary">Secondary Action</Button>
```
- Background: `rgb(var(--surface))`
- Border: `1px solid rgb(var(--border))`
- Hover: `background-color: rgb(var(--surface-hover))`
- Active: `scale(0.98)`

#### Ghost Button
```tsx
<Button variant="ghost">Ghost Action</Button>
```
- Transparent background
- Hover: accent background

#### Destructive Button
```tsx
<Button variant="destructive">Delete</Button>
```
- Background: `rgb(var(--destructive))`
- Hover: `brightness(1.1)`

### Cards

```tsx
<Card className="surface">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

- Background: `rgb(var(--surface))`
- Border: `1px solid rgb(var(--border))`
- Border radius: 6px
- Shadow: `var(--shadow-sm)`
- Padding: 24px (1.5rem)

#### Card Hover Effect
```css
.card-hover {
  transition: all 200ms;
}

.card-hover:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
  border-color: rgb(var(--border-hover));
}
```

### Inputs

```tsx
<input className="input-field" />
```

- Background: `rgb(var(--input))`
- Border: `1px solid rgb(var(--border))`
- Border radius: 6px
- Padding: 0.5rem 0.75rem
- Focus: `ring: 2px solid rgb(var(--primary))`

---

## 6. UTILITY CLASSES

### Surface Classes
```css
.surface {
  background-color: rgb(var(--surface));
  border: 1px solid rgb(var(--border));
}

.surface-elevated {
  background-color: rgb(var(--surface-elevated));
  border: 1px solid rgb(var(--border));
}
```

### Text Classes
```css
.gradient-text {
  background: linear-gradient(to right, rgb(var(--foreground)), rgb(var(--foreground) / 0.7));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.text-balance {
  text-wrap: balance;
}
```

### Layout Classes
```css
.section-padding {
  padding-top: 6rem;
  padding-bottom: 6rem;
}

@media (min-width: 1024px) {
  .section-padding {
    padding-top: 8rem;
    padding-bottom: 8rem;
  }
}
```

---

## 7. INTERACTION DESIGN

### Transitions
- Default: 150–200ms
- Easing: ease-in-out

### Hover States
- Cards: `scale(1.02)` + shadow increase
- Buttons: brightness increase or background change
- Links: color transition

### Active States
- Buttons: `scale(0.98)`

### Focus States
- Ring: `2px solid rgb(var(--primary))`
- Ring offset: 2px

---

## 8. RESPONSIVE DESIGN

### Breakpoints
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Grid layouts collapse on mobile
- Navigation becomes hamburger menu

---

## 9. USAGE EXAMPLES

### Hero Section
```tsx
<section className="section-padding">
  <div className="container-custom">
    <h1 className="gradient-text mb-4">
      Professional Tools for Modern Professionals
    </h1>
    <p className="text-lg text-foreground-secondary mb-8">
      Streamline your digital workflow
    </p>
    <div className="flex gap-4">
      <Button size="lg">Get Started</Button>
      <Button size="lg" variant="secondary">Learn More</Button>
    </div>
  </div>
</section>
```

### Tool Card
```tsx
<Card className="card-hover">
  <CardHeader>
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <CardTitle>URL Shortener</CardTitle>
    <CardDescription>
      Create short, trackable links
    </CardDescription>
  </CardHeader>
  <CardContent>
    <Button className="w-full">Try it now</Button>
  </CardContent>
</Card>
```

### Form Input
```tsx
<div>
  <label className="block text-sm font-medium mb-2">
    Email Address
  </label>
  <input
    type="email"
    className="input-field w-full"
    placeholder="you@example.com"
  />
</div>
```

---

## 10. LIGHT MODE SUPPORT

Light mode colors (automatically applied with `.light` class):

```css
.light {
  --background: 255 255 255;
  --surface: 249 249 249;
  --surface-elevated: 245 245 245;
  --surface-hover: 240 240 240;
  
  --border: 0 0 0 / 0.08;
  --foreground: 0 0 0 / 0.92;
  --foreground-secondary: 0 0 0 / 0.65;
  --foreground-muted: 0 0 0 / 0.45;
  
  --primary: 59 130 246;
  --primary-hover: 37 99 235;
}
```

---

## 11. ACCESSIBILITY

### Color Contrast
- Primary text: WCAG AAA compliant
- Secondary text: WCAG AA compliant
- Interactive elements: Clear focus indicators

### Focus Management
- All interactive elements have visible focus states
- Focus ring: 2px solid primary color
- Focus ring offset: 2px

### Keyboard Navigation
- All buttons and links are keyboard accessible
- Tab order follows logical flow
- Skip links for main content

---

## 12. PERFORMANCE

### CSS Optimization
- CSS variables for dynamic theming
- Minimal custom CSS
- Tailwind for utility classes
- No unused CSS in production

### Animation Performance
- Hardware-accelerated transforms
- Debounced hover effects
- Smooth 60fps animations

---

## 13. BROWSER SUPPORT

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

---

## 14. DESIGN PRINCIPLES

1. **Consistency**: Uniform spacing, colors, and typography
2. **Clarity**: Clear hierarchy and visual flow
3. **Simplicity**: Minimal, clean, no clutter
4. **Feedback**: Clear hover, focus, and active states
5. **Accessibility**: Proper contrast and focus indicators
6. **Performance**: Fast, smooth, optimized

---

## 15. NEXT STEPS

To complete the design system implementation:

1. **Rebuild all illustrations** with minimal geometric style
2. **Redesign homepage** with clean hero and tool cards
3. **Redesign tool pages** with minimal headers and clean inputs
4. **Redesign pricing page** with clean grid and icons only
5. **Update navigation** with sticky header and backdrop blur
6. **Test all interactions** across devices

---

## 16. FILES MODIFIED

### Core Files
- `app/globals.css` - Complete design system CSS
- `tailwind.config.ts` - Updated color system
- `components/ui/button.tsx` - Rebuilt with new variants
- `components/ui/card.tsx` - Updated with surface styles

### Build Status
✅ **Build successful** - All 28 routes compiled
✅ No TypeScript errors
✅ Design system ready to use

---

**Status**: 🟡 Foundation Complete, UI Rebuild In Progress
**Next Priority**: Homepage and component redesign
