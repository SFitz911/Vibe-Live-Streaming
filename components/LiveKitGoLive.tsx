"use client";

import React, { useState, useEffect } from "react";
import { LiveKitRoom, VideoConference, useTrackToggle, RoomAudioRenderer, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

// Utility to fetch a LiveKit token from your backend
async function fetchLiveKitToken(room: string, name: string): Promise<string> {
    const resp = await fetch(`/api/livekit/token?room=${room}&name=${name}`);
    if (!resp.ok) throw new Error("Failed to fetch LiveKit token");
    const data = await resp.json();
    return data.token;
}

// Create a stream in the database
async function createLiveStream(roomName: string, userName: string): Promise<string> {
    const resp = await fetch('/api/streams/livekit-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            roomName,
            userName,
            title: `${userName}'s Live Stream`,
            description: 'Live coding session',
            category: 'Web Development',
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
}

export default function LiveKitGoLive({ roomName, userName }: LiveKitGoLiveProps) {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);
    const [streamId, setStreamId] = useState<string | null>(null);

    const handleJoin = async () => {
        setError(null);
        try {
            // Step 1: Create stream in database
            const newStreamId = await createLiveStream(roomName, userName);
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
        // End stream in database
        if (streamId) {
            try {
                await endLiveStream(streamId);
            } catch (e) {
                console.error('Error ending stream:', e);
            }
        }
        
        setJoined(false);
        setToken(null);
        setStreamId(null);
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
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880"}
                connect={true}
                data-lk-theme="default"
                onDisconnected={handleLeave}
                onError={(error) => {
                    console.error('LiveKit connection error:', error);
                    setError(error.message);
                }}
            >
                <RoomAudioRenderer />
                
                {/* Video Area */}
                <div className="w-full h-[600px] relative bg-gray-950 overflow-hidden">
                    <VideoConference />
                </div>
                
                {/* Controls Below Video */}
                <div className="w-full bg-gray-800 p-4">
                    <LiveKitControls onLeave={handleLeave} />
                </div>
            </LiveKitRoom>
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