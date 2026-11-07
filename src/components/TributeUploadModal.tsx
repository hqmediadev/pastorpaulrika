import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tribute } from '../types';
import { 
  X, 
  Heart, 
  Camera, 
  Square, 
  RotateCcw,
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCelebrationChime } from '../utils/audio';
import { saveVideoBlobLocally, uploadVideoToCloudinary } from '../utils/storage';

interface TributeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'video-record' | 'text';
  onSubmitTribute: (tribute: Tribute) => void;
}

export const TributeUploadModal: React.FC<TributeUploadModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'video-record',
  onSubmitTribute,
}) => {
  const [tab, setTab] = useState<'video-record' | 'text'>(defaultTab === 'text' ? 'text' : 'video-record');

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

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setTab(defaultTab === 'text' ? 'text' : 'video-record');
  }, [defaultTab]);

  // Stop the camera when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetForm();
    }
  }, [isOpen, mediaStream]);

  const attachLiveVideo = useCallback((video: HTMLVideoElement | null) => {
    if (!video || !mediaStream) return;

    video.muted = true;
    video.playsInline = true;
    video.srcObject = mediaStream;

    const playPreview = () => {
      video.play().catch((err: unknown) => {
        console.error('Live camera preview playback error:', err);
        setRecordError('Unable to display the camera preview. Check browser camera permissions and try again.');
      });
    };

    video.addEventListener('loadedmetadata', playPreview, { once: true });
    playPreview();
  }, [mediaStream]);

  const stopCamera = (stream = mediaStream) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setMediaStream(null);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const startCamera = async (): Promise<MediaStream | null> => {
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setMediaStream(stream);
      return stream;
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setRecordError('Camera or microphone access was denied. Allow access in your browser settings, then try again.');
      return null;
    }
  };

  const startRecording = (stream = mediaStream) => {
    if (!stream) return;
    chunksRef.current = [];
    setRecordedBlob(null);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordingTime(0);

    try {
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      let recorder: MediaRecorder;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        recorder = new MediaRecorder(stream, options);
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        recorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
      } else {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mimeType = recorder.mimeType
          || chunksRef.current.find((chunk) => chunk.type)?.type
          || 'video/webm';
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          setRecordedBlob(blob);
          setRecordedVideoUrl(URL.createObjectURL(blob));
        } else {
          setRecordError('No video was captured. Please record again.');
        }
        setIsRecording(false);
        stopCamera(stream);
      };

      recorder.start(1000); // 1s slice
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      let elapsedSeconds = 0;
      timerIntervalRef.current = setInterval(() => {
        elapsedSeconds += 1;
        setRecordingTime(Math.min(elapsedSeconds, 180));
        if (elapsedSeconds >= 180) stopRecording();
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      stopCamera(stream);
      setRecordError('Could not start video recording in this browser. Please try another browser or device.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setIsRecording(false);
      stopCamera();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const clearRecordedVideo = () => {
    setRecordedBlob(null);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
    setRecordingTime(0);
  };

  const recordAgain = async () => {
    clearRecordedVideo();
    const stream = await startCamera();
    if (stream) startRecording(stream);
  };

  // Handle final tribute submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordedBlob) {
      setErrorMessage('Record and stop your video before submitting your tribute.');
      setTab('video-record');
      return;
    }
    if (!authorName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!message.trim()) {
      setErrorMessage('Please write a tribute or describe how Pastor Paul Rika impacted your life.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setUploadProgress(10);
    setStatusMessage('Preparing your birthday tribute...');

    try {
      const tributeId = `trib-${Date.now()}`;
      let finalVideoUrl = '';
      let cloudinaryPublicId: string | undefined;
      let videoBlobKey: string | undefined = undefined;

      const videoData = recordedBlob;
      setStatusMessage('Uploading your video...');
      setUploadProgress(40);

      const res = await uploadVideoToCloudinary(videoData, { authorName });
      finalVideoUrl = res.url;
      cloudinaryPublicId = res.publicId;
      setUploadProgress(85);
      videoBlobKey = await saveVideoBlobLocally(tributeId, videoData);

      setUploadProgress(100);
      setStatusMessage('Finalizing celebration tribute...');

      const newTribute: Tribute = {
        id: tributeId,
        type: message ? 'both' : 'video',
        authorName: authorName.trim(),
        authorLocation: authorLocation.trim() || 'Worldwide',
        relationship: relationship.trim(),
        message: message.trim(),
        videoUrl: finalVideoUrl || undefined,
        cloudinaryPublicId,
        videoBlobKey,
        videoDuration: `${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')}`,
        photoUrl: photoUrl.trim() || undefined,
        createdAt: new Date().toISOString(),
        likes: 0,
        amens: 0,
        isApproved: true,
        isFeatured: false,
        storageProvider: 'cloudinary',
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
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(null);
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start sm:items-center justify-center p-0 sm:p-4">
      <div 
        className={`relative flex flex-col w-full bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden ${
          isRecording
            ? 'fixed inset-0 z-[60] h-[100dvh] w-screen max-w-none rounded-none border-0 my-0'
            : 'my-0 h-[100dvh] max-h-[100dvh] max-w-2xl rounded-none sm:my-4 sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className={`shrink-0 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 p-0.5 ${isRecording ? 'hidden' : ''}`}>
          <div className="bg-slate-950 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-black text-white">
                  Send Your Birthday Tribute
                </h3>
                <p className="hidden text-xs text-amber-200/80 sm:block">
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
          <form onSubmit={handleSubmit} className={`relative flex-1 min-h-0 overflow-y-auto space-y-5 ${isRecording ? 'overflow-hidden p-0' : 'p-4 sm:p-6'}`}>
            {/* Format selection tabs */}
            <div>
              <div className="flex flex-col items-start gap-1 mb-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs font-semibold text-slate-300">A completed video recording is required to publish.</span>
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Video Tribute</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 sm:gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  disabled={isRecording}
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
                  disabled={isRecording}
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
                <div className={`${
                  isRecording
                    ? 'absolute inset-0 z-40 flex items-center justify-center bg-black'
                    : 'relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-black'
                }`}>
                  {recordedVideoUrl ? (
                    // Review recorded video
                    <video
                      src={recordedVideoUrl}
                      controls
                      playsInline
                      preload="metadata"
                      onError={(event) => {
                        console.error('Recorded video preview playback error:', event.currentTarget.error);
                        setRecordError('This browser could not play the recorded video. Please record again or try another browser.');
                      }}
                      className="w-full h-full object-contain"
                    />
                  ) : mediaStream ? (
                    // Live camera preview
                    <video
                      ref={attachLiveVideo}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full ${isRecording ? 'object-contain' : 'object-cover'}`}
                    />
                  ) : (
                    // Camera closed
                    <div className="text-center p-6 space-y-3">
                      <Camera className="w-10 h-10 text-amber-400/70 mx-auto" />
                      <p className="text-xs text-slate-400">
                        Record a short video tribute. You can review it before submitting.
                      </p>
                      <button
                        type="button"
                        onClick={() => { void startCamera(); }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400"
                      >
                        Enable Camera & Mic
                      </button>
                    </div>
                  )}

                  {/* Recording indicator & timer */}
                  {isRecording && (
                    <>
                      <div className="absolute top-[max(1rem,env(safe-area-inset-top))] left-4 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1.5 font-mono text-xs font-bold text-white animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-white" />
                        <span>REC {formatTimer(recordingTime)} / 3:00</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopRecording}
                        aria-label="Stop recording"
                        title="Stop recording"
                        className="absolute bottom-[max(2rem,env(safe-area-inset-bottom))] left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white/80 bg-red-600 text-white shadow-xl"
                      >
                        <Square className="h-6 w-6 fill-current" />
                      </button>
                    </>
                  )}
                </div>

                {recordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{recordError}</span>
                  </div>
                )}

                {/* Camera controls */}
                {!isRecording && (
                  <div className="flex items-center justify-center gap-3">
                    {!recordedVideoUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          const startWithCamera = async () => {
                            const stream = mediaStream ?? await startCamera();
                            if (stream) startRecording(stream);
                          };
                          void startWithCamera();
                        }}
                        className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg"
                      >
                        <span className="w-3 h-3 rounded-full bg-white" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={recordAgain}
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Record Again</span>
                        </button>
                        <span className="text-center text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Video Ready ({formatTimer(recordingTime)})
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                  <option value="Overseer">Overseer</option>
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
                  placeholder="Image URL or photo link"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
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
            <div className="pt-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 border-t border-slate-800">
              {!recordedBlob && (
                <p className="mr-auto text-center sm:text-left text-xs text-amber-200/80">
                  Record and stop a video to unlock publishing.
                </p>
              )}
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
                disabled={isSubmitting || !recordedBlob}
                className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
