import re
import random

# Read the p1.txt file
with open('p1.txt', 'r', encoding='utf-8') as f:
    text = f.read()

print(f"📖 Read {len(text)} characters from p1.txt")

def process_questions(text):
    # Split by question markers like **1**, **2**, etc.
    parts = re.split(r'\*\*(\d+)\*\*\n', text)
    
    questions = []
    
    for i in range(1, len(parts), 2):
        q_num = int(parts[i])
        content = parts[i+1].strip()
        
        # Extract rationale
        rat_match = re.search(r'\*\*Rationale:\*\*\s*([A-D])\s*[—-]\s*(.*)', content, re.DOTALL)
        if not rat_match:
            rat_match = re.search(r'\*\*Rationale:\*\*\s*([A-D])\s*(.*)', content, re.DOTALL)
        
        if not rat_match:
            print(f"⚠️  Warning: Could not parse rationale for question {q_num}")
            continue
        
        correct_ans = rat_match.group(1)
        rationale = rat_match.group(2).strip()
        q_and_opts = content[:rat_match.start()].strip()
        
        # Extract options (A), B), C), D))
        opt_pattern = re.compile(r'^([A-D])\)\s*(.+)$', re.MULTILINE)
        opts = opt_pattern.findall(q_and_opts)
        
        if len(opts) != 4:
            print(f"⚠️  Warning: Question {q_num} doesn't have 4 options (found {len(opts)})")
            continue
        
        opt_dict = {opt[0]: opt[1].strip() for opt in opts}
        
        # Extract question text (everything before option A))
        q_text_match = re.search(r'^(.+?)\nA\)', q_and_opts, re.DOTALL)
        if not q_text_match:
            print(f"⚠️  Warning: Could not extract question text for {q_num}")
            continue
        
        q_text = q_text_match.group(1).strip()
        
        questions.append({
            'num': q_num,
            'text': q_text,
            'options': opt_dict,
            'correct': correct_ans,
            'rationale': rationale
        })
    
    print(f"✅ Successfully parsed {len(questions)} questions")
    
    # Shuffle the questions
    random.shuffle(questions)
    
    output = []
    for idx, q in enumerate(questions, 1):
        opts = list(q['options'].items())
        random.shuffle(opts)
        
        new_correct_letter = None
        new_opts = {}
        
        for new_letter, (old_letter, text) in zip(['A', 'B', 'C', 'D'], opts):
            new_opts[new_letter] = text
            if old_letter == q['correct']:
                new_correct_letter = new_letter
        
        output.append(f"**{idx}**")
        output.append(q['text'])
        output.append(f"A) {new_opts['A']}")
        output.append(f"B) {new_opts['B']}")
        output.append(f"C) {new_opts['C']}")
        output.append(f"D) {new_opts['D']}")
        output.append(f"**Rationale:** {new_correct_letter} — {q['rationale']}\n")
    
    return "\n".join(output)

result = process_questions(text)

with open('shuffled_questions.txt', 'w', encoding='utf-8') as f:
    f.write(result)

print(f"✅ Done! All questions shuffled and saved to shuffled_questions.txt")
print(f"📊 Output file size: {len(result)} characters")