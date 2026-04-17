import json
import re

with open('/home/alono/Downloads/CV_ALS/web_cv/AISafety/posts/Consensus Through Debate/media/results.md', 'r') as f:
    text = f.read()

flows_texts = text.split("Flow started with ID:")

results_data = []
tab_names = ["Experiment 1", "Experiment 2", "Experiment 3", "Experiment 4"]

for i, flow_text in enumerate(flows_texts[1:]):
    name = tab_names[i] if i < len(tab_names) else f"Flow {i+1}"
    
    # Extract all elements sequentially
    elements = []
    
    for m in re.finditer(r'# Agent:</span> <span[^>]*></span><span[^>]*>(.*?)</span>', flow_text):
        elements.append({"type": "Agent", "content": m.group(1), "pos": m.start()})
        
    for m in re.finditer(r'## Task:</span> <span[^>]*>(.*?)</span>', flow_text, re.DOTALL):
        elements.append({"type": "Task", "content": m.group(1).strip(), "pos": m.start()})
        
    for m in re.finditer(r'## Final Answer:</span> <span[^>]*>(.*?)</span>', flow_text, re.DOTALL):
        elements.append({"type": "Final Answer", "content": m.group(1).strip(), "pos": m.start()})
        
    elements.sort(key=lambda x: x["pos"])
    
    dev_list = []
    final_ans = ""
    current_agent = "Unknown"
    last_task_desc = "Task"
    
    for el in elements:
        if el["type"] == "Agent":
            current_agent = el["content"]
        elif el["type"] == "Task":
            last_task_desc = el["content"]
        elif el["type"] == "Final Answer":
            # Extract first line of task description, max 80 chars
            task_snippet = last_task_desc.split("\n")[0][:80]
            if len(last_task_desc.split("\n")[0]) > 80:
                task_snippet += "..."
                
            dev_list.append({
                "title": f"{current_agent} - {task_snippet}",
                "content": el["content"]
            })
            
    if dev_list:
        final_ans_item = dev_list.pop()
        final_ans = final_ans_item["content"]
        
    results_data.append({
        "name": name,
        "final_answer": final_ans,
        "development": dev_list
    })

with open('/home/alono/Downloads/CV_ALS/web_cv/blog/posts/consensus-through-debate/data/results.json', 'w') as f:
    json.dump(results_data, f, indent=2)

print(f"Dumped {len(results_data)} flows to results.json.")
