import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isValidNickname, isValidRoomCode } from "@/lib/utils";

const MAX_PLAYERS = 10;

interface JoinRoomBody {
  nickname: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body: JoinRoomBody = await request.json();

    // Validate room code format
    if (!isValidRoomCode(code.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid room code format." },
        { status: 400 }
      );
    }

    // Validate nickname
    if (!isValidNickname(body.nickname)) {
      return NextResponse.json(
        { error: "Nickname must be 2-20 characters." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Find room
    const { data: room, error: roomError } = await supabase
      .from("game_rooms")
      .select("*")
      .eq("room_code", code.toUpperCase())
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found." },
        { status: 404 }
      );
    }

    // Check room status
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Game has already started." },
        { status: 400 }
      );
    }

    // Check player count
    const { count } = await supabase
      .from("players")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id);

    if (count !== null && count >= MAX_PLAYERS) {
      return NextResponse.json(
        { error: "Room is full (max 10 players)." },
        { status: 400 }
      );
    }

    // Check nickname uniqueness in room
    const { data: existingPlayer } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", room.id)
      .eq("nickname", body.nickname.trim())
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Nickname already taken in this room." },
        { status: 409 }
      );
    }

    // Add player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        nickname: body.nickname.trim(),
      })
      .select()
      .single();

    if (playerError || !player) {
      console.error("Failed to add player:", playerError);
      return NextResponse.json(
        { error: "Failed to join room." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      room: {
        id: room.id,
        roomCode: room.room_code,
        topic: room.topic,
        durationMinutes: room.duration_minutes,
        status: room.status,
      },
      player: {
        id: player.id,
        nickname: player.nickname,
      },
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
