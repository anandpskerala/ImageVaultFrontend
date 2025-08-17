# ImageVaultFrontend

<p align="center">
  <img src="https://img.shields.io/badge/node.js-000000?style=for-the-badge&logo=Node.js" />
  <img src="https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose" />
  <img src="https://img.shields.io/badge/TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Vite-20232A?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary" />
</p>

A modern, responsive web application for managing and organizing images stored on Cloudinary. Built with React, TypeScript, and Tailwind CSS, this application allows users to upload, view, search, sort, reorder, edit, delete, and download images with a seamless drag-and-drop interface.

## Features

- **Image Management**: Upload, view, edit, and delete images stored in Cloudinary.
- **Drag-and-Drop Reordering**: Reorder images using an intuitive drag-and-drop interface powered by `@dnd-kit`.
- **Search and Sort**: Search images by title and sort by title, recent upload, or custom order.
- **Bulk Actions**: Select multiple images to download as a ZIP file or delete them.
- **Edit Images**: Update image titles and replace images with new uploads.
- **Responsive Design**: Supports both grid and list views, optimized for desktop and mobile.
- **Authentication**: Integrates with an authentication system to manage user sessions.
- **Cloudinary Integration**: Stores and retrieves images from Cloudinary for efficient media management.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Drag-and-Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`
- **State Management**: Redux Toolkit
- **File Handling**: `JSZip` for ZIP downloads, `file-saver` for triggering downloads
- **Icons**: Lucide React
- **Cloudinary**: For image storage and delivery
- **Routing**: React Router DOM

## Prerequisites

- Node.js (v16 or higher)
- Pnpm
- A Cloudinary account with API credentials
- A backend API for handling image uploads, deletions, and order saving (not included in this repository)

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/anandpskerala/ImageVaultFrontend.git
   cd ImageVaultFrontend
   ````
2. **Install Dependencies:**

    ```bash
    pnpm install
    ```
3. **Set Up Environment Variables:
Create a .env file in the root directory and add the following:**

    ```
    VITE_BACKEND_URL=http://localhost:5000/api
    ```
4. **Run the Development Server:**
    ```bash
    pnpm run dev
    ```


## Project Structure
```
ImageVaultFrontend/
├── src/
│   ├── components/
│   │   ├── misc/
│   │   │   ├── LoadingSkeleton.tsx
│   │   │   ├── SortableImageCard.tsx
│   │   │   ├── SortableImageListItem.tsx
│   │   ├── partials/
│   │   │   ├── NavBar.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   ├── interfaces/
│   │   ├── entities/
│   │   │   ├── ImageItem.ts
│   ├── services/
│   │   ├── uploadService.ts
│   ├── store/
│   │   ├── index.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── UploadPage.tsx
│   ├── App.tsx
│   ├── main.tsx
├── .env
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── README.md
```

