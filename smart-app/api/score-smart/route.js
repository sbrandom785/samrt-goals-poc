import OpenAI from "openai";

export async function POST(request) {
  try {
    const { objective } = await request.json();

    if (!objective || objective.length < 10) {
      return Response.json(
        { error: "Objective text is missing or too short." },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      input: [
        {
          role: "system",
          content: `
You are an assessor evaluating a business-case objective for introducing an HRM system.

Use ONLY the text provided by the learner.
Do NOT infer missing information.
Do NOT be generous.

Evaluate the objective against SMART criteria.

Return ONLY valid JSON in the following structure:

{
  "specific": { "score": 0, "evidence": "", "feedback": "" },
  "measurable": { "score": 0, "evidence": "", "feedback": "" },
  "achievable": { "score": 0, "evidence": "", "feedback": "" },
  "relevant": { "score": 0, "evidence": "", "feedback": "" },
  "time_bound": { "score": 0, "evidence": "", "feedback": "" }
}

Scoring rules:
- Score 0 = missing or unclear
- Score 1 = partially present
- Score 2 = clearly present

For each element:
- "evidence" must quote a short phrase from the learner text, or be empty if missing.
- "feedback" must explain what is missing or how to improve.

Never add extra fields.
Never include commentary outside JSON.
`
        },
        {
          role: "user",
          content: objective
        }
      ]
    });

    return Response.json(
      JSON.parse(response.output_text),
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { error: "AI evaluation failed." },
      { status: 500 }
    );
  }
}
