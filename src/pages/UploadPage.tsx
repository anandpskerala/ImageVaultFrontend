import {
	DndContext,
	closestCenter,
	type DragEndEvent,
	TouchSensor,
	MouseSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavBar } from '@/components/partials/NavBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ImageItem } from '@/interfaces/entities/ImageItem';
import { useAppSelector, type RootState } from '@/store';
import { Eye, Grip, Trash2, Upload, X, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { uploadImages } from '@/services/uploadService';
import { AxiosError } from 'axios';

const UploadPage = () => {
	const { user } = useAppSelector((state: RootState) => state.auth);
	const [loading, setLoading] = useState(false);
	const [images] = useState<ImageItem[]>([]);
	const [uploadFiles, setUploadFiles] = useState<{ id: string; file: File; title: string }[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [previewImage, setPreviewImage] = useState<{ id?: string; title: string; url?: string; file?: File } | null>(null);
	const [isDragOver, setIsDragOver] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 8 } });
	const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } });
	const sensors = useSensors(mouseSensor, touchSensor);


	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
		const files = Array.from(e.target.files || []);
		const maxImages = 10;
		const currentFileCount = uploadFiles.length;
		const remainingSlots = maxImages - currentFileCount;

		if (files.length > remainingSlots) {
			setError(`Cannot add ${files.length} images. Only ${remainingSlots} more image(s) can be uploaded (max ${maxImages}).`);
			return;
		}

		const newFiles = files.map(file => ({
			id: crypto.randomUUID(),
			file,
			title: file.name.split('.')[0],
		}));
		setUploadFiles(prev => [...prev, ...newFiles]);
	};

	const updateUploadTitle = (index: number, title: string) => {
		setUploadFiles(prev => prev.map((item, i) => (i === index ? { ...item, title } : item)));
	};

	const removeUploadFile = (index: number) => {
		setUploadFiles(prev => prev.filter((_, i) => i !== index));
	};

	const moveUploadFile = (index: number, direction: 'up' | 'down') => {
		setUploadFiles(prev => {
			const newArray = [...prev];
			const targetIndex = direction === 'up' ? index - 1 : index + 1;
			if (targetIndex < 0 || targetIndex >= newArray.length) return prev;
			return arrayMove(newArray, index, targetIndex);
		});
	};

	const handleUpload = async () => {
		if (uploadFiles.length === 0) return;
		setLoading(true);
		try {
			const formData = new FormData();
			uploadFiles.forEach(item => {
				formData.append('images', item.file);
				formData.append('titles', item.title);
			});
			await uploadImages(formData);
			setUploadFiles([]);
			setSuccess('Images uploaded successfully');
			if (fileInputRef.current) fileInputRef.current.value = '';
		} catch (err) {
			setError(err instanceof AxiosError ? err.response?.data.message : 'Upload failed');
		} finally {
			setLoading(false);
		}
	};



	useEffect(() => {
		if (success || error) {
			const timer = setTimeout(() => {
				setError('');
				setSuccess('');
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [success, error]);

	function SortableItem({ id, index, isUploaded = false }: { id: string; index: number; isUploaded?: boolean }) {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
		const style = {
			transform: CSS.Transform.toString(transform),
			transition,
			opacity: isDragging ? 0.5 : 1,
			zIndex: isDragging ? 999 : 1,
		};

		const image = isUploaded ? images[index] : uploadFiles[index];
		const [localTitle, setLocalTitle] = useState(image.title);

		const handleBlur = () => {
			updateUploadTitle(index, localTitle);
		};

		const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				updateUploadTitle(index, localTitle);
			}
		};

		return (
			<div ref={setNodeRef} style={style} className={`${isDragging ? 'shadow-lg' : ''}`}>
				<div className="bg-white rounded-xl w-full border-2 p-3 sm:p-4 hover:shadow-lg transition-all duration-300 group border-slate-200">
					<div className="flex flex-col sm:hidden gap-3">
						<div className="flex items-center gap-2">
							<div className="flex flex-col gap-1">
								<Button
									onClick={() => moveUploadFile(index, 'up')}
									disabled={index === 0}
									size="sm"
									variant="ghost"
									className="p-1 h-6 w-6 text-slate-400 hover:text-slate-600 disabled:opacity-30"
								>
									<ChevronUp className="h-3 w-3" />
								</Button>
								<Button
									onClick={() => moveUploadFile(index, 'down')}
									disabled={index === (isUploaded ? images.length : uploadFiles.length) - 1}
									size="sm"
									variant="ghost"
									className="p-1 h-6 w-6 text-slate-400 hover:text-slate-600 disabled:opacity-30"
								>
									<ChevronDown className="h-3 w-3" />
								</Button>
							</div>
							<div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
								<img
									src={URL.createObjectURL(image.file)}
									alt={image.title}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-slate-500 truncate">
									Position: {index + 1} of {isUploaded ? images.length : uploadFiles.length}
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Button
									onClick={() => setPreviewImage({ ...image, url: URL.createObjectURL(image.file) })}
									size="sm"
									variant="ghost"
									className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
								>
									<Eye className="h-4 w-4" />
								</Button>
								<Button
									onClick={() => removeUploadFile(index)}
									size="sm"
									variant="ghost"
									className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<div className="flex flex-col gap-1">
							<Label htmlFor={id} className="text-sm">Title</Label>
							<Input
								id={id}
								value={localTitle}
								onChange={(e) => setLocalTitle(e.target.value)}
								onBlur={handleBlur}
								onKeyDown={handleKeyDown}
								placeholder="Enter image title"
								className="text-sm"
							/>
						</div>
					</div>
					<div className="hidden sm:flex items-center gap-4">
						<div className="flex flex-col items-center gap-1">
							<Button
								variant="ghost"
								className="p-2 cursor-grab active:cursor-grabbing touch-none"
								{...attributes}
								{...listeners}
							>
								<Grip className="h-4 w-4 text-slate-400" />
							</Button>
							<span className="text-xs text-slate-400">#{index + 1}</span>
						</div>
						<div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden bg-slate-200">
							<img
								src={URL.createObjectURL(image.file)}
								alt={image.title}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="flex flex-1 flex-col gap-1">
							<Label htmlFor={id} className="text-sm">Title</Label>
							<Input
								id={id}
								value={localTitle}
								onChange={(e) => setLocalTitle(e.target.value)}
								onBlur={handleBlur}
								onKeyDown={handleKeyDown}
								placeholder="Enter image title"
								className="text-sm sm:text-base"
							/>
						</div>
						<div className="flex items-center gap-2">
							<div className="flex flex-col gap-1">
								<Button
									onClick={() => moveUploadFile(index, 'up')}
									disabled={index === 0}
									size="sm"
									variant="ghost"
									className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
									title="Move up"
								>
									<ArrowUp className="h-3 w-3" />
								</Button>
								<Button
									onClick={() => moveUploadFile(index, 'down')}
									disabled={index === (isUploaded ? images.length : uploadFiles.length) - 1}
									size="sm"
									variant="ghost"
									className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
									title="Move down"
								>
									<ArrowDown className="h-3 w-3" />
								</Button>
							</div>
							<Button
								onClick={() => setPreviewImage({ ...image, url: URL.createObjectURL(image.file) })}
								variant="ghost"
								className="p-2 cursor-pointer text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
							>
								<Eye className="h-4 w-4" />
							</Button>
							<Button
								onClick={() => removeUploadFile(index)}
								variant="ghost"
								className="p-2 cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col w-full min-h-screen">
			<NavBar user={user} page="upload" />
			<div className="flex-1 bg-gray-50 flex flex-col items-center p-2 sm:p-4 lg:p-6">
				<Card className="w-full max-w-7xl mx-auto">
					<CardHeader className="px-4 sm:px-6">
						<CardTitle className="text-lg sm:text-xl lg:text-2xl">Upload Images</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 px-4 sm:px-6">
						<div
							className={`border-2 border-dashed rounded-xl p-4 sm:p-8 lg:p-12 text-center transition-all duration-300 ${isDragOver ? 'border-blue-400 bg-blue-50 scale-[1.02] sm:scale-105 shadow-lg' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
								}`}
							onDragOver={(e) => {
								e.preventDefault();
								setIsDragOver(true);
							}}
							onDragLeave={() => setIsDragOver(false)}
							onDrop={(e) => {
								e.preventDefault();
								setIsDragOver(false);
								if (uploadFiles.length >= 10) {
									setError('Maximum of 10 images reached.');
									return;
								}
								handleFileSelect({ target: { files: e.dataTransfer.files } });
							}}
						>
							<div className={`transition-all duration-300 ${isDragOver ? 'scale-105 sm:scale-110' : ''}`}>
								<Upload
									className={`mx-auto h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mb-3 sm:mb-4 lg:mb-6 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`}
								/>
								<p className="text-sm sm:text-lg lg:text-xl text-slate-600 mb-3 sm:mb-4 lg:mb-6 px-2">
									{loading ? 'Uploading...' : 'Drag and drop images here, or click to select'}
								</p>
								<input
									ref={fileInputRef}
									type="file"
									multiple
									accept="image/*"
									onChange={handleFileSelect}
									className="hidden"
									disabled={uploadFiles.length >= 10}
								/>
								<Button
									onClick={() => fileInputRef.current?.click()}
									disabled={loading}
									className={`px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 cursor-pointer text-sm sm:text-base ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
										}`}
								>
									{loading ? 'Uploading...' : 'Select Images'}
								</Button>
							</div>
						</div>

						{success && (
							<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
								{success}
							</div>
						)}
						{error && (
							<div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
								{error}
							</div>
						)}

						{uploadFiles.length > 0 && (
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-white/20 transition-all duration-300 ease-in-out">
								<h3 className="text-lg font-semibold mb-4">Pending Uploads</h3>
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={(event: DragEndEvent) => {
										const { active, over } = event;
										if (active.id !== over?.id && over) {
											setUploadFiles(prev => {
												const oldIndex = prev.findIndex(f => f.id === active.id);
												const newIndex = prev.findIndex(f => f.id === over.id);
												return arrayMove(prev, oldIndex, newIndex);
											});
										}
									}}
								>
									<SortableContext items={uploadFiles.map(f => f.id)} strategy={verticalListSortingStrategy}>
										{uploadFiles.map((image, index) => (
											<SortableItem key={image.id} id={image.id} index={index} />
										))}
									</SortableContext>
								</DndContext>
								<div className="flex w-full flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
									<Button
										onClick={handleUpload}
										disabled={loading}
										className="w-full sm:w-1/2 text-sm sm:text-base py-2 sm:py-3 cursor-pointer"
									>
										{loading ? 'Uploading...' : 'Upload All Images'}
									</Button>
									<Button
										onClick={() => setUploadFiles([])}
										className="w-full sm:w-1/2 cursor-pointer bg-red-600 text-white hover:bg-red-700 text-sm sm:text-base py-2 sm:py-3"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{images.length > 0 && (
							<div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 border border-white/20 transition-all duration-300 ease-in-out">
								<h3 className="text-lg font-semibold mb-4">Uploaded Images</h3>
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={(event: DragEndEvent) => {
										const { active, over } = event;
										if (active.id !== over?.id && over) {
											const oldIndex = images.findIndex(f => f.id === active.id);
											const newIndex = images.findIndex(f => f.id === over.id);
											arrayMove(images, oldIndex, newIndex);
										}
									}}
								>
									<SortableContext items={images.map(f => f.id)} strategy={verticalListSortingStrategy}>
										{images.map((image, index) => (
											<SortableItem key={image.id} id={image.id} index={index} isUploaded />
										))}
									</SortableContext>
								</DndContext>
							</div>
						)}

						
					</CardContent>
				</Card>

				{previewImage && (
					<div className="fixed w-full inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-2 sm:p-4">
						<div className="bg-white rounded-2xl p-4 sm:p-6 max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-full overflow-auto">
							<div className="flex justify-between items-center mb-3 sm:mb-4">
								<h3 className="text-lg sm:text-xl font-semibold pr-4 truncate">{previewImage.title}</h3>
								<button
									onClick={() => setPreviewImage(null)}
									className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
								>
									<X className="h-5 w-5 sm:h-6 sm:w-6" />
								</button>
							</div>
							<div className="flex justify-center">
								<img
									src={previewImage.url || URL.createObjectURL(previewImage.file!)}
									alt={previewImage.title}
									className="max-w-full max-h-[60vh] sm:max-h-96 object-contain rounded-lg"
								/>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default UploadPage;