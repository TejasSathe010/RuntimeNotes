# RuntimeNotes

A modern, performant blog platform built with React, featuring advanced animations, intelligent search, and seamless markdown rendering. This project is a complete migration and modernization of my previous blog website, which I've been writing on since 2023.

## 📚 About

RuntimeNotes is an engineering blog focused on **System Design**, **GenAI**, **Architecture**, and **DSA**. It's built with developer experience in mind, offering a clean, fast, and accessible reading experience with advanced features like real-time search, intelligent post filtering, and interactive code playgrounds.

## ✨ Features

### Core Functionality
- **Multi-source Post Management**: Supports both local markdown files and GitHub-based CMS for dynamic content management
- **Intelligent Search**: Real-time fuzzy search with highlighting using Fuse.js
- **Advanced Filtering**: Filter by category, tags, and reading time with URL-synced state
- **Command Palette**: Keyboard-driven navigation (⌘K) for power users
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark Mode**: Built-in dark mode support with smooth transitions

### Reading Experience
- **Interactive Table of Contents**: Auto-generated TOC with scroll tracking and section links
- **Smart Quote Selection**: Copy quotes directly from selected text with attribution
- **Reading Time Estimation**: Automatic calculation based on word count
- **Related Posts**: Intelligent post recommendations based on category and tags
- **Save for Later**: Bookmark posts for quick access
- **Recent Posts Tracking**: Automatically tracks reading history

### Developer Features
- **Code Playgrounds**: Interactive code execution with Sandpack for JS/TS/JSX/TSX
- **Syntax Highlighting**: Beautiful code highlighting with Highlight.js
- **React Flow Diagrams**: Embed interactive flow diagrams directly in posts
- **Takeaway Cards**: Extract and display key takeaways from posts
- **Markdown Extensions**: Full support for GFM, math (KaTeX), and custom components

### Performance & UX
- **Smooth Animations**: Framer Motion animations with reduced motion support
- **Optimistic UI Updates**: Instant feedback with toast notifications
- **Lazy Loading**: Code-split components for faster initial load
- **URL State Management**: All filters and search persist in URL for shareable links
- **SEO Optimized**: Meta tags, structured data, and OpenGraph support

## 🏗️ Architecture

### Component Structure

```
src/
├── pages/              # Top-level page components
│   ├── Home.jsx       # Blog listing with search & filters
│   ├── Post.jsx       # Individual post view
│   └── About.jsx      # About page
├── components/         # Reusable components
│   ├── home/          # Home page specific components
│   │   ├── SearchBar.jsx
│   │   ├── PostGrid.jsx
│   │   ├── CommandPalette.jsx
│   │   └── ...
│   ├── post/          # Post page specific components
│   │   ├── PostHeader.jsx
│   │   ├── TocSidebar.jsx
│   │   ├── JumpPalette.jsx
│   │   └── ...
│   └── ...
├── utils/              # Utility functions
│   ├── common.js      # Shared utilities
│   ├── posts.js       # Post fetching logic
│   ├── markdown.js    # Markdown processing
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js
│   ├── useToast.js
│   └── usePrefersReducedMotion.js
└── config/             # Configuration
    ├── github.js      # GitHub CMS config
    └── posts-manifest.json
```

### Data Flow

1. **Post Sources**: Posts can come from:
   - Local markdown files (`src/posts/`)
   - GitHub repository (configured in `config/github.js`)
   - Posts manifest for optimized loading

2. **State Management**:
   - React hooks for local state
   - `localStorage` for persistence (saved posts, reading history)
   - URL query params for shareable filter states
   - Session storage for post caching

3. **Rendering Pipeline**:
   - Markdown → `react-markdown` → Custom components → React elements
   - Code blocks → Highlight.js or Sandpack (for interactive code)
   - Frontmatter → YAML parsing → Post metadata

## 🔧 Advanced React Concepts

This project demonstrates several advanced React patterns and concepts:

### 1. **Custom Hooks for Reusability**
- `useLocalStorage`: Synchronized state with localStorage
- `useToast`: Centralized toast notification management
- `usePrefersReducedMotion`: Respect user motion preferences

### 2. **Performance Optimizations**
- `useMemo` for expensive computations (filtering, sorting)
- `useDeferredValue` for search input debouncing
- `useCallback` for stable function references
- Lazy loading with `React.lazy()` for code playgrounds
- Component code-splitting for optimal bundle sizes

### 3. **Advanced State Management**
- URL state synchronization with `useSearchParams`
- Optimistic UI updates with rollback capability
- Multi-tab synchronization using `storage` events
- Complex state machines (search, filters, UI states)

### 4. **Composition Patterns**
- Component composition over inheritance
- Render props for flexible component APIs
- Compound components (CommandPalette, FilterBadges)
- Higher-order patterns with custom hooks

### 5. **Accessibility (a11y)**
- ARIA labels and roles
- Keyboard navigation support
- Focus management in modals
- Screen reader announcements
- Reduced motion support

### 6. **Animation Orchestration**
- Layout animations with `LayoutGroup`
- Page transition animations
- Staggered list animations
- Entrance/exit animations with `AnimatePresence`
- Scroll-triggered animations

### 7. **Advanced Markdown Processing**
- Custom remark plugins for heading IDs
- Rehype plugins for code highlighting
- Dynamic component rendering based on content
- Meta data extraction from code blocks

### 8. **Real-time Features**
- Intersection Observer for scroll tracking
- Selection API for quote copying
- Clipboard API integration
- Keyboard shortcut handling

## 🛠️ Tech Stack

### Core
- **React 19.1.1** - Latest React with concurrent features
- **React Router 7.9.3** - Client-side routing
- **Vite 7.1.14** (rolldown) - Fast build tool with Rust-based bundler

### UI & Styling
- **Tailwind CSS 4.1.14** - Utility-first CSS framework
- **Framer Motion 12.23.22** - Production-ready motion library
- **Lucide React** - Beautiful icon library

### Content Processing
- **react-markdown 10.1.0** - Markdown renderer
- **remark-gfm** - GitHub Flavored Markdown
- **rehype-highlight** - Syntax highlighting
- **gray-matter** - Frontmatter parsing
- **js-yaml** - YAML parsing

### Search & Utilities
- **Fuse.js 7.1.0** - Fuzzy search library
- **date-fns 4.1.0** - Date formatting utilities
- **highlight.js** - Code syntax highlighting

### Interactive Features
- **@codesandbox/sandpack-react** - Interactive code playgrounds
- **reactflow** - Interactive diagram rendering
- **katex** - Math rendering

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd arch-blog

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Configuration

#### GitHub CMS (Optional)
If you want to use GitHub as a CMS for posts:

1. Create a `config/posts-manifest.json` from `config/posts-manifest.json.example`
2. Configure `src/config/github.js` with your repository details:
   ```javascript
   export const GITHUB_CONFIG = {
     OWNER: 'your-username',
     REPO: 'your-posts-repo',
     BRANCH: 'main',
     ENABLE_CACHE: true,
     CACHE_TTL: 3600000,
   };
   ```

#### Local Posts
Place markdown files in `src/posts/` with frontmatter:

```markdown
---
title: "Your Post Title"
date: "2024-01-01"
category: "SystemDesign"
tags: ["architecture", "design"]
summary: "Brief description"
---

Your content here...
```

### Building for Production

```bash
npm run build
npm run preview
```

## 📝 Development Journey

This project represents a complete rewrite and modernization of my original blog. Key improvements include:

### From Old Blog (2023)
- Static site generation → Dynamic React app
- Basic markdown → Rich interactive markdown with custom components
- Simple navigation → Advanced search, filtering, and command palette
- Single-source posts → Multi-source (local + GitHub CMS)
- Basic styling → Comprehensive design system with animations

### Architecture Decisions
- **Component-first approach**: Each feature is a self-contained, reusable component
- **Utility extraction**: Common logic moved to shared utilities for maintainability
- **Performance-first**: Lazy loading, memoization, and code-splitting throughout
- **Accessibility built-in**: A11y considerations from the ground up
- **Developer experience**: Clear structure, TypeScript-ready, comprehensive error handling

## 🎨 Design Philosophy

- **Performance**: Fast initial load, smooth interactions, optimized rendering
- **Accessibility**: Works for everyone, respects user preferences
- **Developer Experience**: Clean code, reusable components, maintainable structure
- **User Experience**: Intuitive navigation, helpful features, beautiful design

## 📄 License

Private project - All rights reserved

## 👤 Author

**Tejas Sathe**
- GitHub: [@tejassathe010](https://github.com/tejassathe010)
- LinkedIn: [tejas-sathe010](https://www.linkedin.com/in/tejas-sathe010/)

---
