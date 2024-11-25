# Vercel Blob Manager

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

3. Create a `.env.local` file with your Vercel Blob credentials:
```
BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Storage**: Vercel Blob
- **State Management**: React Hooks
- **Development**: pnpm, ESLint, Prettier

## License

MIT License - feel free to use this project for your own purposes.
