import { json, type ActionFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
});

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return;
  }

  const { serializedShapes } = await request.json();
  // const library = "tailwindcss";
  const library = "swiftui";

  const chatCompletion = await client.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `
I have the following HTML snippet, and I want to convert it to ${library}:
${serializedShapes}

Only output the result. Do not explain.
`,
      },
    ],
    model: "gpt-4o-mini",
  });

  return json({ html: chatCompletion }, 200);
};
