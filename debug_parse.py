import json
import re

with open('/home/alono/Downloads/CV_ALS/web_cv/AISafety/posts/Consensus Through Debate/media/results.md', 'r') as f:
    text = f.read()

# Try a simpler regex-based parsing over the whole text, since splitting by line might fail if things are split incorrectly

blocks = text.split("Flow started with ID:")
flows = []
for block in blocks[1:]:
    tasks = []
    
    # We can find all agent names, tasks, and final answers in order
    matches = re.finditer(r'# Agent:.*?<span[^>]*>(.*?)</span>\s*(?:## Task:.*?<span[^>]*>(.*?)(?=</span>|<span)|## Final Answer:.*?<span[^>]*>\n?(.*?)(?=</span>|<span))', block, re.DOTALL)
    
    for m in matches:
        agent = m.group(1).strip()
        task = m.group(2).strip() if m.group(2) else None
        ans = m.group(3).strip() if m.group(3) else None
        print(f"Agent: {agent}, Task: {bool(task)}, Ans: {bool(ans)}")
