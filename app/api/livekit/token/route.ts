import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const name = searchParams.get("name");
    
    if (!room || !name) {
        return NextResponse.json({ error: "Missing room or name" }, { status: 400 });
    }

    try {
        const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
            identity: name,
        });
        at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

        const token = await at.toJwt();
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Error generating LiveKit token:", error);
        return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
    }
}