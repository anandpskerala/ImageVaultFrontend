import { NavBar } from '@/components/partials/NavBar'
import type { ImageItem } from '@/interfaces/entities/ImageItem';
import { deleteImageService, editImageService, getImages, saveImageOrder } from '@/services/uploadService';
import { useAppSelector, type RootState } from '@/store'
import { useEffect, useState } from 'react';
import { Search, Grid, List, Download, Trash2, Edit3, Upload, Image as ImageIcon, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	type DragEndEvent,
	DragOverlay,
	type DragStartEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	rectSortingStrategy,
} from '@dnd-kit/sortable';
import { LoadingSkeleton } from '@/components/misc/LoadingSkeleton';
import { SortableImageCard } from '@/components/misc/SortableImageCard';
import { SortableImageListItem } from '@/components/misc/SortableImageListItem';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

const HomePage = () => {
	const { user } = useAppSelector((state: RootState) => state.auth);
	const [images, setImages] = useState<ImageItem[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(true);
	const [sortBy, setSortBy] = useState('position');
	const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [showSaveDialog, setShowSaveDialog] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
	const [editTitle, setEditTitle] = useState('');
	const [editImageFile, setEditImageFile] = useState<File | null>(null);
	const [editImagePreview, setEditImagePreview] = useState<string>('');
	const [isEditSaving, setIsEditSaving] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const navigate = useNavigate();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		const fetchRequest = async () => {
			try {
				setIsLoading(true);
				const res = await getImages();
				const sortedImages = res.images.sort((a: ImageItem, b: ImageItem) => b.position - a.position);
				setImages(sortedImages);
				setFilteredImages(sortedImages);
				setTotal(Number(res.total));
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		}
		fetchRequest();
	}, []);

	useEffect(() => {
		let filtered = images.filter(image =>
			image.title.toLowerCase().includes(searchTerm.toLowerCase())
		);

		switch (sortBy) {
			case 'title':
				filtered = filtered.sort((a, b) => a.title.localeCompare(b.title));
				break;
			case 'recent':
				filtered = filtered.sort((a, b) => b.position - a.position);
				break;
			case 'position':
				filtered = filtered.sort((a, b) => a.position - b.position);
				break;
		}

		setFilteredImages(filtered);
	}, [searchTerm, images, sortBy]);

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (active.id !== over?.id) {
			const oldIndex = filteredImages.findIndex(item => item.id === active.id);
			const newIndex = filteredImages.findIndex(item => item.id === over?.id);

			const newFilteredImages = arrayMove(filteredImages, oldIndex, newIndex);
			const newImages = [...images];

			const updatedImages = newFilteredImages.map((img, index) => ({
				...img,
				position: index + 1
			}));

			updatedImages.forEach(updatedImg => {
				const mainIndex = newImages.findIndex(img => img.id === updatedImg.id);
				if (mainIndex !== -1) {
					newImages[mainIndex] = updatedImg;
				}
			});

			setFilteredImages(updatedImages);
			setImages(newImages);
			setHasUnsavedChanges(true);
		}
	};

	const handleSaveOrder = async () => {
		setIsSaving(true);
		try {
			await saveImageOrder(filteredImages.map(img => ({ id: img.id, position: img.position })));
			setHasUnsavedChanges(false);
			setShowSaveDialog(false);
		} catch (error) {
			console.error('Failed to save order:', error);
		} finally {
			setIsSaving(false);
		}
	};

	const toggleImageSelection = (imageId: string) => {
		const newSelected = new Set(selectedImages);
		if (newSelected.has(imageId)) {
			newSelected.delete(imageId);
		} else {
			newSelected.add(imageId);
		}
		setSelectedImages(newSelected);
	};

	const handleEditImages = () => {
		if (selectedImages.size === 1) {
			const imageId = Array.from(selectedImages)[0];
			const image = images.find(img => img.id === imageId);
			if (image) {
				setEditingImage(image);
				setEditTitle(image.title);
				setEditImagePreview(image.url);
				setEditImageFile(null);
				setShowEditModal(true);
			}
		}
	};

	const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setEditImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setEditImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSaveEdit = async () => {
		if (!editingImage) return;

		setIsEditSaving(true);
		try {
			const formData = new FormData();
			formData.append("title", editTitle);
			if (editImageFile) {
				formData.append("image", editImageFile);
			}

			await editImageService(editingImage.id, formData);
			const updatedImages = images.map(img =>
				img.id === editingImage.id
					? { ...img, title: editTitle, url: editImagePreview }
					: img
			);
			setImages(updatedImages);

			setShowEditModal(false);
			setEditingImage(null);
			setEditTitle('');
			setEditImageFile(null);
			setEditImagePreview('');
			setSelectedImages(new Set());
		} catch (error) {
			const err = error instanceof AxiosError ? error.response?.data.message: "Failed to Edit";
			toast.error(err);
		} finally {
			setIsEditSaving(false);
		}
	};

	const handleDeleteImages = async () => {
		setIsDeleting(true);
		try {
			const deletePromises = Array.from(selectedImages).map(imageId =>
				deleteImageService(imageId)
			);
			await Promise.all(deletePromises);

			const updatedImages = images.filter(img => !selectedImages.has(img.id));
			setImages(updatedImages);
			setFilteredImages(updatedImages);
			setTotal(prev => prev - selectedImages.size);
			setSelectedImages(new Set());
			setShowDeleteDialog(false);
		} catch (error) {
			console.error('Failed to delete images:', error);
			alert('Failed to delete images. Please try again.');
		} finally {
			setIsDeleting(false);
		}
	};

	const handleDownloadImages = async () => {
		setIsDownloading(true);
		try {
			const selectedImagesArray = Array.from(selectedImages);
			const imagesToDownload = images.filter(img => selectedImagesArray.includes(img.id));

			if (imagesToDownload.length === 1) {
				const image = imagesToDownload[0];
				const response = await fetch(image.url);
				const blob = await response.blob();
				const fileName = image.title || `image-${image.id}`;
				saveAs(blob, `${fileName}.${image.url.split('.').pop()}`);
			} else if (imagesToDownload.length > 1) {
				const zip = new JSZip();
				const folder = zip.folder("images");

				const downloadPromises = imagesToDownload.map(async (image, index) => {
					const response = await fetch(image.url);
					const blob = await response.blob();
					const fileName = image.title || `image-${index + 1}`;
					folder?.file(`${fileName}.${image.url.split('.').pop()}`, blob);
				});

				await Promise.all(downloadPromises);
				const content = await zip.generateAsync({ type: "blob" });
				saveAs(content, "images.zip");
			}

			setSelectedImages(new Set());
		} catch (error) {
			console.error('Failed to download images:', error);
			alert('Failed to download images. Please try again.');
		} finally {
			setIsDownloading(false);
		}
	};

	const activeImage = filteredImages.find(image => image.id === activeId);

	return (
		<div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
			<NavBar user={user} page='dashboard' />

			<main className="flex-1 container mx-auto px-10 py-8 bg-gray-100">
				<div className="mb-8">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
								Welcome back, {user?.firstName || 'User'}!
							</h1>
							<p className="text-muted-foreground">
								Manage and explore your image collection
							</p>
						</div>
						<div className="flex items-center gap-4">
							<p className="text-muted-foreground">
								Total assets: {total}
							</p>
							{hasUnsavedChanges && (
								<Button
									onClick={() => setShowSaveDialog(true)}
									className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
								>
									<Save className="mr-2 h-4 w-4" />
									Save Order
								</Button>
							)}
						</div>
					</div>

					<Card className="p-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-black/20">
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
								<Input
									placeholder="Search your images..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 bg-white/80 dark:bg-gray-900/80"
								/>
							</div>
							<div className="flex items-center gap-2">
								<Select value={sortBy} onValueChange={setSortBy}>
									<SelectTrigger className="w-32 cursor-pointer">
										<SelectValue placeholder="Sort by" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="recent" className="cursor-pointer">Recent</SelectItem>
										<SelectItem value="title" className="cursor-pointer">Title</SelectItem>
										<SelectItem value="position" className="cursor-pointer">Order</SelectItem>
									</SelectContent>
								</Select>
								<Separator orientation="vertical" className="h-6" />
								<Button
									className="cursor-pointer"
									variant={viewMode === 'grid' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setViewMode('grid')}
								>
									<Grid className="h-4 w-4" />
								</Button>
								<Button
									className="cursor-pointer"
									variant={viewMode === 'list' ? 'default' : 'outline'}
									size="sm"
									onClick={() => setViewMode('list')}
								>
									<List className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</Card>
				</div>

				{isLoading ? (
					<LoadingSkeleton />
				) : filteredImages.length === 0 ? (
					<div className="text-center py-12">
						<ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No images found</h3>
						<p className="text-muted-foreground mb-4">
							{searchTerm ? 'Try adjusting your search terms' : 'Upload your first image to get started'}
						</p>
						<Button
							className="cursor-pointer"
							onClick={() => navigate("/upload")}
						>
							<Upload className="mr-2 h-4 w-4" />
							Upload Images
						</Button>
					</div>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragStart={handleDragStart}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={filteredImages.map(img => img.id)}
							strategy={viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
						>
							{viewMode === 'grid' ? (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
									{filteredImages.map((image) => (
										<SortableImageCard
											key={image.id}
											image={image}
											selectedImages={selectedImages}
											toggleImageSelection={toggleImageSelection}
											setSelectedImage={setSelectedImage}
										/>
									))}
								</div>
							) : (
								<div className="space-y-4">
									{filteredImages.map((image) => (
										<SortableImageListItem
											key={image.id}
											image={image}
											setSelectedImage={setSelectedImage}
										/>
									))}
								</div>
							)}
						</SortableContext>

						<DragOverlay>
							{activeImage ? (
								<div className="opacity-80 transform rotate-3 scale-105">
									{viewMode === 'grid' ? (
										<SortableImageCard
											image={activeImage}
											selectedImages={selectedImages}
											toggleImageSelection={toggleImageSelection}
											setSelectedImage={setSelectedImage}
											isDragging={true}
										/>
									) : (
										<SortableImageListItem
											image={activeImage}
											setSelectedImage={setSelectedImage}
										/>
									)}
								</div>
							) : null}
						</DragOverlay>
					</DndContext>
				)}

				{selectedImages.size > 0 && (
					<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
						<Card className="p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-white/20 shadow-lg">
							<div className="flex items-center gap-4">
								<span className="text-sm font-medium">
									{selectedImages.size} selected
								</span>
								<Separator orientation="vertical" className="h-6" />
								<Button 
									size="sm" 
									variant="outline"
									onClick={handleDownloadImages}
									disabled={isDownloading}
									className="cursor-pointer"
								>
									{isDownloading ? (
										<>
											<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent dark:border-white dark:border-t-transparent" />
											Downloading...
										</>
									) : (
										<>
											<Download className="mr-2 h-4 w-4" />
											Download
										</>
									)}
								</Button>
								{selectedImages.size === 1 && (
									<Button size="sm" variant="outline" onClick={handleEditImages} className="cursor-pointer">
										<Edit3 className="mr-2 h-4 w-4" />
										Edit
									</Button>
								)}
								<Button
									size="sm"
									variant="outline"
									className="text-red-600 cursor-pointer"
									onClick={() => setShowDeleteDialog(true)}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Delete
								</Button>
								<Button
									size="sm"
									variant="ghost"
									className="cursor-pointer"
									onClick={() => setSelectedImages(new Set())}
								>
									Clear
								</Button>
							</div>
						</Card>
					</div>
				)}

				<Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
					<DialogContent className="max-w-4xl cursor-pointer">
						{selectedImage && (
							<>
								<DialogHeader>
									<DialogTitle>{selectedImage.title}</DialogTitle>
									<DialogDescription>
										Position #{selectedImage.position}
									</DialogDescription>
								</DialogHeader>
								<div className="relative">
									<img
										src={selectedImage.url}
										alt={selectedImage.title}
										className="w-full max-h-[70vh] object-contain rounded-lg"
									/>
								</div>
							</>
						)}
					</DialogContent>
				</Dialog>

				<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Save New Order</DialogTitle>
							<DialogDescription>
								You have rearranged your images. Would you like to save the new order?
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={() => setShowSaveDialog(false)}
								disabled={isSaving}
								className="cursor-pointer"
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								onClick={handleSaveOrder}
								disabled={isSaving}
								className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
							>
								{isSaving ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Order
									</>
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete Images</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete {selectedImages.size} image{selectedImages.size > 1 ? 's' : ''}? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className="flex items-center justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={() => setShowDeleteDialog(false)}
								disabled={isDeleting}
								className="cursor-pointer"
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								onClick={handleDeleteImages}
								disabled={isDeleting}
								className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
							>
								{isDeleting ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="mr-2 h-4 w-4" />
										Delete
									</>
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>

				<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
					<DialogContent className="sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>Edit Image</DialogTitle>
							<DialogDescription>
								Update the title and/or replace the image
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="edit-title">Title</Label>
								<Input
									id="edit-title"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									placeholder="Enter image title"
								/>
							</div>

							<div className="space-y-2">
								<Label>Current Image</Label>
								<div className="relative border rounded-lg overflow-hidden">
									<img
										src={editImagePreview}
										alt="Preview"
										className="w-full h-64 object-contain bg-gray-50 dark:bg-gray-900"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="edit-image">Replace Image (optional)</Label>
								<Input
									id="edit-image"
									type="file"
									accept="image/*"
									onChange={handleImageFileChange}
									className="cursor-pointer"
								/>
							</div>
						</div>

						<div className="flex items-center justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={() => {
									setShowEditModal(false);
									setEditingImage(null);
									setEditTitle('');
									setEditImageFile(null);
									setEditImagePreview('');
								}}
								disabled={isEditSaving}
								className="cursor-pointer"
							>
								<X className="mr-2 h-4 w-4" />
								Cancel
							</Button>
							<Button
								onClick={handleSaveEdit}
								disabled={isEditSaving || !editTitle.trim()}
								className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
							>
								{isEditSaving ? (
									<>
										<div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Changes
									</>
								)}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
};

export default HomePage;