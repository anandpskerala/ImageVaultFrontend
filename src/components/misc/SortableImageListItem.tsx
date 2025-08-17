import type { SortableImageListItemProps } from "@/interfaces/props/SortableImageListItemProps";
import { useSortable } from "@dnd-kit/sortable";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CSS } from '@dnd-kit/utilities';
import { Download, Edit3, Eye, Filter, GripVertical, Share2, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const SortableImageListItem = ({ image, setSelectedImage }: SortableImageListItemProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}>
			<Card className={`hover:shadow-md transition-shadow ${isDragging ? 'ring-2 ring-blue-500' : ''}`}>
				<CardContent className="p-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								variant="ghost"
								{...listeners}
								className="cursor-grab active:cursor-grabbing"
							>
								<GripVertical className="h-4 w-4" />
							</Button>
							<img
								src={image.url}
								alt={image.title}
								className="w-16 h-16 object-cover rounded-lg"
								loading="lazy"
							/>
						</div>
						<div className="flex-1">
							<CardTitle className="text-base mb-1">{image.title}</CardTitle>
							<CardDescription className="flex items-center gap-2">
								<Badge variant="outline">#{image.position}</Badge>
								<span>•</span>
								<span>Image file</span>
							</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Dialog>
								<DialogTrigger asChild>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setSelectedImage(image)}
										className="cursor-pointer"
									>
										<Eye className="h-4 w-4" />
									</Button>
								</DialogTrigger>
							</Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button size="sm" variant="ghost" className="cursor-pointer">
										<Filter className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>
										<Download className="mr-2 h-4 w-4" />
										Download
									</DropdownMenuItem>
									<DropdownMenuItem>
										<Share2 className="mr-2 h-4 w-4" />
										Share
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>
										<Edit3 className="mr-2 h-4 w-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem className="text-red-600">
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};