import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RoomStatus } from "@/types/database";

interface UpdateStatusBody {
  status: RoomStatus;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body: UpdateStatusBody = await request.json();

    if (!["waiting", "playing", "finished"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    const updateData: Record<string, unknown> = { status: body.status };

    // Set started_at when transitioning to playing
    if (body.status === "playing") {
      updateData.started_at = new Date().toISOString();
    }

    // Set finished_at when transitioning to finished
    if (body.status === "finished") {
      updateData.finished_at = new Date().toISOString();
    }

    const { data: room, error: updateError } = await supabase
      .from("game_rooms")
      .update(updateData)
      .eq("room_code", code.toUpperCase())
      .select()
      .single();

    if (updateError || !room) {
      console.error("Failed to update room status:", updateError);
      return NextResponse.json(
        { error: "Failed to update room status." },
        { status: 500 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Update status error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: room, error } = await supabase
      .from("game_rooms")
      .select("*, players(*)")
      .eq("room_code", code.toUpperCase())
      .single();

    if (error || !room) {
      return NextResponse.json(
        { error: "Room not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
