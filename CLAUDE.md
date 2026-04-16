# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Hugo static blog** using the `hugo-theme-reimu` theme. The blog is configured for Chinese language content (zh-CN) and deployed to https://ziyou814.top/.

## Common Development Commands

### Hugo Commands
```bash
# Development server (runs in pblog directory)
cd pblog && hugo server

# Build production site
cd pblog && hugo

# Build with clean output
cd pblog && hugo --cleanDestinationDir

# Create new content
cd pblog && hugo new content post/my-new-post.md
```

### Theme Development (in themes/reimu/)
```bash
cd pblog/themes/reimu

# Install dependencies
npm install

# Format code (prettier)
npx prettier --write .

# Create commits with conventional commits
pnpx git-cz

# Commit linting
npx commitlint --edit $1
```

## Architecture

### Directory Structure
```
pblog/
├── archetypes/          # Content templates (default.md)
├── assets/             # SCSS, JS assets
├── config/             # Theme configuration
│   └── _default/
│       └── params.yml  # Main theme parameters
├── content/            # Blog content
│   ├── post/          # Blog posts
│   ├── archives/      # Archive pages
│   ├── about.md       # About page
│   └── friend.md      # Friends/links page
├── data/              # Data files for theme
├── layouts/           # Custom layout overrides
│   └── partials/      # Partial template overrides
├── public/            # Generated static site (build output)
├── static/            # Static assets (images, etc.)
├── themes/            # Theme directory
│   └── reimu/         # hugo-theme-reimu (git submodule)
└── hugo.toml         # Main Hugo configuration
```

### Key Configuration Files

**hugo.toml**: Main Hugo configuration
- Base URL: https://ziyou814.top/
- Language: Chinese (zh-CN) with CJK support
- Theme: reimu
- Goldmark renderer with HTML passthrough (unsafe: true)
- GitHub-style syntax highlighting with line numbers

**config/_default/params.yml**: Comprehensive theme configuration covering:
- UI settings (sidebar position: right, dark mode: auto)
- Comment system (Giscus enabled)
- Social links (GitHub)
- Analytics (disabled)
- Music player (Aplayer + Meting with NetEase API)
- Animations (AOS.js scroll animations)
- Fireworks mouse interaction effects
- Custom Reimu-themed cursor

### Content Frontmatter
```yaml
---
title: 'Post Title'
date: 2026-04-13T00:00:00+08:00
lastmod: 2026-04-13T00:00:00+08:00
cover: /images/covers/cover1.jpg
categories: [Category1, Category2]
tags: [tag1, tag2]
description: 'Post description'
math: false        # Enable KaTeX math formulas
mermaid: false     # Enable Mermaid diagrams
comments: true     # Enable Giscus comments
sidebar: right     # Override sidebar position
toc: true          # Table of contents
---
```

## Theme Customization

### Override Strategy
- **Layouts**: Create files in `layouts/` to override theme templates
- **Assets**: Place files in `assets/` to override theme assets
- **Static**: Override static files in `static/`

### Custom Styles
Custom header styles are injected via `params.yml`:
```yaml
injector:
  head_end: |
    <style>
    #header img {
      top: -10px;
    }
    </style>
```

### Color Theme
Custom color scheme defined in `internal_theme` section (blue-based Google colors in light mode, GitHub dark in dark mode).

## Key Features

### Interactive Elements
- **Comments**: Giscus (GitHub Discussions-based)
- **Music**: Aplayer with Meting API (NetEase Cloud Music)
- **Animations**: AOS.js scroll animations
- **Fireworks**: Mouse click effects
- **Custom Cursor**: Reimu-themed cursors

### Content Features
- **Shortcodes**: Custom HTML components (link cards, tabs, galleries, heatmap, tag roulette)
- **Math**: KaTeX support (default)
- **Diagrams**: Mermaid support
- **Syntax Highlighting**: GitHub-style with copy functionality
- **Dark Mode**: Auto-detect system preference

### Performance
- PJAX enabled for partial page loading
- Pace.js for loading progress
- Lazy loading for images
- Quicklink prefetching (disabled)

## Deployment

1. Build: `cd pblog && hugo`
2. Deploy `public/` directory to static hosting
3. Site configured for GitHub Pages or similar platforms

## Working Directory

Always work in the `pblog/` directory when running Hugo commands, as it contains the hugo.toml configuration file.
