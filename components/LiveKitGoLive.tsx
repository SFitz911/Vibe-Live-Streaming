"use client";

import React, { useState, useEffect, useRef } from "react";
import { LiveKitRoom, useTrackToggle, RoomAudioRenderer, useTracks, useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { scheduleAutomaticThumbnailCapture } from "@/lib/thumbnail";
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
        // Stop recording if active and wait for it to finish
        if (mediaRecorder && mediaRecorder.state !== 'inactive' && streamId) {
            mediaRecorder.stop();
            
            // Wait a moment for the onstop handler to collect final chunks
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Get chunks from ref (synchronous access)
            const allChunks = recordedChunksRef.current;
            
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

                        const response = await fetch('/api/streams/upload-recording', {
                            method: 'POST',
                            body: formData,
                        });

                        if (response.ok) {
                            console.log('✅ Recording uploaded successfully!');
                        } else {
                            console.error('❌ Failed to upload recording');
                        }
                    } catch (error) {
                        console.error('❌ Error uploading recording:', error);
                    }
                };
                
                // Start upload but don't wait for it
                uploadRecording();
            } else {
                console.log('No chunks to upload');
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
                } else {
                    console.log('⚠️ No video track found');
                }

                if (stream.getTracks().length === 0) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        console.log(`No tracks available for recording yet (attempt ${attempts}/${maxAttempts}), retrying...`);
                        timeoutId = setTimeout(startRecording, 1000);
                        return;
                    } else {
                        console.error('Failed to start recording: No tracks available after multiple attempts');
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

                // Start recording (collect data every 1 second)
                recorder.start(1000);
                setMediaRecorder(recorder);
                currentRecorder = recorder;
                
                const videoTracks = stream.getVideoTracks();
                const audioTracks = stream.getAudioTracks();
                console.log(`✅ Recording started successfully! Capturing ${videoTracks.length} video track(s) and ${audioTracks.length} audio track(s)`);
                
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

        // Listen for track published events (like screen share)
        const handleTrackPublished = (publication: any) => {
            console.log('🔄 New track published:', publication.source, '- restarting recording to capture it...');
            
            // Stop current recording (preserves chunks)
            if (currentRecorder && currentRecorder.state !== 'inactive') {
                console.log('⏹️ Stopping current recording to switch tracks...');
                currentRecorder.stop();
            }
            
            // Reset attempts counter for fresh start
            attempts = 0;
            
            // Restart recording after a longer delay to ensure new track is fully ready
            // Increased from 1500ms to 2500ms for more reliable track switching
            console.log('⏳ Waiting 2.5 seconds for track to be fully ready...');
            setTimeout(() => {
                console.log('🔄 Attempting to restart recording with new track...');
                startRecording();
            }, 2500);
        };

        localParticipant.on('trackPublished', handleTrackPublished);

        // Small delay to ensure tracks are published, then start trying
        timeoutId = setTimeout(startRecording, 1000);

        return () => {
            clearTimeout(timeoutId);
            localParticipant.off('trackPublished', handleTrackPublished);
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

    // Schedule automatic thumbnail capture after 2 minutes of streaming
    useEffect(() => {
        if (videoRef.current && streamId && activeTrack) {
            // Clear any existing timer
            if (thumbnailTimerRef.current) {
                clearTimeout(thumbnailTimerRef.current);
            }

            // Schedule thumbnail capture (5 seconds after going live)
            thumbnailTimerRef.current = scheduleAutomaticThumbnailCapture(
                videoRef.current,
                streamId,
                0.083 // Capture after 5 seconds (0.083 minutes)
            );

            console.log('🎬 Auto-thumbnail scheduled for 5 seconds from now...');
        }

        // Cleanup timer on unmount
        return () => {
            if (thumbnailTimerRef.current) {
                clearTimeout(thumbnailTimerRef.current);
            }
        };
    }, [streamId, activeTrack]);

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
                        if (videoEl && activeTrack.publication.track) {
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