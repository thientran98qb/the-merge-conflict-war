import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateRoomCode, isValidNickname } from "@/lib/utils";
import { generateGameTickets } from "@/lib/ai";
import type { Topic } from "@/types/database";

interface CreateRoomBody {
  topic: Topic;
  durationMinutes: number;
  nickname: string;
}

export async function POST(request: Request) {
  try {
    const body: CreateRoomBody = await request.json();

    // Validate inputs
    if (!["php", "frontend", "mix"].includes(body.topic)) {
      return NextResponse.json(
        { error: "Invalid topic. Must be php, frontend, or mix." },
        { status: 400 }
      );
    }

    if (![10, 15].includes(body.durationMinutes)) {
      return NextResponse.json(
        { error: "Invalid duration. Must be 10 or 15 minutes." },
        { status: 400 }
      );
    }

    if (!isValidNickname(body.nickname)) {
      return NextResponse.json(
        { error: "Nickname must be 2-20 characters." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Generate unique room code (retry up to 5 times)
    let roomCode = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateRoomCode();
      const { data: existing } = await supabase
        .from("game_rooms")
        .select("id")
        .eq("room_code", candidate)
        .single();

      if (!existing) {
        roomCode = candidate;
        break;
      }
    }

    if (!roomCode) {
      return NextResponse.json(
        { error: "Failed to generate unique room code. Please try again." },
        { status: 500 }
      );
    }

    // Generate tickets via AI (with fallback to presets)
    console.log(`[Room] Generating tickets for topic: ${body.topic}, provider: ${process.env.AI_PROVIDER || "openai"}`);
    const tickets = await generateGameTickets(body.topic, 30);
    console.log(`[Room] Generated ${tickets.length} tickets. First ticket id: ${tickets[0]?.id}`);

    // Create room
    const { data: room, error: roomError } = await supabase
      .from("game_rooms")
      .insert({
        room_code: roomCode,
        topic: body.topic,
        duration_minutes: body.durationMinutes,
        tickets: JSON.parse(JSON.stringify(tickets)),
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error("Failed to create room:", roomError);
      return NextResponse.json(
        { error: "Failed to create room." },
        { status: 500 }
      );
    }

    // Join creator as first player
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
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
