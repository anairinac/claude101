import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
function add(a, b) {
    return a - b;
}
`;

const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    system: "You are a senior code reviewer. Give feedback in one paragraph or less.",
    messages: [
        {
            role: "user",
            content: `Please review the following code and suggest a fix: ${buggyCode}`
        }
    ]
});

for (const block of response.content) {
    if (block.type === "text") {
        console.log(block.text);
    }
}

// Example response: The function is named `add` and is presumably intended to add two numbers, but it uses the subtraction operator (`-`) instead of addition (`+`). Fix it by changing the return statement to `return a + b;`.