# Quick Reference: Responses API vs Chat Completions

## At a Glance

### Basic Call
```python
# OLD - Chat Completions
completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Instructions"},
        {"role": "user", "content": "Input"}
    ]
)
result = completion.choices[0].message.content

# NEW - Responses API
response = client.responses.create(
    model="gpt-5",
    instructions="Instructions",
    input="Input"
)
result = response.output_text
```

### Function Calling
```python
# OLD - Tool Definition (externally tagged)
tool = {
    "type": "function",
    "function": {
        "name": "my_function",
        "description": "...",
        "parameters": {...}
    }
}

# NEW - Tool Definition (internally tagged)
tool = {
    "type": "function",
    "name": "my_function",
    "description": "...",
    "parameters": {...}
}
```

### Tool Choice
```python
# OLD
tool_choice={"type": "function", "function": {"name": "my_function"}}

# NEW
tool_choice={"type": "function", "name": "my_function"}
```

### Getting Function Arguments
```python
# OLD
tool_calls = completion.choices[0].message.tool_calls
if tool_calls:
    args = tool_calls[0].function.arguments

# NEW
function_call = None
for item in response.output:
    if item.get('type') == 'function_call' and item.get('name') == 'my_function':
        function_call = item
        break
if function_call:
    args = function_call.get('arguments', '{}')
```

## What Changed in Your Codebase

| Location | Function | Old Model | New Model |
|----------|----------|-----------|-----------|
| `utils.py:process_charity_website()` | Charity info extraction | gpt-4o | gpt-5 |
| `utils.py:generate_combined_mission_statement()` | Mission synthesis | gpt-4o-mini | gpt-5 |
| `utils.py:enhance_query_and_search()` | Query enhancement | gpt-4o | gpt-5 |

## Benefits You Get

✅ **Better Performance**: GPT-5 is more intelligent
✅ **Lower Costs**: 40-80% better cache utilization  
✅ **Cleaner Code**: Simpler API semantics
✅ **Future-Proof**: Designed for upcoming models

## Testing Commands

```bash
# Test charity registration (triggers process_charity_website)
cd backend/eunoia_backend
python manage.py shell

# In Django shell:
from main.models import Charity
charity = Charity.objects.create(
    name="Test Charity",
    website_url="https://www.charitywater.org",
    contact_email="test@example.com",
    aptos_wallet_address="0x123..."
)
# Check if description, tagline, category, keywords were populated

# Test semantic search (triggers enhance_query_and_search)
# Via API:
curl http://localhost:8080/api/charity-semantic-search/?query="clean water"

# Test from frontend
# Navigate to http://localhost:3000 and search for charities
```

## Rollback (if needed)

```python
# Change model back
model="gpt-5" → model="gpt-4o"

# Change API call
response = client.responses.create(
    instructions="...",
    input="..."
)
# Back to:
completion = client.chat.completions.create(
    messages=[
        {"role": "system", "content": "..."},
        {"role": "user", "content": "..."}
    ]
)

# Change tool definition
{"type": "function", "name": "..."} 
# Back to:
{"type": "function", "function": {"name": "..."}}

# Change output parsing
for item in response.output:
    if item.get('type') == 'function_call': ...
# Back to:
tool_calls = completion.choices[0].message.tool_calls
```

## Common Issues & Solutions

### Issue: "AttributeError: 'dict' object has no attribute 'function'"
**Solution**: You're trying to access `.function.name` on a dict. Use `item.get('name')` instead.

### Issue: "No function_call found in output"
**Solution**: Check that GPT-5 actually called the function. Print `response.output` to debug.

### Issue: "Model not found: gpt-5"
**Solution**: Ensure your OpenAI API key has access to GPT-5. Check your account tier.

### Issue: Costs increased
**Solution**: GPT-5 may have different pricing. Monitor usage and adjust `max_tokens` if needed.

## Documentation Links

- [Responses API Docs](https://platform.openai.com/docs/api-reference/responses)
- [Migration Guide](https://platform.openai.com/docs/guides/responses-migration)
- [GPT-5 Docs](https://platform.openai.com/docs/models/gpt-5)

