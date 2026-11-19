import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Array of tools available for Claude
const tools: Anthropic.Tool[] = [{
        name: "get_weather",
        description: "Get the current weather for a given location",
        input_schema: {
            type: "object",
            properties: {
                city: { type: "string" },
            },
            required: ["city"]
        }
    }
];

const WEATHER: Record<string, {"temp_f": string, "conditions": string}> = {
    "new york": { temp_f: "75", conditions: "Sunny" },
    "los angeles": { temp_f: "85", conditions: "Sunny" },
    "chicago": { temp_f: "65", conditions: "Cloudy" },
    "houston": { temp_f: "90", conditions: "Hot" },
    "phoenix": { temp_f: "100", conditions: "Hot" }
}

// Function to simulate running a tool
function runTool(name: string, input: any): any {
    if (name === "get_weather") {
        const city = String(input.city ?? "").toLowerCase();
        if (WEATHER[city]) {
            return WEATHER[city];
        } else {
            return { error: `City ${input.city} not found` };
        }
    } else {
        return { error: `Tool ${name} not found` };
    }
}

const messages: Anthropic.MessageParam[] = [{ 
        role: "user",
        content: "What should I wear today in New York?"
    }
];

// Agent loop to handle messages and tool calls
let turn = 0;
while (true) {
    turn++;
    const response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        messages,
        tools
    });

    console.log(`\nTurn ${turn} -- Stop Reason: ${response.stop_reason}`);
    messages.push({ role: "assistant", content: response.content });

    if (response.stop_reason === "end_turn") {
        // Claude is done, print the final text
        const text = response.content.find((b) => b.type === "text");
        if (text?.type === "text") console.log(`\nFINAL: ${text.text}`);
        break;
    }

    if (response.stop_reason === "tool_use") {
        // Find the tool blocks and run each, send results back to Claude
        const results: Anthropic.ToolResultBlockParam[] = [];
        for (const b of response.content) {
            if (b.type !== "tool_use") continue;
            const output = runTool(b.name, b.input as Record<string,unknown>);
            console.log(`  Tool: ${b.name} Input: ${JSON.stringify(b.input)} Output: ${JSON.stringify(output)}`);
            results.push({
                type: "tool_result",
                tool_use_id: b.id,
                content: JSON.stringify(output)
            });
        }
        messages.push({ 
                role: "user", 
                content: results 
            });
    }
};

// Example output:
// Turn 1 -- Stop Reason: tool_use
//   Tool: get_weather Input: {"city":"New York"} Output: {"temp_f":"75","conditions":"Sunny"}

// Turn 2 -- Stop Reason: end_turn

// FINAL: Here's the weather in New York right now:

// **75°F and Sunny** ☀️

// **What to wear:**
// - A light t-shirt or short-sleeve top
// - Shorts or light pants
// - Comfortable sneakers or sandals
// - Don't forget sunglasses and sunscreen since it's sunny!
// - If you'll be out in the evening, you might want a light jacket or sweater in case it cools down

// It's a great day to be outside! Enjoy the nice weather in NYC.