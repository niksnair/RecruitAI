import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

const getAllInterviewers = async (clientId: string = "") => {
  try {
    const { data: clientData, error: clientError } = await supabase
      .from("interviewer")
      .select(`*`);

    if (clientError) {
      console.error(
        `Error fetching interviewers for clientId ${clientId}:`,
        clientError,
      );

      return [];
    }

    return clientData || [];
  } catch (error) {
    console.log(error);

    return [];
  }
};

const createInterviewer = async (payload: any) => {
  // Check for existing interviewer with the same name
  const { data: existingInterviewer, error: checkError } = await supabase
    .from("interviewer")
    .select("*")
    .eq("name", payload.name)
    .filter("agent_id", "eq", payload.agent_id)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking existing interviewer:", checkError);

    return null;
  }

  if (existingInterviewer) {
    console.error("An interviewer with this name already exists");

    return null;
  }

  const { error, data } = await supabase
    .from("interviewer")
    .insert({ ...payload });

  if (error) {
    console.error("Error creating interviewer:", error);

    return null;
  }

  return data;
};

const getInterviewer = async (interviewerId: bigint) => {
  const { data: interviewerData, error: interviewerError } = await supabase
    .from("interviewer")
    .select("*")
    .eq("id", interviewerId)
    .single();

  if (interviewerError) {
    console.error("Error fetching interviewer:", interviewerError);

    return null;
  }

  return interviewerData;
};

const updateInterviewer = async (id: number | bigint, payload: any) => {
  const { error, data } = await supabase
    .from("interviewer")
    .update({ ...payload })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating interviewer:", error);
    return null;
  }

  return data;
};

const deleteInterviewer = async (id: number | bigint) => {
  const { error, data } = await supabase
    .from("interviewer")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error deleting interviewer:", error);
    return null;
  }

  return data;
};

export const InterviewerService = {
  getAllInterviewers,
  createInterviewer,
  getInterviewer,
  updateInterviewer,
  deleteInterviewer,
};
