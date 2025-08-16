import { NavBar } from '@/components/partials/NavBar'
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ImageItem } from '@/interfaces/entities/ImageItem';
import { useAppSelector, type RootState } from '@/store'
import { Eye, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';


const UploadPage = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<ImageItem[]>([]);
    const [uploadFiles, setUploadFiles] = useState<{ file: File; title: string }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<{ file: File; title: string } | null>(null);

    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles = files.map(file => ({ file, title: file.name.split('.')[0] }));
        setUploadFiles(prev => [...prev, ...newFiles]);
    };

    const updateUploadTitle = (index: number, title: string) => {
        setUploadFiles(prev => prev.map((item, i) =>
            i === index ? { ...item, title } : item
        ));
    };

    const removeUploadFile = (index: number) => {
        setUploadFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (uploadFiles.length === 0) return;

        setLoading(true);
        try {
            const newImages: ImageItem[] = uploadFiles.map((item, index) => ({
                id: Date.now() + index + '',
                title: item.title,
                url: URL.createObjectURL(item.file),
                file: item.file,
                order: images.length + index
            }));

            await new Promise(resolve => setTimeout(resolve, 1000));
            setImages(prev => [...prev, ...newImages]);
            setUploadFiles([]);
            setSuccess('Images uploaded successfully!');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error(err)
            setError('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col w-full">
            <NavBar user={user} page="upload" />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
                <Card className="w-full max-w-6xl">
                    <CardHeader>
                        <CardTitle>Upload Images</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragOver
                                ? 'border-blue-400 bg-blue-50 scale-105 shadow-lg'
                                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                }`}>
                            <div className={`transition-all duration-300 ${isDragOver ? 'scale-110' : ''}`}>
                                <Upload className={`mx-auto h-16 w-16 mb-6 ${isDragOver ? 'text-blue-500' : 'text-slate-400'}`} />
                                <p className="text-xl text-slate-600 mb-6">
                                    {loading ? 'Drop your images here!' : 'Drag and drop images here, or click to select'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={loading}
                                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 cursor-pointer ${loading
                                        ? 'bg-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {loading ? 'Uploading...' : 'Select Images'}
                                </Button>
                            </div>
                        </div>


                        {/* <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full"
                                variant="outline"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Select Images
                            </Button>
                        </div> */}

                        {uploadFiles.length > 0 && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20 transition-all duration-300 ease-in-out">
                                <div className="flex flex-col w-full flex-wrap items-center justify-between gap-4">

                                    {uploadFiles.map((image, index) => (
                                        <div
                                            key={image.title + index}
                                            className={`bg-white rounded-xl w-full border-2 p-4 hover:shadow-lg transition-all duration-300 cursor-move group border-slate-200`}
                                        >

                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                                                    <img
                                                        src={URL.createObjectURL(image.file)}
                                                        alt={image.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <Label htmlFor={`title-${index}`}>Title</Label>
                                                    <Input
                                                        id={`title-${index}`}
                                                        value={image.title}
                                                        onChange={(e) => updateUploadTitle(index, e.target.value)}
                                                        placeholder="Enter image title"
                                                    />
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setPreviewImage(image)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() => removeUploadFile(index)}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex w-full flex-col md:flex-row gap-1">
                                        <Button
                                            onClick={handleUpload}
                                            disabled={loading}
                                            className="w-full md:w-1/2"
                                        >
                                            {loading ? 'Uploading...' : 'Upload All Images'}
                                        </Button>
                                        <Button
                                            className="w-full md:w-1/2 bg-red-600 text-white"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* {uploadFiles.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">Selected Files ({uploadFiles.length})</h3>
                                {uploadFiles.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 border rounded">
                                        <img
                                            src={URL.createObjectURL(item.file)}
                                            alt="preview"
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <Label htmlFor={`title-${index}`}>Title</Label>
                                            <Input
                                                id={`title-${index}`}
                                                value={item.title}
                                                onChange={(e) => updateUploadTitle(index, e.target.value)}
                                                placeholder="Enter image title"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeUploadFile(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex w-full flex-col md:flex-row gap-1">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="w-full md:w-1/2"
                                    >
                                        {loading ? 'Uploading...' : 'Upload All Images'}
                                    </Button>
                                    <Button
                                        className="w-full md:w-1/2 bg-red-600 text-white"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )} */}
                    </CardContent>
                </Card>

                {previewImage && (
                    <div className="fixed w-full inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-full overflow-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold">{previewImage.title}</h3>
                                <button
                                    onClick={() => setPreviewImage(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <img
                                src={URL.createObjectURL(previewImage.file)}
                                alt={previewImage.title}
                                className="max-w-full max-h-96 object-contain mx-auto rounded-lg"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default UploadPage