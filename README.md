# Vercel Blob Manager

[![Code Quality Check](https://github.com/iFwu/vercel-blob-manager/actions/workflows/check.yml/badge.svg)](https://github.com/iFwu/vercel-blob-manager/actions/workflows/check.yml)
[![Cypress Tests](https://github.com/iFwu/vercel-blob-manager/actions/workflows/cypress.yml/badge.svg)](https://github.com/iFwu/vercel-blob-manager/actions/workflows/cypress.yml)
[![Coverage](https://ifwu.github.io/blob-text-manager/coverage/coverage.svg)](https://ifwu.github.io/blob-text-manager/coverage/)
[![wakatime](https://wakatime.com/badge/user/f0e08818-b0bc-4d4f-88bd-328d717e0c9f/project/72746a9f-3d32-43d2-af56-c5ef51ee3c43.svg)](https://wakatime.com/badge/user/f0e08818-b0bc-4d4f-88bd-328d717e0c9f/project/72746a9f-3d32-43d2-af56-c5ef51ee3c43)

A specialized file management application built on Vercel Blob Storage. This tool provides a clean, efficient interface for managing files, making it perfect for content management systems, static assets, or any file-based workflow.

## Features

- 📁 File Management

  - Create, edit, and organize files and folders
  - Hierarchical directory structure
  - Intuitive file explorer interface
  - Drag and drop support
  - Multi-file operations

- 🎯 Core Features

  - Tree-style file explorer
  - Real-time file operations
  - Directory management
  - Clean and modern UI
  - Keyboard shortcuts

- 🛠️ Technical Features
  - Built with Next.js 15 App Router
  - Server Actions and Server Components
  - TypeScript for type safety
  - Shadcn UI components
  - Vercel Blob Storage integration
  - Efficient file organization

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm
- A Vercel account and Blob Storage access

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/vercel-blob-manager.git
cd vercel-blob-manager
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` for development
   - Add your Vercel Blob credentials

```bash
cp .env.example .env.local
```

4. Set up test environment:
   - Copy `.env.test.example` to `.env.test.local`
   - Add your test credentials (uses client-side API calls)

```bash
cp .env.test.example .env.test.local
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Testing

Run E2E tests in interactive mode:

```bash
pnpm e2e
```

Run E2E tests in headless mode:

```bash
pnpm e2e:headless
```

Run component tests:

```bash
pnpm component
```

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Storage**: Vercel Blob
- **State Management**: React Hooks
- **Testing**: Cypress
- **Development**: pnpm, ESLint, Prettier

## License

MIT License - feel free to use this project for your own purposes.
