import { InterviewerService } from "@/services/interviewers.service";
import { NextResponse } from "next/server";
import Retell from "retell-sdk";

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY || "",
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);
    const body = await req.json();
    // Get the current interviewer to compare fields
    const current = await InterviewerService.getInterviewer(id);
    const updated = await InterviewerService.updateInterviewer(id, body);
    if (!updated) {
      
      return NextResponse.json({ error: "Failed to update interviewer" }, { status: 500 });
    }
    // If name or audio changed, update Retell agent
    if (
      (body.name && body.name !== current.name) ||
      (body.audio && body.audio !== current.audio)
    ) {
      try {
        await retellClient.agent.update(current.agent_id, {
          agent_name: body.name || current.name,
          audio: body.audio || current.audio,
        });
      } catch (err) {
        // Log but don't fail the request
        console.error("Failed to update Retell agent", err);
      }
    }

    return NextResponse.json({ interviewer: updated }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = BigInt(params.id);
    // Get the current interviewer to get agent_id
    const current = await InterviewerService.getInterviewer(id);
    const deleted = await InterviewerService.deleteInterviewer(id);
    if (!deleted) {
      
      return NextResponse.json({ error: "Failed to delete interviewer" }, { status: 500 });
    }
    // Delete the agent from Retell
    if (current && current.agent_id) {
      try {
        await retellClient.agent.delete(current.agent_id);
      } catch (err) {
        // Log but don't fail the request
        console.error("Failed to delete Retell agent", err);
      }
    }

    return NextResponse.json({ interviewer: deleted }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
