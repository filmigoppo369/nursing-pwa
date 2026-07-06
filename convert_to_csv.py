import csv

input_file = 'shuffled_questions.txt'
output_file = 'medsurg_questions.csv'

# Read the shuffled text file
with open(input_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

questions = []
current_q = {}

# Parse the text file line by line
for line in lines:
    line = line.strip()
    if not line:
        continue
        
    if line.startswith('case scenario q'):
        if current_q:
            questions.append(current_q)
        # Extract question text (everything after "case scenario q1. ")
        parts = line.split('. ', 1)
        current_q = {'stem': parts[1] if len(parts) > 1 else ''}
    elif line.startswith('option a:'):
        current_q['option_a'] = line.replace('option a:', '').strip()
    elif line.startswith('option b:'):
        current_q['option_b'] = line.replace('option b:', '').strip()
    elif line.startswith('option c:'):
        current_q['option_c'] = line.replace('option c:', '').strip()
    elif line.startswith('option d:'):
        current_q['option_d'] = line.replace('option d:', '').strip()
    elif line.startswith('correct answer:'):
        # Extract the letter and make it uppercase (A, B, C, or D)
        ans = line.replace('correct answer: option', '').strip().upper()
        current_q['correct_answer'] = ans
    elif line.startswith('rationale:'):
        current_q['rationale'] = line.replace('rationale:', '').strip()

# Add the very last question
if current_q:
    questions.append(current_q)

# Write to a CSV file formatted perfectly for Supabase
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    # These headers MUST match your Supabase table columns exactly
    fieldnames = ['category', 'categoryName', 'stem', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'rationale']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader() # Writes the column names as the first row
    
    for q in questions:
        writer.writerow({
            'category': 'medsurg',
            'categoryName': 'Med-Surgical Nursing',
            'stem': q.get('stem', ''),
            'option_a': q.get('option_a', ''),
            'option_b': q.get('option_b', ''),
            'option_c': q.get('option_c', ''),
            'option_d': q.get('option_d', ''),
            'correct_answer': q.get('correct_answer', ''),
            'rationale': q.get('rationale', '')
        })

print(f"✅ Success! Converted {len(questions)} questions to '{output_file}'")