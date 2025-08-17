import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';

export const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const loadingSteps = [
        { label: 'Initializing application...', duration: 1200 },
        { label: 'Loading components...', duration: 800 },
        { label: 'Connecting to services...', duration: 1000 },
        { label: 'Preparing interface...', duration: 600 },
        { label: 'Almost ready...', duration: 400 }
    ];

    useEffect(() => {
        const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
        let elapsed = 0;

        const interval = setInterval(() => {
            elapsed += 50;
            const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(newProgress);

            let stepElapsed = 0;
            for (let i = 0; i < loadingSteps.length; i++) {
                if (elapsed <= stepElapsed + loadingSteps[i].duration) {
                    setCurrentStep(i);
                    break;
                }
                stepElapsed += loadingSteps[i].duration;
            }

            if (elapsed >= totalDuration) {
                setIsComplete(true);
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    const resetLoading = () => {
        setProgress(0);
        setCurrentStep(0);
        setIsComplete(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-40 left-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse" style={{ animationDelay: '4s' }}></div>
            </div>

            <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg relative z-10">
                <CardContent className="p-8 space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center">
                            {isComplete ? (
                                <CheckCircle2 className="w-8 h-8 text-white animate-in zoom-in duration-500" />
                            ) : (
                                <Zap className="w-8 h-8 text-white animate-pulse" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading</h1>
                            <p className="text-gray-600 text-sm">Preparing your experience</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Progress
                            value={progress}
                            className="h-2 bg-gray-200"
                        />

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{Math.round(progress)}%</span>
                            <span className="text-gray-500">{Math.round(progress)}% complete</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            {isComplete ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 animate-in zoom-in duration-300" />
                            ) : (
                                <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                            )}
                            <span className="text-gray-800 font-medium">
                                {isComplete ? 'Ready to go!' : loadingSteps[currentStep]?.label}
                            </span>
                        </div>

                        <div className="flex space-x-2">
                            {loadingSteps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${index <= currentStep
                                            ? 'bg-gradient-to-r from-gray-700 to-gray-600'
                                            : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {isComplete && (
                        <div className="text-center animate-in slide-in-from-bottom duration-500">
                            <button
                                onClick={resetLoading}
                                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Reload Demo
                            </button>
                        </div>
                    )}

                    {!isComplete && (
                        <div className="flex justify-center space-x-1">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}