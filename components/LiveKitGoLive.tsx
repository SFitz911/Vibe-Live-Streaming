"use client";

import React, { useState, useEffect, useRef } from "react";
import { LiveKitRoom, useTrackToggle, RoomAudioRenderer, useTracks, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { captureAllClips, uploadClips } from "@/lib/clipCapture";
import { supabase } from "@/lib/supabase";

// Utility to fetch a LiveKit token from your backend
async function fetchLiveKitToken(room: string, name: string): Promise<string> {
    const resp = await fetch(`/api/livekit/token?room=${room}&name=${name}`);
    if (!resp.ok) throw new Error("Failed to fetch LiveKit token");
    const data = await resp.json();
    return data.token;
}

// Create a stream in the database
async function createLiveStream(
    roomName: string, 
    userName: string,
    userId?: string,
    title?: string, 
    description?: string, 
    category?: string,
    tags?: string
): Promise<string> {
    const resp = await fetch('/api/streams/livekit-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomName,
            userName,
            userId, // Pass the authenticated user ID
            title: title || `${userName}'s Live Stream`,
            description: description || 'Live coding session',
            category: category || 'Web Development',
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
        }),
    });
    
    if (!resp.ok) throw new Error("Failed to create stream");
    const data = await resp.json();
    return data.streamId;
}

// End the stream in the database
async function endLiveStream(streamId: string): Promise<void> {
    await fetch('/api/streams/livekit-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId }),
    });
}

interface LiveKitGoLiveProps {
    roomName: string;
    userName: string;
    userId?: string;
    streamTitle?: string;
    streamDescription?: string;
    streamCategory?: string;
    streamTags?: string;
}

export default function LiveKitGoLive({ 
    roomName, 
    userName,
    userId,
    streamTitle, 
    streamDescription, 
    streamCategory, 
    streamTags 
}: LiveKitGoLiveProps) {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);
    const [streamId, setStreamId] = useState<string | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const recordedChunksRef = useRef<Blob[]>([]); // Ref for synchronous access

    // Auto-end stream on browser close or tab close
    useEffect(() => {
        const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
            if (streamId) {
                // Use sendBeacon for reliable cleanup on page unload
                const data = JSON.stringify({ streamId });
                navigator.sendBeacon('/api/streams/livekit-end', data);
            }
        };

        const handleVisibilityChange = async () => {
            if (document.hidden && streamId) {
                // Tab is hidden/browser minimized - warn but don't end
                console.log('Tab hidden - stream continues');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [streamId]);

    const handleJoin = async () => {
        setError(null);
        try {
            // Step 1: Create stream in database
            const newStreamId = await createLiveStream(
                roomName, 
                userName,
                userId, // Pass authenticated user ID
                streamTitle, 
                streamDescription, 
                streamCategory,
                streamTags
            );
            setStreamId(newStreamId);
            
            // Step 2: Get LiveKit token
            const t = await fetchLiveKitToken(roomName, userName);
            setToken(t);
            setJoined(true);
        } catch (e: any) {
            setError(e.message || "Failed to join room");
        }
    };

    const handleLeave = async () => {
        console.log('🔴 End Stream clicked!');
        console.log('MediaRecorder state:', mediaRecorder?.state);
        console.log('StreamID:', streamId);
        
        // Stop recording if active and wait for it to finish
        if (mediaRecorder && mediaRecorder.state !== 'inactive' && streamId) {
            console.log('⏹️ Stopping MediaRecorder...');
            
            // Wait for onstop handler to complete using a Promise
            await new Promise<void>((resolve) => {
                const originalOnStop = mediaRecorder.onstop;
                mediaRecorder.onstop = (event) => {
                    if (originalOnStop) originalOnStop.call(mediaRecorder, event);
                    console.log('✅ MediaRecorder onstop handler completed');
                    resolve();
                };
                mediaRecorder.stop();
            });
            
            // Additional wait to ensure file is fully finalized
            console.log('⏳ Waiting for file finalization...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get chunks from ref (synchronous access)
            const allChunks = recordedChunksRef.current;
            console.log(`📊 Chunks collected: ${allChunks.length} chunks`);
            
            if (allChunks.length > 0) {
                // Upload in background (don't await) so UI can close immediately
                const uploadRecording = async () => {
                    try {
                        console.log(`📤 Uploading recording with ${allChunks.length} chunks in background...`);
                        const blob = new Blob(allChunks, { type: 'video/webm' });
                        console.log(`📦 Recording size: ${(blob.size / 1024 / 1024).toFixed(2)} MB`);
                        
                        const formData = new FormData();
                        formData.append('file', blob);
                        formData.append('streamId', streamId);

                        console.log('🚀 Starting upload to /api/streams/upload-recording...');
                        const response = await fetch('/api/streams/upload-recording', {
                            method: 'POST',
                            body: formData,
                        });

                        console.log('📡 Upload response status:', response.status);
                        
                        if (response.ok) {
                            const result = await response.json();
                            console.log('✅ Recording uploaded successfully!', result);
                        } else {
                            const errorText = await response.text();
                            console.error('❌ Failed to upload recording. Status:', response.status, 'Error:', errorText);
                        }
                    } catch (error) {
                        console.error('❌ Error uploading recording:', error);
                    }
                };
                
                // Start upload but don't wait for it
                console.log('🎬 Triggering upload function...');
                uploadRecording();
            } else {
                console.warn('⚠️ No chunks to upload - recording may have failed!');
            }
        }

        // End stream in database
        if (streamId) {
            try {
                await endLiveStream(streamId);
            } catch (e) {
                console.error('Error ending stream:', e);
            }
        }
        
        // Close UI immediately (upload continues in background)
        setJoined(false);
        setToken(null);
        setStreamId(null);
        setMediaRecorder(null);
        setRecordedChunks([]);
    };

    if (!joined) {
        return (
            <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-gray-800">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Go Live with Your Camera</h3>
                <button
                    onClick={handleJoin}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors mb-3 shadow-md text-lg"
                >
                    Start Camera & Join Room
                </button>
                {error && <div className="text-red-500 mt-2 text-center">{error}</div>}
                <div className="text-gray-400 text-base mt-6 text-center">You will be asked for camera/mic permissions.</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800 w-full">
            <LiveKitRoom
                token={token!}
                serverUrl="wss://videostreamv5-yz05w4m7.livekit.cloud"
                connect={true}
                data-lk-theme="default"
                onDisconnected={handleLeave}
                onError={(error) => {
                    console.error('LiveKit connection error:', error);
                    setError(error.message);
                }}
            >
                <RoomAudioRenderer />
                <VideoWithZoom 
                    onLeave={handleLeave}
                    setMediaRecorder={setMediaRecorder}
                    setRecordedChunks={setRecordedChunks}
                    recordedChunksRef={recordedChunksRef}
                    streamId={streamId}
                />
            </LiveKitRoom>
        </div>
    );
}

// Zoom state context
const ZoomContext = React.createContext<{
    zoom: number;
    position: { x: number; y: number };
    setZoom: (zoom: number) => void;
    setPosition: (pos: { x: number; y: number }) => void;
    isScreenShare: boolean;
}>({
    zoom: 1,
    position: { x: 0, y: 0 },
    setZoom: () => {},
    setPosition: () => {},
    isScreenShare: false,
});

// Wrapper component that provides zoom context and recording
function VideoWithZoom({ 
    onLeave, 
    setMediaRecorder, 
    setRecordedChunks,
    recordedChunksRef,
    streamId 
}: { 
    onLeave: () => void;
    setMediaRecorder: (recorder: MediaRecorder | null) => void;
    setRecordedChunks: React.Dispatch<React.SetStateAction<Blob[]>>;
    recordedChunksRef: React.MutableRefObject<Blob[]>;
    streamId?: string | null;
}) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isScreenShare, setIsScreenShare] = useState(false);

    return (
        <ZoomContext.Provider value={{ zoom, position, setZoom, setPosition, isScreenShare }}>
            <RecordingManager 
                setMediaRecorder={setMediaRecorder}
                setRecordedChunks={setRecordedChunks}
                recordedChunksRef={recordedChunksRef}
            />
            
            {/* Video Area with Zoom Controls */}
            <div className="relative">
                <div className="w-full h-[600px] bg-gray-950 overflow-hidden">
                    <CustomVideoDisplay streamId={streamId || undefined} />
                </div>
                
                {/* Zoom Controls - Positioned outside top-right */}
                <ZoomControls />
            </div>
            
            {/* Controls Below Video */}
            <div className="w-full bg-gray-800 p-4">
                <LiveKitControls onLeave={onLeave} />
            </div>
        </ZoomContext.Provider>
    );
}

// Component to handle stream recording
function RecordingManager({
    setMediaRecorder,
    setRecordedChunks,
    recordedChunksRef,
}: {
    setMediaRecorder: (recorder: MediaRecorder | null) => void;
    setRecordedChunks: React.Dispatch<React.SetStateAction<Blob[]>>;
    recordedChunksRef: React.MutableRefObject<Blob[]>;
}) {
    const { localParticipant } = useLocalParticipant();
    const currentTrackSourceRef = useRef<'camera' | 'screen_share' | null>(null);
    const lastDetectedSourceRef = useRef<'camera' | 'screen_share' | null>(null);
    const detectionCountRef = useRef<number>(0);

    useEffect(() => {
        if (!localParticipant) return;

        let attempts = 0;
        const maxAttempts = 10; // Try for up to 10 seconds
        let timeoutId: NodeJS.Timeout;
        let currentRecorder: MediaRecorder | null = null;

        // Get all local tracks (camera and screen share)
        const startRecording = async () => {
            try {
                // Create a canvas to capture the stream
                const stream = new MediaStream();
                
                // Add audio tracks
                localParticipant.audioTrackPublications.forEach((pub) => {
                    if (pub.track) {
                        stream.addTrack(pub.track.mediaStreamTrack);
                    }
                });

                // Add video track - prioritize screen share over camera
                // MediaRecorder typically only records ONE video track, so we must choose
                const screenShareTrack = Array.from(localParticipant.videoTrackPublications.values())
                    .find(pub => pub.source === 'screen_share' && pub.track);
                
                const cameraTrack = Array.from(localParticipant.videoTrackPublications.values())
                    .find(pub => pub.source === 'camera' && pub.track);
                
                const activeVideoTrack = screenShareTrack || cameraTrack;
                
                if (activeVideoTrack && activeVideoTrack.track) {
                    console.log(`📹 Recording video from: ${activeVideoTrack.source}`);
                    console.log(`   Track ID: ${activeVideoTrack.track.mediaStreamTrack.id}`);
                    console.log(`   Track state: ${activeVideoTrack.track.mediaStreamTrack.readyState}`);
                    stream.addTrack(activeVideoTrack.track.mediaStreamTrack);
                    
                    // Track which source we're recording from (use ref to avoid stale closures)
                    currentTrackSourceRef.current = activeVideoTrack.source as 'camera' | 'screen_share';
                } else {
                    console.log('⚠️ No video track found');
                    currentTrackSourceRef.current = null;
                }

                // Check if we have BOTH audio and video tracks before starting recording
                const audioTracks = stream.getAudioTracks();
                const videoTracks = stream.getVideoTracks();
                
                console.log(`🔍 Track check: ${audioTracks.length} audio, ${videoTracks.length} video`);
                
                if (audioTracks.length === 0 || videoTracks.length === 0) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`⏳ Waiting for both audio and video tracks (attempt ${attempts}/${maxAttempts}), retrying...`);
                        timeoutId = setTimeout(startRecording, 1000);
                        return;
                    } else {
                        console.error('❌ Failed to start recording: Missing audio or video after multiple attempts');
                        console.error(`   Audio tracks: ${audioTracks.length}, Video tracks: ${videoTracks.length}`);
                        return;
                    }
                }

                // Create MediaRecorder
                const recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp9,opus',
                });

                const chunks: Blob[] = [];

                recorder.ondataavailable = (event) => {
                    if (event.data && event.data.size > 0) {
                        chunks.push(event.data);
                    }
                };

                recorder.onstop = () => {
                    console.log('Recording stopped, total chunks:', chunks.length);
                    setRecordedChunks(prevChunks => {
                        const newChunks = [...prevChunks, ...chunks];
                        recordedChunksRef.current = newChunks; // Also update ref
                        return newChunks;
                    });
                };

                // Verify we have both tracks before starting
                const finalVideoTracks = stream.getVideoTracks();
                const finalAudioTracks = stream.getAudioTracks();
                
                if (finalAudioTracks.length === 0 || finalVideoTracks.length === 0) {
                    console.error('❌ Cannot start recording without both audio and video!');
                    console.error(`   Audio: ${finalAudioTracks.length}, Video: ${finalVideoTracks.length}`);
                    return;
                }
                
                // Start recording (collect data every 1 second)
                recorder.start(1000);
                setMediaRecorder(recorder);
                currentRecorder = recorder;
                
                console.log(`✅ Recording started successfully! Capturing ${finalVideoTracks.length} video track(s) and ${finalAudioTracks.length} audio track(s)`);
                
                // Verify recording actually started
                if (recorder.state === 'recording') {
                    console.log('✅ MediaRecorder state confirmed: recording');
                } else {
                    console.error('❌ MediaRecorder failed to start! State:', recorder.state);
                }
            } catch (error) {
                console.error('Error starting recording:', error);
            }
        };

        // Monitor for track changes (screen share start/stop) with debouncing
        const checkIntervalId = setInterval(() => {
            const hasScreenShare = Array.from(localParticipant.videoTrackPublications.values())
                .some(pub => pub.source === 'screen_share' && pub.track);
            
            const hasCamera = Array.from(localParticipant.videoTrackPublications.values())
                .some(pub => pub.source === 'camera' && pub.track);
            
            const desiredSource = hasScreenShare ? 'screen_share' : (hasCamera ? 'camera' : null);
            
            // Debounce: Only switch if the desired source has been stable for 3 consecutive checks
            if (desiredSource === lastDetectedSourceRef.current) {
                detectionCountRef.current += 1;
            } else {
                lastDetectedSourceRef.current = desiredSource;
                detectionCountRef.current = 1;
            }
            
            // Only switch if we've detected the same source for 3+ consecutive checks (3 seconds)
            // AND it's different from what we're currently recording
            if (
                desiredSource && 
                desiredSource !== currentTrackSourceRef.current && 
                detectionCountRef.current >= 3 &&
                currentRecorder
            ) {
                console.log(`🔄 Track change detected! Switching from ${currentTrackSourceRef.current} to ${desiredSource}`);
                console.log('⏹️ Stopping current recording to switch tracks...');
                
                if (currentRecorder.state !== 'inactive') {
                    currentRecorder.stop();
                }
                
                attempts = 0;
                detectionCountRef.current = 0; // Reset counter after switching
                
                console.log('⏳ Waiting 2.5 seconds for new track to be fully ready...');
                setTimeout(() => {
                    console.log(`🔄 Attempting to restart recording with ${desiredSource}...`);
                    startRecording();
                }, 2500);
            }
        }, 1000); // Check every second for track changes

        // Wait 2 seconds to ensure mic and camera are auto-enabled before attempting recording
        timeoutId = setTimeout(startRecording, 2000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(checkIntervalId);
            if (currentRecorder && currentRecorder.state !== 'inactive') {
                currentRecorder.stop();
            }
        };
    }, [localParticipant, setMediaRecorder, setRecordedChunks]);

    return null; // This component doesn't render anything
}

// Custom video display that prioritizes screen share over camera
function CustomVideoDisplay({ streamId }: { streamId?: string }) {
    const { localParticipant } = useLocalParticipant();
    const { zoom, position, setPosition } = React.useContext(ZoomContext);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    const thumbnailTimerRef = useRef<NodeJS.Timeout | null>(null);
    const captureAttemptedRef = useRef<boolean>(false); // Prevent multiple captures
    
    const tracks = useTracks([
        { source: Track.Source.ScreenShare, withPlaceholder: false },
        { source: Track.Source.Camera, withPlaceholder: false },
    ]);

    // Find screen share or camera from local participant
    const screenShareTrack = tracks.find(
        t => t.source === Track.Source.ScreenShare && 
        t.participant.identity === localParticipant.identity
    );
    
    const cameraTrack = tracks.find(
        t => t.source === Track.Source.Camera && 
        t.participant.identity === localParticipant.identity
    );

    // Prioritize screen share over camera
    const activeTrack = screenShareTrack || cameraTrack;
    const isScreenShare = !!screenShareTrack;

    // Schedule automatic clip capture at 20-second mark
    useEffect(() => {
        // Only schedule if we have everything we need AND haven't attempted capture yet
        if (videoRef.current && streamId && activeTrack && localParticipant && !captureAttemptedRef.current) {
            
            captureAttemptedRef.current = true; // Mark that we're attempting capture
            
            // Schedule clip capture after 20 seconds
            thumbnailTimerRef.current = setTimeout(async () => {
                console.log('🎬 20-second mark reached! Capturing clips...');
                
                try {
                    // Get the MediaStream from local participant at capture time
                    const stream = new MediaStream();
                    
                    // Add video track - get fresh reference
                    const videoTrack = Array.from(localParticipant.videoTrackPublications.values())
                        .find(pub => (pub.source === 'screen_share' || pub.source === 'camera') && pub.track);
                    
                    if (videoTrack?.track) {
                        stream.addTrack(videoTrack.track.mediaStreamTrack);
                    }
                    
                    // Add audio tracks
                    localParticipant.audioTrackPublications.forEach((pub) => {
                        if (pub.track) {
                            stream.addTrack(pub.track.mediaStreamTrack);
                        }
                    });

                    if (stream.getTracks().length === 0) {
                        console.error('❌ No tracks available for clip capture');
                        return;
                    }

                    // Capture all three clips
                    const clips = await captureAllClips(stream, videoRef.current!);
                    
                    // Upload clips to server
                    const success = await uploadClips(streamId, clips);
                    
                    if (success) {
                        console.log('✅ All clips captured and uploaded successfully!');
                    } else {
                        console.error('❌ Failed to upload clips');
                    }
                    
                } catch (error) {
                    console.error('❌ Error during clip capture:', error);
                }
            }, 20000); // 20 seconds

            console.log('⏱️ Clip capture scheduled for 20 seconds from now...');
        }

        // Cleanup ONLY on unmount, not on re-renders
        return () => {
            // Only clear if component is truly unmounting (streamId becomes null/undefined)
            if (!streamId && thumbnailTimerRef.current) {
                clearTimeout(thumbnailTimerRef.current);
                thumbnailTimerRef.current = null;
                captureAttemptedRef.current = false;
            }
        };
    }, [streamId, activeTrack, localParticipant]); // Dependencies needed to know when to start

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1 && isScreenShare) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    if (!activeTrack) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <div className="text-6xl mb-4">📹</div>
                    <p>Waiting for camera or screen share...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center bg-black">
            <div
                className={`w-full h-full ${zoom > 1 && isScreenShare ? 'cursor-grab active:cursor-grabbing' : ''}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                <video
                    ref={(videoEl) => {
                        if (videoEl && activeTrack.publication?.track) {
                            activeTrack.publication.track.attach(videoEl);
                            // Also store in videoRef for thumbnail capture
                            (videoRef as any).current = videoEl;
                        }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}

// Zoom controls component - positioned outside the video box
function ZoomControls() {
    const { localParticipant } = useLocalParticipant();
    const { zoom, setZoom, setPosition, isScreenShare: contextScreenShare } = React.useContext(ZoomContext);
    
    const tracks = useTracks([
        { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]);

    const screenShareTrack = tracks.find(
        t => t.source === Track.Source.ScreenShare && 
        t.participant.identity === localParticipant.identity
    );
    
    const isScreenShare = !!screenShareTrack;

    // Reset zoom when screen share stops
    useEffect(() => {
        if (!isScreenShare) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isScreenShare, setZoom, setPosition]);

    if (!isScreenShare) {
        return null;
    }

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.25, 3));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.25, 1));
    const handleZoomReset = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <div className="absolute -top-2 -right-2 z-30 flex flex-col gap-2 bg-gray-800/95 rounded-lg p-2 border-2 border-blue-500 shadow-xl">
            <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors"
            >
                🔍+ Zoom In
            </button>
            <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors"
            >
                🔍- Zoom Out
            </button>
            <button
                onClick={handleZoomReset}
                disabled={zoom === 1}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm font-semibold transition-colors"
            >
                ↺ Reset
            </button>
            <div className="text-center text-xs text-gray-300 mt-1 font-bold">
                {Math.round(zoom * 100)}%
            </div>
        </div>
    );
}

// Controls component inside LiveKitRoom context
function LiveKitControls({ onLeave }: { onLeave: () => void }) {
    const camera = useTrackToggle({ source: Track.Source.Camera });
    const microphone = useTrackToggle({ source: Track.Source.Microphone });
    const screenShare = useTrackToggle({ source: Track.Source.ScreenShare });

    // Auto-enable camera after connection is established
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!camera.enabled) {
                camera.toggle();
            }
        }, 1000); // Wait 1 second for connection to stabilize

        return () => clearTimeout(timer);
    }, []);

    // Auto-enable microphone after connection is established
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!microphone.enabled) {
                console.log('🎤 Auto-enabling microphone for recording...');
                microphone.toggle();
            }
        }, 1000); // Wait 1 second for connection to stabilize

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full flex justify-center">
            <div className="flex flex-row gap-3">
                <button
                    onClick={() => camera.toggle()}
                    disabled={camera.pending}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${camera.enabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                    <span className="mr-2 text-xl">
                        {camera.enabled ? '📹' : '📷'}
                    </span>
                    <span className="text-sm font-medium">{camera.enabled ? "Camera is On" : "Camera is Off"}</span>
                </button>
                <button
                    onClick={() => microphone.toggle()}
                    disabled={microphone.pending}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${microphone.enabled ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                    <span className="mr-2 text-xl">
                        {microphone.enabled ? '🎤' : '🔇'}
                    </span>
                    <span className="text-sm font-medium">{microphone.enabled ? "Mic is On" : "Mic is Off"}</span>
                </button>
                <button
                    onClick={() => screenShare.toggle()}
                    disabled={screenShare.pending}
                    className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-md ${screenShare.enabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                >
                    <span className="mr-2 text-xl">
                        {screenShare.enabled ? '🖥️' : '📱'}
                    </span>
                    <span className="text-sm font-medium">{screenShare.enabled ? "Screen Sharing is On" : "Screen Sharing is Off"}</span>
                </button>
                <button
                    onClick={onLeave}
                    className="flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors shadow-md bg-red-600 hover:bg-red-700 text-white"
                >
                    <span className="mr-2 text-xl">⏹️</span>
                    <span className="text-sm font-medium">End Stream</span>
                </button>
            </div>
        </div>
    );
}