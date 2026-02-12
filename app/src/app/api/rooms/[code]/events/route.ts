import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * POST /api/rooms/[code]/events
 * Insert a game event (conflict throw, progress update, game end, etc.)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();

    const { senderId, eventType, payload } = body;

    if (!senderId || !eventType) {
      return NextResponse.json(
        { error: "Missing senderId or eventType" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get room ID from code
    const { data: room, error: roomError } = await supabase
      .from("game_rooms")
      .select("id")
      .eq("room_code", code.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from("game_events")
      .insert({
        room_id: room.id,
        sender_id: senderId,
        event_type: eventType,
        payload: payload || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Events] Insert error:", insertError.message);
      return NextResponse.json(
        { error: `Failed to insert event: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("[Events] POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rooms/[code]/events?after=<ISO timestamp>&senderId=<id>
 * Poll for new game events since a given timestamp
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const url = new URL(request.url);
    const after = url.searchParams.get("after");
    const senderId = url.searchParams.get("senderId");

    const supabase = await createServerSupabaseClient();

    // Get room ID
    const { data: room, error: roomError } = await supabase
      .from("game_rooms")
      .select("id")
      .eq("room_code", code.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Query events for this room
    let query = supabase
      .from("game_events")
      .select("*")
      .eq("room_id", room.id)
      .order("created_at", { ascending: true });

    // Filter: only events after the given timestamp
    if (after) {
      query = query.gt("created_at", after);
    }

    // Filter: exclude events from the requesting player (they already know about their own)
    if (senderId) {
      query = query.neq("sender_id", senderId);
    }

    // Limit to last 50 events to prevent huge payloads
    query = query.limit(50);

    const { data: events, error: queryError } = await query;

    if (queryError) {
      console.error("[Events] Query error:", queryError.message);
      return NextResponse.json(
        { error: `Failed to query events: ${queryError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error("[Events] GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
