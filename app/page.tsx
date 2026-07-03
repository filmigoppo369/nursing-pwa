"use client";

import { useState, useEffect } from "react";

const questionBank = [
  { id: 1, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "A 2-year-old child is admitted with dehydration. Which assessment finding is the PRIORITY?", options: [{ id: "A", text: "Dry mucous membranes", isCorrect: false }, { id: "B", text: "Decreased urine output", isCorrect: true }, { id: "C", text: "Sunken fontanelles", isCorrect: false }, { id: "D", text: "Poor skin turgor", isCorrect: false }], rationale: "Decreased urine output is the most reliable indicator of dehydration in children and indicates renal perfusion status." },
  { id: 2, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "The nurse is teaching parents about car seat safety. Which statement indicates understanding?", options: [{ id: "A", text: "My 3-year-old can sit in a booster seat", isCorrect: false }, { id: "B", text: "My 1-year-old should face forward", isCorrect: false }, { id: "C", text: "My infant should ride rear-facing until age 2", isCorrect: true }, { id: "D", text: "My child can use a seat belt at age 5", isCorrect: false }], rationale: "Children should remain in rear-facing car seats until at least age 2 or until they reach the maximum height/weight limit." },
  { id: 3, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "A child with cystic fibrosis should receive which dietary intervention?", options: [{ id: "A", text: "Low-calorie, low-fat diet", isCorrect: false }, { id: "B", text: "High-calorie, high-protein diet", isCorrect: true }, { id: "C", text: "Sodium-restricted diet", isCorrect: false }, { id: "D", text: "Clear liquid diet", isCorrect: false }], rationale: "Children with CF have increased caloric needs and malabsorption, requiring high-calorie, high-protein diets with pancreatic enzyme replacement." },
  { id: 4, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "Which developmental milestone is expected in a 6-month-old infant?", options: [{ id: "A", text: "Walking independently", isCorrect: false }, { id: "B", text: "Sitting without support", isCorrect: true }, { id: "C", text: "Speaking two-word phrases", isCorrect: false }, { id: "D", text: "Using pincer grasp", isCorrect: false }], rationale: "Sitting without support typically occurs around 6 months. Walking occurs around 12 months." },
  { id: 5, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "Which immunization is given at birth?", options: [{ id: "A", text: "MMR", isCorrect: false }, { id: "B", text: "Hepatitis B", isCorrect: true }, { id: "C", text: "Varicella", isCorrect: false }, { id: "D", text: "Polio", isCorrect: false }], rationale: "Hepatitis B vaccine is given within 24 hours of birth, followed by doses at 1-2 months and 6-18 months." },
  { id: 6, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "Which finding in a newborn requires immediate intervention?", options: [{ id: "A", text: "Heart rate of 140/min", isCorrect: false }, { id: "B", text: "Respiratory rate of 68/min", isCorrect: true }, { id: "C", text: "Temperature of 98.2°F", isCorrect: false }, { id: "D", text: "Blood glucose of 50 mg/dL", isCorrect: false }], rationale: "Normal newborn respiratory rate is 30-60/min. A rate of 68/min indicates tachypnea and possible respiratory distress." },
  { id: 7, category: "pediatric", categoryName: "Pediatric Nursing", type: "MCQ", stem: "Which is the appropriate site for IM injection in an infant?", options: [{ id: "A", text: "Deltoid", isCorrect: false }, { id: "B", text: "Ventrogluteal", isCorrect: false }, { id: "C", text: "Vastus lateralis", isCorrect: true }, { id: "D", text: "Dorsogluteal", isCorrect: false }], rationale: "Vastus lateralis (thigh) is the preferred site for IM injections in infants due to muscle development." },
  { id: 8, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client with COPD has a respiratory rate of 8/min. Which action should the nurse take FIRST?", options: [{ id: "A", text: "Administer oxygen at 6 L/min", isCorrect: false }, { id: "B", text: "Stimulate breathing by rubbing sternum", isCorrect: true }, { id: "C", text: "Document the findings", isCorrect: false }, { id: "D", text: "Place client in high Fowler's position", isCorrect: false }], rationale: "A respiratory rate of 8/min indicates respiratory depression. The nurse should first attempt to stimulate breathing before other interventions." },
  { id: 9, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "Which finding in a post-operative client requires IMMEDIATE intervention?", options: [{ id: "A", text: "Temperature of 99.5°F", isCorrect: false }, { id: "B", text: "Urine output of 20 mL/hr", isCorrect: true }, { id: "C", text: "Pain level of 6/10", isCorrect: false }, { id: "D", text: "Serous drainage on dressing", isCorrect: false }], rationale: "Urine output less than 30 mL/hr indicates inadequate renal perfusion and possible shock, requiring immediate intervention." },
  { id: 10, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client receiving heparin has an aPTT of 90 seconds. What should the nurse do?", options: [{ id: "A", text: "Continue the infusion as prescribed", isCorrect: false }, { id: "B", text: "Hold the heparin and notify provider", isCorrect: true }, { id: "C", text: "Increase the infusion rate", isCorrect: false }, { id: "D", text: "Administer vitamin K", isCorrect: false }], rationale: "Therapeutic aPTT is 1.5-2.5 times normal (45-70 seconds). An aPTT of 90 seconds indicates overdose and risk of bleeding." },
  { id: 11, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client with diabetes has a blood glucose of 52 mg/dL. What is the FIRST action?", options: [{ id: "A", text: "Administer glucagon IM", isCorrect: false }, { id: "B", text: "Give 15g fast-acting carbohydrate", isCorrect: true }, { id: "C", text: "Recheck blood glucose in 15 minutes", isCorrect: false }, { id: "D", text: "Call the healthcare provider", isCorrect: false }], rationale: "For conscious clients with hypoglycemia, give 15g fast-acting carbs (Rule of 15), then recheck in 15 minutes." },
  { id: 12, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client is receiving morphine via PCA pump. Which finding requires immediate intervention?", options: [{ id: "A", text: "Respiratory rate of 10/min", isCorrect: true }, { id: "B", text: "Pain level of 4/10", isCorrect: false }, { id: "C", text: "Blood pressure of 110/70", isCorrect: false }, { id: "D", text: "Heart rate of 72/min", isCorrect: false }], rationale: "Respiratory depression (RR <12/min) is a serious adverse effect of opioids and requires immediate intervention." },
  { id: 13, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client with heart failure should monitor which daily measurement?", options: [{ id: "A", text: "Blood pressure", isCorrect: false }, { id: "B", text: "Weight", isCorrect: true }, { id: "C", text: "Temperature", isCorrect: false }, { id: "D", text: "Pulse oximetry", isCorrect: false }], rationale: "Daily weight monitoring detects fluid retention. A gain of 2-3 lbs in a day or 5 lbs in a week indicates fluid overload." },
  { id: 14, category: "medsurg", categoryName: "Med-Surgical Nursing", type: "MCQ", stem: "A client with a chest tube has continuous bubbling in the water seal chamber. What does this indicate?", options: [{ id: "A", text: "Normal finding", isCorrect: false }, { id: "B", text: "Air leak", isCorrect: true }, { id: "C", text: "Tube is clogged", isCorrect: false }, { id: "D", text: "Lung has re-expanded", isCorrect: false }], rationale: "Continuous bubbling indicates an air leak. Intermittent bubbling with coughing is normal." },
  { id: 15, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "A client with depression says, 'I'm worthless.' What is the BEST response?", options: [{ id: "A", text: "That's not true, you have many good qualities", isCorrect: false }, { id: "B", text: "Tell me more about why you feel this way", isCorrect: true }, { id: "C", text: "You shouldn't think that way", isCorrect: false }, { id: "D", text: "Things will get better soon", isCorrect: false }], rationale: "Therapeutic communication involves exploring feelings and encouraging expression. Open-ended questions promote therapeutic dialogue." },
  { id: 16, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "Which intervention is PRIORITY for a client experiencing a panic attack?", options: [{ id: "A", text: "Teach deep breathing exercises", isCorrect: false }, { id: "B", text: "Stay with the client and provide reassurance", isCorrect: true }, { id: "C", text: "Administer PRN antianxiety medication", isCorrect: false }, { id: "D", text: "Encourage the client to talk about feelings", isCorrect: false }], rationale: "During a panic attack, the client cannot learn or process complex information. Staying with them provides safety and security." },
  { id: 17, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "A client with schizophrenia is experiencing auditory hallucinations. What is the BEST intervention?", options: [{ id: "A", text: "Tell the client the voices aren't real", isCorrect: false }, { id: "B", text: "Ask what the voices are saying", isCorrect: true }, { id: "C", text: "Ignore the client's statements", isCorrect: false }, { id: "D", text: "Administer PRN medication immediately", isCorrect: false }], rationale: "Assessing the content of hallucinations is important for safety. Don't argue about reality but acknowledge the experience." },
  { id: 18, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "Which medication requires monitoring of lithium levels?", options: [{ id: "A", text: "Sertraline", isCorrect: false }, { id: "B", text: "Lithium carbonate", isCorrect: true }, { id: "C", text: "Haloperidol", isCorrect: false }, { id: "D", text: "Lorazepam", isCorrect: false }], rationale: "Lithium has a narrow therapeutic range (0.6-1.2 mEq/L) and requires regular blood level monitoring." },
  { id: 19, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "Which is a positive symptom of schizophrenia?", options: [{ id: "A", text: "Flat affect", isCorrect: false }, { id: "B", text: "Hallucinations", isCorrect: true }, { id: "C", text: "Social withdrawal", isCorrect: false }, { id: "D", text: "Anhedonia", isCorrect: false }], rationale: "Positive symptoms add something abnormal (hallucinations, delusions). Negative symptoms involve loss of function." },
  { id: 20, category: "mentalhealth", categoryName: "Mental Health Nursing", type: "MCQ", stem: "Which is the priority intervention for a suicidal client?", options: [{ id: "A", text: "Medication administration", isCorrect: false }, { id: "B", text: "One-to-one observation", isCorrect: true }, { id: "C", text: "Group therapy", isCorrect: false }, { id: "D", text: "Family counseling", isCorrect: false }], rationale: "Safety is the priority. One-to-one observation ensures the client's immediate safety." },
  { id: 21, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "In community health nursing, which is the PRIMARY prevention strategy?", options: [{ id: "A", text: "Screening for hypertension", isCorrect: false }, { id: "B", text: "Immunization programs", isCorrect: true }, { id: "C", text: "Rehabilitation services", isCorrect: false }, { id: "D", text: "Diabetes education classes", isCorrect: false }], rationale: "Primary prevention prevents disease before it occurs. Immunizations prevent disease onset, while screening is secondary prevention." },
  { id: 22, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "Which population is at HIGHEST risk for tuberculosis?", options: [{ id: "A", text: "Adolescents", isCorrect: false }, { id: "B", text: "Homeless individuals", isCorrect: true }, { id: "C", text: "Middle-aged adults", isCorrect: false }, { id: "D", text: "Elementary school children", isCorrect: false }], rationale: "Homeless individuals are at high risk for TB due to overcrowded shelters, poor nutrition, and limited healthcare access." },
  { id: 23, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "Which is a secondary prevention strategy?", options: [{ id: "A", text: "Health education programs", isCorrect: false }, { id: "B", text: "Mammography screening", isCorrect: true }, { id: "C", text: "Immunization", isCorrect: false }, { id: "D", text: "Rehabilitation", isCorrect: false }], rationale: "Secondary prevention focuses on early detection and screening. Mammography detects breast cancer early." },
  { id: 24, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "What is the leading cause of death in adolescents?", options: [{ id: "A", text: "Cancer", isCorrect: false }, { id: "B", text: "Motor vehicle accidents", isCorrect: true }, { id: "C", text: "Suicide", isCorrect: false }, { id: "D", text: "Homicide", isCorrect: false }], rationale: "Motor vehicle accidents are the leading cause of death in adolescents, followed by suicide and homicide." },
  { id: 25, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "Which disease is transmitted through contaminated water?", options: [{ id: "A", text: "Tuberculosis", isCorrect: false }, { id: "B", text: "Cholera", isCorrect: true }, { id: "C", text: "Influenza", isCorrect: false }, { id: "D", text: "Hepatitis B", isCorrect: false }], rationale: "Cholera is a waterborne disease caused by Vibrio cholerae, transmitted through contaminated water." },
  { id: 26, category: "community", categoryName: "Community Health Nursing", type: "MCQ", stem: "Which is a modifiable risk factor for cardiovascular disease?", options: [{ id: "A", text: "Age", isCorrect: false }, { id: "B", text: "Genetics", isCorrect: false }, { id: "C", text: "Smoking", isCorrect: true }, { id: "D", text: "Gender", isCorrect: false }], rationale: "Smoking is modifiable. Age, genetics, and gender are non-modifiable risk factors." },
  { id: 27, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "A pregnant client at 32 weeks reports severe headache and blurred vision. What should the nurse assess FIRST?", options: [{ id: "A", text: "Fetal heart rate", isCorrect: false }, { id: "B", text: "Blood pressure", isCorrect: true }, { id: "C", text: "Urine protein", isCorrect: false }, { id: "D", text: "Contraction pattern", isCorrect: false }], rationale: "These symptoms suggest preeclampsia. Blood pressure assessment is the priority to confirm hypertension." },
  { id: 28, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "Which finding in a postpartum client requires IMMEDIATE intervention?", options: [{ id: "A", text: "Lochia rubra moderate amount", isCorrect: false }, { id: "B", text: "Saturating a peripad in 15 minutes", isCorrect: true }, { id: "C", text: "Afterpains during breastfeeding", isCorrect: false }, { id: "D", text: "Temperature of 100.2°F", isCorrect: false }], rationale: "Saturating a pad in 15 minutes indicates excessive bleeding and possible postpartum hemorrhage, requiring immediate intervention." },
  { id: 29, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "The nurse is teaching about folic acid supplementation. What is the recommended daily dose for women of childbearing age?", options: [{ id: "A", text: "100 mcg", isCorrect: false }, { id: "B", text: "400 mcg", isCorrect: true }, { id: "C", text: "1000 mcg", isCorrect: false }, { id: "D", text: "2000 mcg", isCorrect: false }], rationale: "400 mcg (0.4 mg) of folic acid daily is recommended for all women of childbearing age to prevent neural tube defects." },
  { id: 30, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "Which finding indicates the onset of labor?", options: [{ id: "A", text: "Lightening", isCorrect: false }, { id: "B", text: "Regular contractions with cervical change", isCorrect: true }, { id: "C", text: "Bloody show", isCorrect: false }, { id: "D", text: "Rupture of membranes", isCorrect: false }], rationale: "True labor is characterized by regular contractions that result in progressive cervical dilation and effacement." },
  { id: 31, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "Which position is recommended for a pregnant client in the third trimester?", options: [{ id: "A", text: "Supine position", isCorrect: false }, { id: "B", text: "Left side-lying position", isCorrect: true }, { id: "C", text: "Prone position", isCorrect: false }, { id: "D", text: "Trendelenburg position", isCorrect: false }], rationale: "Left side-lying prevents compression of the inferior vena cava and improves placental blood flow." },
  { id: 32, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "Which test is used to diagnose gestational diabetes?", options: [{ id: "A", text: "Fasting blood glucose", isCorrect: false }, { id: "B", text: "Glucose tolerance test", isCorrect: true }, { id: "C", text: "Hemoglobin A1C", isCorrect: false }, { id: "D", text: "Random blood glucose", isCorrect: false }], rationale: "The glucose tolerance test (GTT) is performed between 24-28 weeks to screen for gestational diabetes." },
  { id: 33, category: "obgyn", categoryName: "OB/GYN Nursing", type: "MCQ", stem: "Which hormone maintains pregnancy?", options: [{ id: "A", text: "Estrogen", isCorrect: false }, { id: "B", text: "Progesterone", isCorrect: true }, { id: "C", text: "hCG", isCorrect: false }, { id: "D", text: "Prolactin", isCorrect: false }], rationale: "Progesterone maintains the endometrial lining and prevents uterine contractions, maintaining pregnancy." },
  { id: 34, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which chamber of the heart receives oxygenated blood from the lungs?", options: [{ id: "A", text: "Right atrium", isCorrect: false }, { id: "B", text: "Right ventricle", isCorrect: false }, { id: "C", text: "Left atrium", isCorrect: true }, { id: "D", text: "Left ventricle", isCorrect: false }], rationale: "The left atrium receives oxygenated blood from the lungs via the pulmonary veins." },
  { id: 35, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which hormone is responsible for lowering blood glucose levels?", options: [{ id: "A", text: "Glucagon", isCorrect: false }, { id: "B", text: "Cortisol", isCorrect: false }, { id: "C", text: "Insulin", isCorrect: true }, { id: "D", text: "Epinephrine", isCorrect: false }], rationale: "Insulin, produced by pancreatic beta cells, facilitates glucose uptake by cells and lowers blood glucose levels." },
  { id: 36, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which organ is responsible for filtering blood and producing urine?", options: [{ id: "A", text: "Liver", isCorrect: false }, { id: "B", text: "Kidney", isCorrect: true }, { id: "C", text: "Spleen", isCorrect: false }, { id: "D", text: "Pancreas", isCorrect: false }], rationale: "The kidneys filter blood, remove waste products, and produce urine through nephrons." },
  { id: 37, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which part of the brain controls balance and coordination?", options: [{ id: "A", text: "Cerebrum", isCorrect: false }, { id: "B", text: "Cerebellum", isCorrect: true }, { id: "C", text: "Brainstem", isCorrect: false }, { id: "D", text: "Hypothalamus", isCorrect: false }], rationale: "The cerebellum is responsible for balance, coordination, and fine motor control." },
  { id: 38, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which blood type is the universal donor?", options: [{ id: "A", text: "Type A", isCorrect: false }, { id: "B", text: "Type B", isCorrect: false }, { id: "C", text: "Type AB", isCorrect: false }, { id: "D", text: "Type O negative", isCorrect: true }], rationale: "Type O negative blood has no A, B, or Rh antigens, making it safe for all recipients in emergencies." },
  { id: 39, category: "anatomy", categoryName: "Anatomy & Physiology", type: "MCQ", stem: "Which valve prevents backflow from the left ventricle to the left atrium?", options: [{ id: "A", text: "Tricuspid valve", isCorrect: false }, { id: "B", text: "Pulmonary valve", isCorrect: false }, { id: "C", text: "Mitral valve", isCorrect: true }, { id: "D", text: "Aortic valve", isCorrect: false }], rationale: "The mitral (bicuspid) valve is between the left atrium and left ventricle." },
  { id: 40, category: "psychology", categoryName: "Psychology", type: "MCQ", stem: "According to Maslow's hierarchy, which need is the HIGHEST priority?", options: [{ id: "A", text: "Self-esteem", isCorrect: false }, { id: "B", text: "Love and belonging", isCorrect: false }, { id: "C", text: "Physiological needs", isCorrect: true }, { id: "D", text: "Safety and security", isCorrect: false }], rationale: "Physiological needs (air, water, food, sleep) form the base of Maslow's hierarchy and must be met first." },
  { id: 41, category: "psychology", categoryName: "Psychology", type: "MCQ", stem: "A client is using denial as a defense mechanism. Which behavior would the nurse expect?", options: [{ id: "A", text: "Refusing to acknowledge a diagnosis", isCorrect: true }, { id: "B", text: "Attributing feelings to others", isCorrect: false }, { id: "C", text: "Returning to childlike behavior", isCorrect: false }, { id: "D", text: "Converting anxiety to physical symptoms", isCorrect: false }], rationale: "Denial involves refusing to acknowledge reality or facts that are too uncomfortable to accept." },
  { id: 42, category: "psychology", categoryName: "Psychology", type: "MCQ", stem: "Which defense mechanism involves channeling unacceptable impulses into socially acceptable activities?", options: [{ id: "A", text: "Repression", isCorrect: false }, { id: "B", text: "Sublimation", isCorrect: true }, { id: "C", text: "Projection", isCorrect: false }, { id: "D", text: "Rationalization", isCorrect: false }], rationale: "Sublimation redirects unacceptable impulses into acceptable outlets (e.g., aggressive impulses into sports)." },
  { id: 43, category: "psychology", categoryName: "Psychology", type: "MCQ", stem: "Which stage of grief involves bargaining?", options: [{ id: "A", text: "First stage", isCorrect: false }, { id: "B", text: "Second stage", isCorrect: false }, { id: "C", text: "Third stage", isCorrect: true }, { id: "D", text: "Fourth stage", isCorrect: false }], rationale: "Kübler-Ross stages: Denial, Anger, Bargaining, Depression, Acceptance (DABDA)." },
  { id: 44, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "Which vitamin is essential for blood clotting?", options: [{ id: "A", text: "Vitamin A", isCorrect: false }, { id: "B", text: "Vitamin C", isCorrect: false }, { id: "C", text: "Vitamin K", isCorrect: true }, { id: "D", text: "Vitamin D", isCorrect: false }], rationale: "Vitamin K is essential for the synthesis of clotting factors II, VII, IX, and X." },
  { id: 45, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "A client on warfarin should limit intake of which food?", options: [{ id: "A", text: "Citrus fruits", isCorrect: false }, { id: "B", text: "Green leafy vegetables", isCorrect: true }, { id: "C", text: "Dairy products", isCorrect: false }, { id: "D", text: "Whole grains", isCorrect: false }], rationale: "Green leafy vegetables are high in vitamin K, which antagonizes warfarin's anticoagulant effect." },
  { id: 46, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "Which mineral is essential for oxygen transport in the blood?", options: [{ id: "A", text: "Calcium", isCorrect: false }, { id: "B", text: "Iron", isCorrect: true }, { id: "C", text: "Potassium", isCorrect: false }, { id: "D", text: "Sodium", isCorrect: false }], rationale: "Iron is a component of hemoglobin, which carries oxygen in red blood cells." },
  { id: 47, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "Which vitamin deficiency causes scurvy?", options: [{ id: "A", text: "Vitamin A", isCorrect: false }, { id: "B", text: "Vitamin C", isCorrect: true }, { id: "C", text: "Vitamin D", isCorrect: false }, { id: "D", text: "Vitamin B12", isCorrect: false }], rationale: "Vitamin C deficiency causes scurvy, characterized by bleeding gums, poor wound healing, and petechiae." },
  { id: 48, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "Which nutrient provides the most concentrated source of energy?", options: [{ id: "A", text: "Carbohydrates", isCorrect: false }, { id: "B", text: "Proteins", isCorrect: false }, { id: "C", text: "Fats", isCorrect: true }, { id: "D", text: "Vitamins", isCorrect: false }], rationale: "Fats provide 9 kcal/g, while carbohydrates and proteins provide 4 kcal/g each." },
  { id: 49, category: "nutrition", categoryName: "Nutrition & Biochemistry", type: "MCQ", stem: "Which food is highest in potassium?", options: [{ id: "A", text: "Apple", isCorrect: false }, { id: "B", text: "Banana", isCorrect: true }, { id: "C", text: "Bread", isCorrect: false }, { id: "D", text: "Rice", isCorrect: false }], rationale: "Bananas are rich in potassium (approximately 422 mg per medium banana)." },
  { id: 50, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "Which is the MOST effective method to prevent the spread of infection?", options: [{ id: "A", text: "Wearing gloves", isCorrect: false }, { id: "B", text: "Hand hygiene", isCorrect: true }, { id: "C", text: "Using masks", isCorrect: false }, { id: "D", text: "Isolation precautions", isCorrect: false }], rationale: "Hand hygiene is the single most effective method to prevent the spread of healthcare-associated infections." },
  { id: 51, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "A client has Clostridium difficile. Which precaution should the nurse implement?", options: [{ id: "A", text: "Airborne precautions", isCorrect: false }, { id: "B", text: "Droplet precautions", isCorrect: false }, { id: "C", text: "Contact precautions with soap and water handwashing", isCorrect: true }, { id: "D", text: "Standard precautions only", isCorrect: false }], rationale: "C. diff requires contact precautions. Soap and water (not alcohol) must be used as alcohol doesn't kill spores." },
  { id: 52, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "Which organism causes tuberculosis?", options: [{ id: "A", text: "Streptococcus pneumoniae", isCorrect: false }, { id: "B", text: "Mycobacterium tuberculosis", isCorrect: true }, { id: "C", text: "Staphylococcus aureus", isCorrect: false }, { id: "D", text: "Escherichia coli", isCorrect: false }], rationale: "Mycobacterium tuberculosis is the bacterium that causes tuberculosis (TB)." },
  { id: 53, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "Which type of immunity is acquired through vaccination?", options: [{ id: "A", text: "Natural active immunity", isCorrect: false }, { id: "B", text: "Artificial active immunity", isCorrect: true }, { id: "C", text: "Natural passive immunity", isCorrect: false }, { id: "D", text: "Artificial passive immunity", isCorrect: false }], rationale: "Vaccination provides artificial active immunity by stimulating the body to produce antibodies without causing disease." },
  { id: 54, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "Which is the chain of infection?", options: [{ id: "A", text: "Pathogen, host, environment", isCorrect: false }, { id: "B", text: "Infectious agent, reservoir, portal of exit, transmission, portal of entry, susceptible host", isCorrect: true }, { id: "C", text: "Bacteria, virus, fungus", isCorrect: false }, { id: "D", text: "Direct, indirect, airborne", isCorrect: false }], rationale: "The chain of infection has six links that must all be present for infection to occur." },
  { id: 55, category: "microbiology", categoryName: "Microbiology/Infection Control", type: "MCQ", stem: "Which organism is responsible for most healthcare-associated infections?", options: [{ id: "A", text: "E. coli", isCorrect: false }, { id: "B", text: "Staphylococcus aureus (MRSA)", isCorrect: true }, { id: "C", text: "Streptococcus", isCorrect: false }, { id: "D", text: "Pseudomonas", isCorrect: false }], rationale: "MRSA is one of the most common causes of healthcare-associated infections." },
];

const subjects = [
  { id: "pediatric", name: "Pediatric Nursing", icon: "👶" },
  { id: "medsurg", name: "Med-Surgical Nursing", icon: "🏥" },
  { id: "mentalhealth", name: "Mental Health Nursing", icon: "🧠" },
  { id: "community", name: "Community Health Nursing", icon: "🏘️" },
  { id: "obgyn", name: "OB/GYN Nursing", icon: "🤰" },
  { id: "anatomy", name: "Anatomy & Physiology", icon: "🫀" },
  { id: "psychology", name: "Psychology", icon: "💭" },
  { id: "nutrition", name: "Nutrition & Biochemistry", icon: "🥗" },
  { id: "microbiology", name: "Microbiology/Infection Control", icon: "🦠" },
];

export default function NursingApp() {
  const [currentView, setCurrentView] = useState<"home" | "subject" | "quiz" | "mock" | "results">("home");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showRationale, setShowRationale] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attemptedQuestions, setAttemptedQuestions] = useState<Set<number>>(new Set());
  const [mockTestQuestions, setMockTestQuestions] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [mockTestStarted, setMockTestStarted] = useState(false);
  const [mockTestSubmitted, setMockTestSubmitted] = useState(false);

  // Helper to get answers from localStorage
  const getSavedAnswers = (): Record<number, string[]> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mockTestAnswers');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { return {}; }
      }
    }
    return {};
  };

  // Helper to save answer to localStorage
  const saveAnswerToStorage = (index: number, answers: string[]) => {
    if (typeof window !== 'undefined') {
      const allAnswers = getSavedAnswers();
      allAnswers[index] = answers;
      localStorage.setItem('mockTestAnswers', JSON.stringify(allAnswers));
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mockTestStarted && !mockTestSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && mockTestStarted && !mockTestSubmitted) {
      handleSubmitMockTest();
    }
    return () => clearInterval(timer);
  }, [mockTestStarted, mockTestSubmitted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startSubjectQuiz = (categoryId: string) => {
    const categoryQuestions = questionBank.filter((q) => q.category === categoryId);
    setSelectedCategory(categoryId);
    setCurrentQuestions(categoryQuestions);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowRationale(false);
    setIsCorrect(null);
    setAttemptedQuestions(new Set());
    setCurrentView("quiz");
  };

  const startMockTest = () => {
    const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 50);
    setMockTestQuestions(selected);
    setCurrentQuestions(selected);
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setShowRationale(false);
    setIsCorrect(null);
    setAttemptedQuestions(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockTestAnswers');
    }
    setTimeRemaining(1800);
    setMockTestStarted(true);
    setMockTestSubmitted(false);
    setCurrentView("mock");
  };

  const handleSelect = (optionId: string) => {
    const isSATA = currentQuestions[currentIndex].type === "SATA";
    let newAnswers: string[];
    if (isSATA) {
      newAnswers = selectedAnswers.includes(optionId)
        ? selectedAnswers.filter((id) => id !== optionId)
        : [...selectedAnswers, optionId];
    } else {
      newAnswers = [optionId];
    }
    setSelectedAnswers(newAnswers);
    if (currentView === "mock") {
      saveAnswerToStorage(currentIndex, newAnswers);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers.length === 0) return;
    const currentQuestion = currentQuestions[currentIndex];
    const correctIds = currentQuestion.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
    const isAnswerCorrect = selectedAnswers.length === correctIds.length && selectedAnswers.every((id) => correctIds.includes(id));
    setAttemptedQuestions((prev) => new Set([...prev, currentIndex]));
    setIsCorrect(isAnswerCorrect);
    setShowRationale(true);
  };

  const handleNavigate = (index: number) => {
    if (selectedAnswers.length > 0 && currentView === "mock") {
      saveAnswerToStorage(currentIndex, selectedAnswers);
    }
    setCurrentIndex(index);
    if (currentView === "mock") {
      const allAnswers = getSavedAnswers();
      setSelectedAnswers(allAnswers[index] || []);
    }
    if (attemptedQuestions.has(index) && currentView === "quiz") {
      setShowRationale(true);
      const question = currentQuestions[index];
      const correctIds = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
      const wasCorrect = selectedAnswers.length === correctIds.length && selectedAnswers.every((id) => correctIds.includes(id));
      setIsCorrect(wasCorrect);
    } else {
      setShowRationale(false);
      setIsCorrect(null);
    }
  };

  const handleSubmitMockTest = () => {
    if (selectedAnswers.length > 0) {
      saveAnswerToStorage(currentIndex, selectedAnswers);
    }
    setTimeout(() => {
      setMockTestSubmitted(true);
      setCurrentView("results");
    }, 200);
  };

  const calculateResults = () => {
    const answersToUse = getSavedAnswers();
    let correctCount = 0;
    const categoryResults: Record<string, { correct: number; total: number }> = {};

    const results = currentQuestions.map((question, idx) => {
      const userAnswer = answersToUse[idx] || [];
      const correctIds = question.options.filter((opt: any) => opt.isCorrect).map((opt: any) => opt.id);
      const isAnswerCorrect = userAnswer.length === correctIds.length && userAnswer.every((id: string) => correctIds.includes(id));
      if (isAnswerCorrect) correctCount++;
      if (!categoryResults[question.category]) categoryResults[question.category] = { correct: 0, total: 0 };
      categoryResults[question.category].total++;
      if (isAnswerCorrect) categoryResults[question.category].correct++;
      return {
        questionNumber: idx + 1,
        question: question.stem,
        category: question.categoryName,
        userAnswer: userAnswer,
        correctAnswer: correctIds,
        isCorrect: isAnswerCorrect,
        rationale: question.rationale,
        options: question.options,
      };
    });

    const percentage = currentQuestions.length > 0 ? Math.round((correctCount / currentQuestions.length) * 100) : 0;
    const weakAreas = Object.entries(categoryResults)
      .filter(([_, data]) => data.total > 0 && data.correct / data.