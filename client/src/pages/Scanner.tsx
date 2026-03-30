import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Scanner() {
  const [, navigate] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeFoodMutation = trpc.food.analyzeFood.useMutation({
    onSuccess: (data) => {
      setIsProcessing(false);
      navigate(`/scan/${data.id}`);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error(error.message || "Failed to analyze food. Please try again.");
    },
  });

  useEffect(() => {
    if (!cameraActive) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.error("Unable to access camera. Please check permissions.");
        setCameraActive(false);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        setCameraActive(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast.error("Please capture or upload an image first.");
      return;
    }

    setIsProcessing(true);
    try {
      const base64Data = capturedImage.split(",")[1];
      analyzeFoodMutation.mutate({ imageData: base64Data });
    } catch (error) {
      setIsProcessing(false);
      toast.error("Failed to process image. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Scan Food</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {!capturedImage ? (
          <div className="space-y-6 animate-slide-up">
            {cameraActive ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-white/10 relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto bg-black"
                  />
                  {/* Scanning overlay corners */}
                  <div className="absolute inset-4 pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 h-14 gradient-primary text-white font-bold rounded-2xl border-0 hover:opacity-90 text-base"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture
                  </Button>
                  <Button
                    onClick={() => setCameraActive(false)}
                    className="h-14 px-6 bg-white/5 hover:bg-white/10 text-[hsl(var(--foreground))] rounded-2xl border border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Camera button */}
                <button
                  onClick={() => setCameraActive(true)}
                  className="w-full glass-card p-10 text-center group"
                >
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 group-hover:glow-emerald transition-all">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-2">Open Camera</h3>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm">
                    Point at your food and capture
                  </p>
                </button>

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full glass-card p-6 flex items-center gap-4 text-left group"
                >
                  <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                    <Upload className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[hsl(var(--foreground))]">Upload Image</h4>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Choose from gallery</p>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-scale-in">
            {/* Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10">
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full h-auto"
              />
            </div>

            {/* Analysis Card */}
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">Ready to Analyze</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                AI will identify the food and break down calories, macros, vitamins, and more.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="flex-1 h-14 gradient-primary text-white font-bold rounded-2xl border-0 hover:opacity-90 disabled:opacity-50 text-base"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyze Food
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setCapturedImage(null)}
                  className="h-14 px-6 bg-white/5 hover:bg-white/10 text-[hsl(var(--foreground))] rounded-2xl border border-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
