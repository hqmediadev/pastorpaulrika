import React, { useState, useRef, useEffect } from 'react';
import { Tribute, StorageConfig } from '../types';
import { 
  X, 
  Video, 
  Upload, 
  Heart, 
  Camera, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Play,
  FileVideo,
  Info,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';
import { saveVideoBlobLocally, uploadVideoToCloudinary } from '../utils/storage';

interface TributeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'video-record' | 'video-upload' | 'text';
  onSubmitTribute: (tribute: Tribute) => void;
}

export const TributeUploadModal: React.FC<TributeUploadModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'video-record',
  onSubmitTribute,
}) => {
  const [tab, setTab] = useState<'video-record' | 'video-upload' | 'text'>(defaultTab);

  // Author information
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('');
  const [relationship, setRelationship] = useState('Spiritual Son / Daughter');
  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Upload file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Clean up streams on close or tab switch
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetForm();
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const startCamera = async () => {
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setMediaStream(stream);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setRecordError('Camera or microphone access denied. Please grant permission or choose "Upload Video File" tab.');
    }
  };

  const startRecording = () => {
    if (!mediaStream) return;
    chunksRef.current = [];
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setRecordingTime(0);

    try {
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      let recorder: MediaRecorder;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        recorder = new MediaRecorder(mediaStream, options);
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        recorder = new MediaRecorder(mediaStream, { mimeType: 'video/mp4' });
      } else {
        recorder = new MediaRecorder(mediaStream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = chunksRef.current[0]?.type || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };

      recorder.start(1000); // 1s slice
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 180) { // 3 minute maximum
            stopRecording();
            return 180;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setRecordError('Could not start video recorder on this browser. Try uploading a video file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const reRecord = () => {
    setRecordedBlob(null);
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
      setRecordedVideoUrl(null);
    }
    setRecordingTime(0);
    startCamera();
  };

  // Video file upload handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('Video file is larger than 150MB. Please select a smaller clip.');
      return;
    }

    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setUploadedPreviewUrl(url);
    setErrorMessage(null);
  };

  // Handle final tribute submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a tribute or describe how Pastor Paul Rika impacted your life.');
      return;
    }

    const hasVideo = tab === 'video-record' ? !!recordedBlob : tab === 'video-upload' ? !!uploadedFile : false;

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(10);
    setStatusMessage('Preparing your birthday tribute...');

    try {
      const tributeId = `trib-${Date.now()}`;
      let finalVideoUrl = '';
      let cloudinaryPublicId: string | undefined;
      let videoBlobKey: string | undefined = undefined;

      if (hasVideo) {
        const videoData = tab === 'video-record' ? recordedBlob! : uploadedFile!;
        setStatusMessage('Uploading video to Cloudinary...');
        setUploadProgress(40);

        const res = await uploadVideoToCloudinary(videoData, { authorName });
        finalVideoUrl = res.url;
        cloudinaryPublicId = res.publicId;
        setUploadProgress(85);
        videoBlobKey = await saveVideoBlobLocally(tributeId, videoData);
      }

      setUploadProgress(100);
      setStatusMessage('Finalizing celebration tribute...');

      const newTribute: Tribute = {
        id: tributeId,
        type: hasVideo && message ? 'both' : hasVideo ? 'video' : 'text',
        authorName: authorName.trim(),
        authorLocation: authorLocation.trim() || 'Worldwide',
        relationship: relationship.trim(),
        message: message.trim(),
        videoUrl: finalVideoUrl || undefined,
        cloudinaryPublicId,
        videoBlobKey,
        videoDuration: hasVideo ? `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}` : undefined,
        photoUrl: photoUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
        likes: 1,
        amens: 1,
        isApproved: true,
        isFeatured: hasVideo,
        storageProvider: hasVideo ? 'cloudinary' : undefined,
      };

      onSubmitTribute(newTribute);
      setSuccess(true);
      playCelebrationChime('tribute');

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FBBF24', '#FFFFFF', '#10B981'],
      });

      setTimeout(() => {
        onClose();
        resetForm();
      }, 2500);

    } catch (err: unknown) {
      console.error('Submission error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to submit tribute. Please try again.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAuthorName('');
    setAuthorLocation('');
    setMessage('');
    setPhotoUrl('');
    setRecordedBlob(null);
    setRecordedVideoUrl(null);
    setUploadedFile(null);
    setUploadedPreviewUrl(null);
    setIsRecording(false);
    setRecordingTime(0);
    setIsSubmitting(false);
    setSuccess(false);
    setErrorMessage(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 p-0.5">
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-black text-white">
                  Send Your Birthday Tribute
                </h3>
                <p className="text-xs text-amber-200/80">
                  Honoring Pastor Paul Rika's Decades of Holiness & Revival
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Splash */}
        {success ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-serif font-black text-white">
              Hallelujah! Tribute Received!
            </h4>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your heartfelt tribute honoring Pastor Paul Rika has been recorded and posted to the celebration wall. May the Lord bless you abundantly!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Format selection tabs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">Choose Tribute Format:</span>
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Video Priority</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setTab('video-record');
                    if (!mediaStream && !recordedBlob) startCamera();
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'video-record'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Record Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setTab('video-upload');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'video-upload'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setTab('text');
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    tab === 'text'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Write Message</span>
                </button>
              </div>
            </div>

            {/* TAB 1: RECORD VIDEO */}
            {tab === 'video-record' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black border border-slate-800 flex items-center justify-center">
                  {recordedVideoUrl ? (
                    // Review recorded video
                    <video
                      src={recordedVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  ) : mediaStream ? (
                    // Live camera preview
                    <video
                      ref={liveVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // Camera closed
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-10 h-10 text-amber-400/70 mx-auto" />
                      <p className="text-xs text-slate-400">
                        Camera preview ready. Click below to activate your webcam.
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                      >
                        Enable Camera & Mic
                      </button>
                    </div>
                  )}

                  {/* Recording indicator & timer */}
                  {isRecording && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white text-xs px-3 py-1 rounded-full font-mono font-bold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      <span>REC {formatTimer(recordingTime)} / 3:00</span>
                    </div>
                  )}
                </div>

                {recordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{recordError}</span>
                  </div>
                )}

                {/* Camera controls */}
                <div className="flex items-center justify-center gap-3">
                  {!recordedVideoUrl ? (
                    !isRecording ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (!mediaStream) {
                            startCamera().then(startRecording);
                          } else {
                            startRecording();
                          }
                        }}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                      >
                        <span className="w-3 h-3 rounded-full bg-white" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
                      >
                        <Square className="w-3 h-3 fill-current" />
                        <span>Stop & Review</span>
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={reRecord}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-record Video</span>
                      </button>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Video Ready ({formatTimer(recordingTime)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD VIDEO FILE */}
            {tab === 'video-upload' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-400/60 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors">
                  {uploadedPreviewUrl ? (
                    <div className="space-y-3">
                      <video
                        src={uploadedPreviewUrl}
                        controls
                        className="max-h-48 mx-auto rounded-xl border border-slate-800"
                      />
                      <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle className="w-4 h-4" /> {uploadedFile?.name} ({(uploadedFile!.size / (1024 * 1024)).toFixed(1)} MB)
                      </p>
                      <label className="inline-block px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
                        Choose Different Video
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                        <FileVideo className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">
                          Click to select or drag video file
                        </span>
                        <span className="text-xs text-slate-400">
                          Supports MP4, MOV, WebM (up to 150MB)
                        </span>
                      </div>
                      <span className="inline-block px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                        Browse Files
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* AUTHOR DETAILS & TESTIMONIAL FORM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bro. David Adeleke"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  City & Country <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos, Nigeria or London, UK"
                  value={authorLocation}
                  onChange={(e) => setAuthorLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Relationship to Pastor Paul Rika
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="HOREMOW Member / Chapter">HOREMOW Member / Chapter</option>
                  <option value="Spiritual Son / Daughter">Spiritual Son / Daughter</option>
                  <option value="Fellow Minister / Evangelist">Fellow Minister / Evangelist</option>
                  <option value="Conference & Camp Attendee">Conference & Camp Attendee</option>
                  <option value="Youth Fellowship">Youth Fellowship</option>
                  <option value="Online Believer (Global)">Online Believer (Global)</option>
                  <option value="Partner in Holiness Ministry">Partner in Holiness Ministry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Photo / Picture (Optional)
                </label>
                <input
                  type="url"
                  placeholder="Image URL or Cloudinary link"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  How has Pastor Paul Rika's ministry & holiness teachings impacted you? <span className="text-amber-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Share your testimony</span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="Share a specific message, book, conference, restitution testimony, or life transformation through Pastor Paul Rika's uncompromising holiness teachings..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Progress or Error bar */}
            {isSubmitting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    {statusMessage}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Birthday Tribute</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
