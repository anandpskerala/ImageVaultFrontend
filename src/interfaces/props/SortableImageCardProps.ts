import type { ImageItem } from "../entities/ImageItem";

export interface SortableImageCardProps {
    image: ImageItem;
    selectedImages: Set<string>;
    toggleImageSelection: (imageId: string) => void;
    setSelectedImage: (image: ImageItem | null) => void;
    isDragging?: boolean;
}