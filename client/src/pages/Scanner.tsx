import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

export default function Scanner() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
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

  // Initialize camera
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

  // Capture photo from camera
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

  // Handle file upload
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

  // Analyze the captured image
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
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
      } backdrop-blur-md border-b ${
        theme === "dark" ? "border-gray-700" : "border-orange-100"
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`p-2 rounded-full transition-colors ${
              theme === "dark"
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-orange-100 text-gray-700"
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className={`text-2xl font-bold ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Scan Food
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        {!capturedImage ? (
          <div className="space-y-6">
            {/* Camera Section */}
            {cameraActive ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto bg-black"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 rounded-full text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                  <Button
                    onClick={() => setCameraActive(false)}
                    variant="outline"
                    className={`flex-1 font-bold py-3 rounded-full text-lg ${
                      theme === "dark"
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-orange-200 text-gray-700 hover:bg-orange-50"
                    }`}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl p-8 md:p-12 text-center border-2 border-dashed transition-colors ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-800"
                  : "border-orange-200 bg-orange-50"
              }`}>
                <div className="text-5xl md:text-6xl mb-4">📷</div>
                <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  Ready to Scan?
                </h2>
                <p className={`text-lg mb-6 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Take a photo of your food or upload an image
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <Button
                    onClick={() => setCameraActive(true)}
                    className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold py-3 rounded-full text-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-full text-lg"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Image
                  </Button>
                </div>
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
          <div className="space-y-6">
            {/* Preview Section */}
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full h-auto"
              />
            </div>

            {/* Analysis Info */}
            <div className={`rounded-2xl p-6 md:p-8 transition-colors ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-orange-100"
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Ready to Analyze?
              </h3>
              <p className={`mb-6 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Our AI will analyze the nutritional content of your food and provide detailed information about calories, macronutrients, and more.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold py-3 rounded-full text-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Food"
                  )}
                </Button>
                <Button
                  onClick={() => setCapturedImage(null)}
                  variant="outline"
                  className={`flex-1 font-bold py-3 rounded-full text-lg ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-orange-200 text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <X className="w-5 h-5 mr-2" />
                  Retake
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
