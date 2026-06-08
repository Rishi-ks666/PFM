# Fintech Dashboard Design System

This design system provides a comprehensive, modern, premium fintech dashboard experience. It is strictly utility-driven, utilizing Tailwind CSS classes to create scalable, responsive, and accessible UI components.

## 1. Color Palette

A dark, modern fintech UI relying on deep slate backgrounds and vibrant emerald/blue accents.

### Core Colors
- **Background Layer (Base):** `bg-slate-950` (Deepest dark for app background)
- **Surface Layer (Card):** `bg-slate-900` (Elevated cards and panels)
- **Surface Layer Hover:** `bg-slate-800` (Interactive surfaces)
- **Glassmorphism Overlay:** `bg-slate-900/60 backdrop-blur-xl`

### Brand & Semantic Colors
- **Primary (Emerald):** `bg-emerald-500` | Hover: `hover:bg-emerald-400` | Muted: `bg-emerald-500/10 text-emerald-400`
- **Secondary (Electric Blue):** `bg-blue-500` | Hover: `hover:bg-blue-400` | Muted: `bg-blue-500/10 text-blue-400`
- **Success:** `bg-emerald-500` | Text: `text-emerald-400`
- **Warning:** `bg-amber-500` | Text: `text-amber-400`
- **Danger:** `bg-rose-500` | Text: `text-rose-400`

### Grayscale / Text
- **Text Main (High Contrast):** `text-slate-50` (Headings, primary data)
- **Text Secondary (Medium Contrast):** `text-slate-300` (Body copy, labels)
- **Text Muted (Low Contrast):** `text-slate-500` (Placeholders, disabled text)
- **Border Subtle:** `border-slate-800`
- **Border Focus:** `border-emerald-500`

## 2. Typography Hierarchy

Using a clean, modern sans-serif stack (e.g., Inter) mapped to Tailwind utilities.

- **Display Text:** `text-4xl sm:text-5xl font-bold tracking-tight text-slate-50 leading-tight` (Dashboard hero metrics)
- **Heading 1:** `text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50 leading-snug` (Page titles)
- **Heading 2:** `text-xl font-semibold text-slate-100 leading-snug` (Section headers)
- **Heading 3 (Card Titles):** `text-base font-medium text-slate-200`
- **Body Text:** `text-sm font-normal text-slate-300 leading-relaxed`
- **Caption / Metadata:** `text-xs font-medium text-slate-500 uppercase tracking-wider`
- **Label:** `text-sm font-medium text-slate-300 mb-1.5 block`

## 3. Spacing System

Based on the standard 8px Tailwind scale.

- **Page Layout Padding:** `p-6 sm:p-8 lg:p-10` (Outer dashboard bounds)
- **Section Spacing (Y-axis):** `space-y-8` (Between major vertical sections)
- **Grid Gap:** `gap-6` (Between cards in a dashboard grid)
- **Card Inner Padding:** `p-5 sm:p-6`
- **Element Spacing:** `space-y-4` (Between form inputs or list items)
- **Component Padding (Buttons/Inputs):** `px-4 py-2` (Standard) or `px-3 py-1.5` (Small)

## 4. Border Radius System

- **Small (Inputs, Badges):** `rounded-md`
- **Medium (Buttons, Small Cards):** `rounded-lg`
- **Large (Dashboard Cards, Modals):** `rounded-xl`
- **Extra Large (Hero Sections):** `rounded-2xl`
- **Pill (Status Badges, Tags):** `rounded-full`

## 5. Reusable Button Styles

- **Primary Button:** `bg-emerald-500 text-slate-950 font-medium rounded-lg px-4 py-2 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`
- **Secondary Button:** `bg-slate-800 text-slate-200 font-medium rounded-lg px-4 py-2 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors`
- **Outline Button:** `border border-slate-700 text-slate-300 font-medium rounded-lg px-4 py-2 hover:bg-slate-800 hover:text-slate-100 transition-colors`
- **Ghost Button:** `text-slate-400 font-medium rounded-lg px-4 py-2 hover:bg-slate-800/50 hover:text-slate-200 transition-colors`
- **Destructive Button:** `bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium rounded-lg px-4 py-2 hover:bg-rose-500/20 hover:text-rose-300 transition-colors`
- **Icon Button:** `p-2 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-slate-200 transition-colors`

## 6. Reusable Card Styles

- **Standard Dashboard Card:** `bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm`
- **Glassmorphism Card:** `bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-lg`
- **Elevated/Interactive Card:** `bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md hover:border-emerald-500/50 hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer`
- **Stat Card (Metric Highlight):** `bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6`

## 7. Reusable Input Styles

- **Text Input / Select:** `w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`
- **Search Bar (with Icon Padding):** `w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors`
- **Input Group Container:** `space-y-1.5`
- **Validation Error Input:** `border-rose-500 focus:border-rose-500 focus:ring-rose-500`

## 8. Reusable Table Styles

- **Table Container:** `w-full text-left border-collapse whitespace-nowrap`
- **Table Header (Sticky):** `bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-10`
- **Header Cell:** `py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider`
- **Table Row:** `border-b border-slate-800/50 hover:bg-slate-800/25 transition-colors`
- **Table Data Cell (Standard):** `py-4 px-4 text-sm text-slate-300`
- **Table Data Cell (Primary/Amount):** `py-4 px-4 text-sm font-medium text-slate-100`

## 9. Reusable Badge Styles

- **Success Badge (Completed/Active):** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`
- **Warning Badge (Pending):** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20`
- **Error Badge (Failed/Cancelled):** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20`
- **Info/Neutral Badge (Draft/Archived):** `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700`

## 10. Animation & Interaction System

- **Standard Hover Transition:** `transition-all duration-200 ease-in-out`
- **Card Lift on Hover:** `hover:-translate-y-1 hover:shadow-lg transition-transform duration-300`
- **Button Active State:** `active:scale-95 transition-transform`
- **Loading Skeleton:** `animate-pulse bg-slate-800 rounded`
- **Focus Ring:** `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-emerald-500`
