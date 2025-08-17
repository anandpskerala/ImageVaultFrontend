import type { ImageItem } from "@/interfaces/entities/ImageItem";

export interface SortableImageListItemProps {
    image: ImageItem;
    setSelectedImage: (image: ImageItem | null) => void;
}