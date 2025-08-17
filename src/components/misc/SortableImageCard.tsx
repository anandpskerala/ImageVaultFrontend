import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, GripVertical, ImageIcon } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CSS } from '@dnd-kit/utilities';
import type { SortableImageCardProps } from "@/interfaces/props/SortableImageCardProps";

export const SortableImageCard = ({ image, selectedImages, toggleImageSelection, setSelectedImage }: SortableImageCardProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <Card className={`group overflow-hidden hover:shadow-lg transition-all border-black/20 duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-1 shadow-md ${isSortableDragging ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="relative overflow-hidden">
                    <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                            size="sm"
                            variant="ghost"
                            {...listeners}
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white cursor-grab active:cursor-grabbing"
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 w-8 p-0 bg-white/90 hover:bg-white cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(image);
                                    }}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                    <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-2 bg-black/70 text-white hover:bg-black/80"
                    >
                        #{image.position}
                    </Badge>
                </div>
                <CardContent className="p-4">
                    <CardTitle className="text-sm font-semibold mb-2 truncate group-hover:text-blue-600 transition-colors">
                        {image.title}
                    </CardTitle>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            <span>Image</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageSelection(image.id);
                                }}
                            >
                                {selectedImages.has(image.id) ? 'Unselect' : 'Select'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};