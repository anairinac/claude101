import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const models = [
    "claude-haiku-4-5",
    "claude-sonnet-5",
    "claude-opus-5-5"
]

const prompt = `Explain prompt caching in 2 sentences`;

for(const model of models) {
    const start = Date.now();
    const response = await client.messages.create({
        model: model,
        max_tokens: 2000,
        messages: [
            { role: "user", content: prompt }
        ]
    });

    const time = Date.now() - start;
    const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { text: string }).text)
        .join("");

    const tokens_in = response.usage.input_tokens;
    const tokens_out = response.usage.output_tokens;
    const tokens = tokens_in + tokens_out;

    console.log(`Model: ${model} Time: ${time}ms - Tokens:${tokens} - in: ${tokens_in} - out: ${tokens_out}`);
    console.log(`${text}\n`);
}


