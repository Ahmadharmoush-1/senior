export const runFreeAI = async (prompt: string): Promise<string> => {
  const HF_MODEL = "Qwen/Qwen2.5-1.5B-Instruct";

  const response = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 220,
          temperature: 0.7,
        },
      }),
    }
  );

  const data = await response.json();

  const raw = data?.[0]?.generated_text || "";
  return raw.replace(prompt, "").trim();
};
