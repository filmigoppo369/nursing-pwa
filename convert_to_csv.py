import csv

# Define all categories matching your main program
CATEGORIES = {
    '1': {'id': 'pediatric', 'name': 'Pediatric Nursing'},
    '2': {'id': 'medsurg', 'name': 'Med-Surgical Nursing'},
    '3': {'id': 'mentalhealth', 'name': 'Mental Health Nursing'},
    '4': {'id': 'community', 'name': 'Community Health Nursing'},
    '5': {'id': 'obgyn', 'name': 'OB/GYN Nursing'},
    '6': {'id': 'anatomy', 'name': 'Anatomy & Physiology'},
    '7': {'id': 'psychology', 'name': 'Psychology'},
    '8': {'id': 'nutrition', 'name': 'Nutrition & Biochemistry'},
    '9': {'id': 'microbiology', 'name': 'Microbiology/Infection Control'},
}

def display_categories():
    """Display available categories for selection."""
    print("\n" + "="*60)
    print("📚 MONTASTIC - Question Category Selection")
    print("="*60)
    print("\nSelect the category for your questions:\n")
    
    for key, value in sorted(CATEGORIES.items()):
        print(f"  {key}. {value['name']}")
    
    print("\n" + "="*60)

def get_category_selection():
    """Get user's category selection."""
    while True:
        choice = input("\nEnter your choice (1-9): ").strip()
        
        if choice in CATEGORIES:
            return CATEGORIES[choice]
        else:
            print("❌ Invalid choice! Please enter a number between 1 and 9.")

def convert_to_csv():
    """Main conversion function with interactive category selection."""
    
    input_file = 'shuffled_questions.txt'
    
    # Display categories and get selection
    display_categories()
    selected_category = get_category_selection()
    
    print(f"\n✅ Selected: {selected_category['name']}")
    print(f"📁 Category ID: {selected_category['id']}")
    
    # Generate output filename based on category
    output_file = f"{selected_category['id']}_questions.csv"
    
    print(f"\n📄 Output file will be: {output_file}")
    print("\n⏳ Processing questions...")
    
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
        
        writer.writeheader()  # Writes the column names as the first row
        
        for q in questions:
            writer.writerow({
                'category': selected_category['id'],
                'categoryName': selected_category['name'],
                'stem': q.get('stem', ''),
                'option_a': q.get('option_a', ''),
                'option_b': q.get('option_b', ''),
                'option_c': q.get('option_c', ''),
                'option_d': q.get('option_d', ''),
                'correct_answer': q.get('correct_answer', ''),
                'rationale': q.get('rationale', '')
            })
    
    print("\n" + "="*60)
    print(f"✅ SUCCESS!")
    print(f"📊 Converted {len(questions)} questions")
    print(f"📁 Category: {selected_category['name']}")
    print(f"💾 Saved to: {output_file}")
    print("="*60 + "\n")

if __name__ == "__main__":
    try:
        convert_to_csv()
    except FileNotFoundError:
        print("\n❌ ERROR: 'shuffled_questions.txt' not found!")
        print("💡 Make sure you've run shuffle.py first.\n")
    except Exception as e:
        print(f"\n ERROR: {str(e)}\n")