import anthropic
import json
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

client = anthropic.Anthropic()

# Array of tools available for Claude
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a given location",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {"type": "string"}
            },
            "required": ["city"]
        }
    }
]

weather = {
    "new york": { "temp_f": "75", "conditions": "Sunny" },
    "los angeles": { "temp_f": "85", "conditions": "Sunny" },
    "chicago": { "temp_f": "65", "conditions": "Cloudy" },
    "houston": { "temp_f": "90", "conditions": "Hot" },
    "phoenix": { "temp_f": "100", "conditions": "Hot" }
}

# Function to simulate running a tool
def run_tool(name: str, input: dict) -> dict:
    if name == "get_weather":
        city = input.get("city", "").lower()
        if city in weather:
            return weather[city]
        else:
            return {"error": f"City {input.get('city')} not found"}
    else:
        return {"error": f"Tool {name} not found"}

messages = [{
        "role": "user",
        "content": "What should I wear today in New York?"
    }
]

# Agent loop to handle messages and tool calls
while True:
    response = client.messages.create(
        model = "claude-sonnet-5",
        max_tokens = 1024,
        messages = messages,
        tools = tools
    )1
    
    if response.stop_reason == "end_turn":
        # Claude is done, print the final text
        for b in response.content:
            print(b.text)
        break

    elif response.stop_reason == "tool_use":
        # Find the tool blocks and run each, send results back to Claude
        results = []
        for b in response.content:
            if b.type == "tool_use":
                # Run the tool and get the result
                result = run_tool(b.name, b.input)
                results.append({
                    "type": "tool_result",
                    "tool_use_id": b.id,
                    "content": json.dumps(result)
                })
        
        messages.append({
            "role": "assistant",
            "content": response.content
        })
        messages.append({
            "role": "user",
            "content": results
        })

# ✗ python claude-platform-101/4b-agent-loop.py
# It's a sunny day in New York with a temperature of about 75°F (24°C). Here's what I'd recommend wearing:

# - **Top:** A light t-shirt, short-sleeve shirt, or a casual blouse
# - **Bottom:** Jeans, chinos, or shorts if you'll be outside a lot
# - **Footwear:** Sneakers or comfortable casual shoes
# - **Extras:** 
#   - Sunglasses, since it's sunny
#   - A light jacket or cardigan if you plan to be out in the evening, as temperatures can dip a bit after sunset
#   - Sunscreen if you'll be outdoors for extended periods

# Overall, it's great weather for a light, breathable outfit! Enjoy your day. 🌞