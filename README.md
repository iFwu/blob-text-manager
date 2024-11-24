# Blob Text Manager

A specialized text file management application built on Vercel Blob Storage. This tool focuses on providing a clean, efficient interface for managing and editing text files, making it perfect for content management systems, blog platforms, or any text-based workflow.

## Current Focus

- 📝 Pure Text File Management
  - Create, edit, and organize text files
  - Hierarchical directory structure
  - Clean and efficient text editor interface
- 🎯 Core Features
  - Tree-style file explorer
  - Real-time text editing
  - Directory management
  - Simple and intuitive UI

## Roadmap

- 📘 Markdown Support
  - Markdown editing with preview
  - Rich text formatting tools
  - Export capabilities
- 🔄 Blog Management Features
  - Post scheduling
  - Metadata management
  - Category and tag organization
- 🎨 Enhanced UI/UX
  - Theme customization
  - Keyboard shortcuts
  - Split view editing

## Technical Features

- 🛠️ Modern Stack
  - Built with Next.js 14 App Router
  - Server/Client implementation switching for testing
  - TypeScript for type safety
  - Shadcn UI components for consistent design
- 💾 Storage
  - Powered by Vercel Blob Storage
  - Efficient file organization
  - Secure file management

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- pnpm (recommended) or npm
- A Vercel account and Blob Storage access

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/iFwu/blob-text-manager.git
cd blob-text-manager
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file with your Vercel Blob credentials:
```
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
```

4. For testing with client-side implementation, create a `.env.test.local`:
```
NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"
NEXT_PUBLIC_IS_TEST="true"
```

### Development

Run the development server:
```bash
pnpm dev
# or for testing environment
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

The application uses a hybrid approach for Blob Storage operations:
- Server-side implementation (`actions.server.ts`) for production
- Client-side implementation (`actions.client.ts`) for testing
- Environment-based switching between implementations

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Components**: Shadcn UI
- **Storage**: Vercel Blob
- **State Management**: React Hooks
- **Development**: pnpm, ESLint, Prettier

## License

MIT License - feel free to use this project for your own purposes.
