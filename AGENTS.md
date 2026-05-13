# AGENTS.md - FabTops E-Commerce Platform

## 1. Project Overview & Identity
**FabTops** is a contemporary, premium fashion brand rooted in confidence, femininity, and self-expression. The digital presence must feel like a **digital flagship store**, not just an online shop.

### Brand DNA
- **Tone:** Minimal, Sophisticated, Feminine but Powerful, Editorial, Aspirational.
- **Target Audience:** Modern, evolving women interested in quality, fit, and statement pieces.
- **Visual References:** Moneo The Label, House of CB, Re girl.
- **Key Aesthetics:** Clean/minimal layouts, strong product imagery, whitespace-driven, premium spacing, smooth interactions, no clutter.

## 2. Technical Stack & Architecture
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS (Utility-first, custom design tokens for luxury feel)
- **UI Components:** Shadcn/UI (Radix Primitives) + Custom Editorial Components
- **Animations:** Framer Motion (Subtle, staggered, luxury-grade micro-interactions)
- **E-Commerce Backend:** Shopify (Headless via Storefront API)
- **Database/State:** Neon (PostgreSQL) for user data/membership; React Context/Zustand for cart state
- **Payments:** Paystack (NGN), Stripe (USD, GBP)
- **Image Optimization:** Next/Image with blur-up placeholders and strict aspect ratio enforcement

## 2.1 Brand Color Palette (Extracted from Assets)
*Implement these exact hex codes in `tailwind.config.ts`.*

**Primary Colors (Feminine & Bold)**
- **`brand-primary`**: `#F8ACAE` (Rose Pink) - *Used for primary buttons, active states.*
- **`brand-secondary`**: `#ED99BB` (Soft Pink) - *Used for hover states, secondary backgrounds.*
- **`brand-accent`**: `#BF88BD` (Mauve) - *Used for highlights, tags, or distinct UI elements.*
    - *Note: Brand asset shows an orange swatch next to this code, but the hex is Mauve. Prioritize the Hex Code `#BF88BD` for consistency unless directed otherwise.*

**Secondary Colors (Structural & Neutral)**
- **`brand-purple`**: `#937FBE` (Lavender) - *Used for subtle accents or "Fab Babe" membership features.*
- **`brand-dark`**: `#3B3B44` (Charcoal) - *Primary text color, headings, footer background.*
- **`brand-light`**: `#F9EBE8` (Cream/Off-White) - *Main page background color (replaces stark white for a softer, premium feel).*

## 3. Core Design Principles (UI/UX Pro Max)
1. **Whitespace is Luxury:** Use generous padding/margins. Avoid clutter. Every element must serve a purpose.
2. **Typography Hierarchy:** Strong contrast between headings (Editorial/Serif or Bold Sans) and body text (Clean Sans).
3. **Imagery First:** Product images are the heroes. Use full-bleed sections where appropriate.
4. **Mobile-First Priority:** 70%+ traffic is mobile. Touch targets must be large, navigation intuitive (bottom sheets/modals for filters).
5. **Performance as UX:** Fast load speeds are non-negotiable. Use Server Components for static content, Client Components only for interactivity.
6. **Soft Luxury UI:** Avoid harsh black (`#000000`). Use `#3B3B44` for text. Use `#F9EBE8` for backgrounds to maintain the warm, premium aesthetic.

## 4. Page Specifications & Component Architecture

### A. Global Layout
- **Header:** Transparent on Hero, solid `#F9EBE8` (or white) on scroll. Minimal logo center/left. Icons for Cart, Search, Account right.
- **Footer:** Clean, multi-column. Newsletter signup prominent. Social links. Legal/Currency selector. Background: `#3B3B44` (Dark) or `#F9EBE8` (Light) depending on section.
- **Navigation:** Mega-menu for desktop (image-rich categories), Drawer/Bottom Sheet for mobile.

### B. Homepage (`/`)
- **Hero Section:** Full-screen video or high-res image. Minimal text overlay. CTA: "Shop New Collection" (Button color: `#F8ACAE`).
- **New Collection Showcase:** Horizontal scroll or grid with hover effects (image swap or zoom).
- **Brand Statement:** Editorial typography block. Short, impactful copy.
- **Category Navigation:** Visual tiles for Tops, Sets, Dresses, Accessories, Archive.
- **Featured Products:** Curated carousel. "Quick Add" on hover (desktop).
- **Fab Babe Circle Banner:** Exclusive membership teaser (Accent color: `#937FBE`).
- **Sustainability Preview:** Icon-based minimal section.

### C. Shop/Collection Pages (`/shop/[category]`)
- **Layout:** Sidebar filters (desktop) / Bottom Sheet filters (mobile). Grid layout (2-col mobile, 3-4 col desktop).
- **Filters:** Size, Price, Category, Color. Smooth accordion animations.
- **Product Card:** 
  - Image container with aspect-ratio preservation.
  - Hover: Secondary image or quick-add button.
  - Info: Title, Price (multi-currency), Color swatches (if applicable).
  - No clutter: Hide non-essential info until hover/click.

### D. Product Detail Page (`/product/[handle]`)
- **Gallery:** Sticky left column (desktop). Swipeable carousel (mobile). Zoom on hover/click. Video support.
- **Info Panel:** Sticky right column (desktop). 
  - Title, Price, Currency Selector.
  - Size Selector: Visual buttons. Link to Size Guide modal.
  - Add to Cart: Prominent, full-width button (Background: `#3B3B44` or `#F8ACAE`, Text: White/Contrast).
  - Description: Accordion style for Fit, Fabric, Care, Delivery.
  - "Styled With": Cross-sell carousel below main info.
- **UX Note:** Ensure "Add to Cart" feedback is immediate (toast notification + cart drawer open).

### E. About Page (`/about`)
- **Storytelling:** Vertical scroll narrative. Parallax images. Large typography.
- **Vision/Identity:** Clean sections with ample whitespace.

### F. Fab Babe Circle (`/membership`)
- **Benefits:** Icon-grid layout (Discounts, Early Access, Exclusive Drops).
- **Sign-Up:** Integrated email capture form. Success state animation.

### G. Archive Page (`/archive`)
- **Concept:** Sold-out items displayed with reduced opacity or grayscale.
- **Goal:** Build desirability. "Join Waitlist" or "Notify Me" instead of Add to Cart.

## 5. Functional Requirements & Integrations

### E-Commerce Logic
- **Cart:** Slide-out drawer. Edit quantities, remove items. Real-time total calculation.
- **Checkout:** Guest checkout enabled. Seamless handoff to Shopify Checkout or custom Stripe/Paystack integration.
- **Multi-Currency:** Auto-detect location or manual toggle. Persist preference in cookie/localStorage.

### Animations & Interactions (Framer Motion)
- **Page Transitions:** Soft fade-in/slide-up for content blocks.
- **Scroll Animations:** Elements fade in as they enter viewport (`whileInView`).
- **Hover Effects:** Subtle scale (1.02x) or opacity changes on buttons/cards.
- **Loading States:** Skeleton loaders matching final layout shape.

### Performance Optimization
- **Next.js Image:** Use `sizes` prop correctly. Prioritize LCP image (Hero).
- **Font Optimization:** Next/font for zero-layout-shift.
- **Code Splitting:** Dynamic imports for heavy components (e.g., Map, Complex Carousels).

## 6. Development Guidelines for AI Agents

### When Generating Code:
1. **Use Server Components by Default:** Only use `'use client'` when necessary (hooks, event listeners).
2. **Tailwind Best Practices:** Use semantic class names via `clsx` or `cn` utility. Avoid arbitrary values unless necessary for specific design tokens.
3. **Component Structure:** 
   - `components/ui/` for shadcn primitives.
   - `components/editorial/` for brand-specific layouts (Hero, ProductCard).
   - `lib/shopify/` for API calls.
4. **Accessibility:** Ensure all interactive elements have aria-labels. Keyboard navigable. Contrast ratios meet WCAG AA (Check text on `#F8ACAE` carefully).
5. **Responsiveness:** Test mobile views first. Use `md:`, `lg:` prefixes for desktop enhancements.

### When Designing UI:
1. **Reference the "Luxury" Feel:** If a component feels crowded, remove elements or increase padding.
2. **Typography:** Use consistent font weights. Bold for emphasis, light for elegance.
3. **Color Palette Application:**
   - **Backgrounds:** Primarily `#F9EBE8` (Cream) or White.
   - **Text:** `#3B3B44` (Charcoal). Avoid pure black.
   - **Primary Actions:** `#F8ACAE` (Rose) or `#3B3B44` (Dark) depending on context.
   - **Accents:** Use `#BF88BD` (Mauve) and `#937FBE` (Purple) sparingly for badges, sale tags, or membership highlights.

## 7. Success Metrics & QA Checklist
- [ ] **LCP < 2.5s** on mobile 4G.
- [ ] **CLS < 0.1** (No layout shifts).
- [ ] **Smooth Scrolling:** No jank on mobile.
- [ ] **Cart Functionality:** Add, remove, update quantity works without page reload.
- [ ] **Currency Switching:** Updates prices instantly across the site.
- [ ] **Mobile Navigation:** Easy to reach thumb zones.
- [ ] **Color Contrast:** Ensure `#F8ACAE` text on white backgrounds passes accessibility standards (might need dark text on light pink buttons).

## 8. File Structure Recommendation
```
/app
  /(shop)
    /page.tsx (Homepage)
    /product/[handle]/page.tsx
    /collection/[handle]/page.tsx
  /about/page.tsx
  /membership/page.tsx
  /archive/page.tsx
/components
  /editorial
    Hero.tsx
    ProductCard.tsx
    CollectionGrid.tsx
  /ui
    Button.tsx
    Input.tsx
    Drawer.tsx
  /layout
    Header.tsx
    Footer.tsx
    CartDrawer.tsx
/lib
  /shopify
    queries.ts
    actions.ts
  /utils.ts
/styles
  globals.css
```

## 9. Notes for Prompt Engineering
- When asking for component code, specify: "Use Next.js App Router, Tailwind CSS, and Framer Motion. Ensure accessibility and mobile responsiveness."
- When asking for design advice, reference: "House of CB minimalism" or "Moneo The Label editorial style."
- Always prioritize **performance** and **brand consistency** over complex, unnecessary features.
- **Color Check:** "Ensure the background is `#F9EBE8` and text is `#3B3B44`."
```