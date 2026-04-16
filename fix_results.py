import json
import re

def parse_flows(text):
    flows = []
    # Regular expressions for tags
    flow_start_re = re.compile(r'<flow\s+id="([^"]+)">')
    task_start_re = re.compile(r'<task\s+agent="([^"]+)"\s+task="([^"]+)"(?:\s+dependencies="([^"]*)")?>')
    flow_end_re = re.compile(r'</flow>')
    task_end_re = re.compile(r'</task>')
    
    current_flow = None
    current_task = None
    lines = text.splitlines()
    
    for line in lines:
        flow_start_match = flow_start_re.search(line)
        if flow_start_match:
            current_flow = {
                'flow_id': flow_start_match.group(1),
                'tasks': []
            }
            continue

        if current_flow is not None:
            flow_end_match = flow_end_re.search(line)
            if flow_end_match:
                flows.append(current_flow)
                current_flow = None
                continue

            task_start_match = task_start_re.search(line)
            if task_start_match:
                agent = task_start_match.group(1)
                task_desc = task_start_match.group(2)
                deps_str = task_start_match.group(3)
                deps = []
                if deps_str:
                    deps = [int(x.strip()) for x in deps_str.split(',') if x.strip() != ""]
                
                current_task = {
                    'agent': agent,
                    'task': task_desc,
                    'dependencies': deps,
                    'final_answer': ''
                }
                continue

            if current_task is not None:
                task_end_match = task_end_re.search(line)
                if task_end_match:
                    current_flow['tasks'].append(current_task)
                    current_task = None
                    continue
                else:
                    current_task['final_answer'] += line + "\n"
    
    return flows

with open('/home/alono/Downloads/CV_ALS/web_cv/AISafety/posts/Consensus Through Debate/media/results.md', 'r') as f:
    text = f.read()

flows = parse_flows(text)

results_data = []
tab_names = ["Experiment 1", "Experiment 2", "Experiment 3", "Experiment 4"]

for i, flow in enumerate(flows):
    name = tab_names[i] if i < len(tab_names) else f"Flow {i+1}"
    tasks = flow.get('tasks', [])
    if not tasks:
        continue
    
    final_ans = tasks[-1]['final_answer']
    dev_tasks = tasks[:-1]
    
    dev_list = []
    for t in dev_tasks:
        dev_list.append({
            'title': f"{t['agent']} - {t['task']}",
            'content': t['final_answer']
        })
        
    results_data.append({
        'name': name,
        'final_answer': final_ans,
        'development': dev_list
    })

with open('/home/alono/Downloads/CV_ALS/web_cv/blog/posts/consensus-through-debate/data/results.json', 'w') as f:
    json.dump(results_data, f, indent=2)

print("results.json updated successfully!")
