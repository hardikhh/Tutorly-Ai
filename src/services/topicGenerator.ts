export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Low' | 'Medium' | 'Hard';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export function generateTopicQuiz(
  topic: string,
  questionCount: number = 15,
  tiered: boolean = true
): QuizQuestion[] {
  const t = topic.toLowerCase();
  let pool: QuizQuestion[] = [];

  // ==========================================
  // 1. CODING, C PROGRAMMING & LOOPS
  // ==========================================
  if (
    t.includes('c') ||
    t.includes('loop') ||
    t.includes('code') ||
    t.includes('program') ||
    t.includes('python') ||
    t.includes('java') ||
    t.includes('function')
  ) {
    pool = [
      // 5 Low Level (Foundations)
      {
        id: 'c_low_1',
        difficulty: 'Low',
        prompt: 'In C programming, which header file is required to use printf() and scanf()?',
        options: ['#include <stdlib.h>', '#include <stdio.h>', '#include <math.h>', '#include <conio.h>'],
        correctIndex: 1,
        explanation: '<stdio.h> stands for Standard Input Output and declares functions like printf() and scanf().'
      },
      {
        id: 'c_low_2',
        difficulty: 'Low',
        prompt: 'To print numbers from 1 to 5 using a for loop in C, which loop header is correct?',
        options: [
          'for (int i = 1; i <= 5; i++)',
          'for (int i = 0; i < 5; i--)',
          'for (i = 1 to 5)',
          'loop (1 <= 5)'
        ],
        correctIndex: 0,
        explanation: 'for (int i = 1; i <= 5; i++) initializes at 1, checks if i <= 5, and increments i by 1 each cycle.'
      },
      {
        id: 'c_low_3',
        difficulty: 'Low',
        prompt: 'Which loop in C is guaranteed to execute its block at least once, even if the condition is false initially?',
        options: ['for loop', 'while loop', 'do-while loop', 'nested loop'],
        correctIndex: 2,
        explanation: 'The do-while loop evaluates its condition at the bottom, guaranteeing at least one execution.'
      },
      {
        id: 'c_low_4',
        difficulty: 'Low',
        prompt: 'What format specifier must be used in printf() to print an integer in C?',
        options: ['%f', '%s', '%d', '%c'],
        correctIndex: 2,
        explanation: '%d (or %i) represents a signed decimal integer in C format strings.'
      },
      {
        id: 'c_low_5',
        difficulty: 'Low',
        prompt: 'What does the statement "return 0;" at the end of main() signify?',
        options: [
          'The computer must restart',
          'The program completed successfully without errors',
          'Memory has been completely cleared',
          'The loop should restart from the beginning'
        ],
        correctIndex: 1,
        explanation: 'A return code of 0 informs the operating system that the process terminated successfully.'
      },

      // 5 Medium Level (Application & Code Tracing)
      {
        id: 'c_med_1',
        difficulty: 'Medium',
        prompt: 'How many times will this loop execute: for (int i = 0; i < 5; i += 2) ?',
        options: ['2 times', '3 times (i = 0, 2, 4)', '5 times', 'Infinite loop'],
        correctIndex: 1,
        explanation: 'The loop executes for i = 0, 2, and 4 (3 total times). When i becomes 6, 6 < 5 is false.'
      },
      {
        id: 'c_med_2',
        difficulty: 'Medium',
        prompt: 'What happens if you write a for loop with empty condition: for (int i = 0; ; i++) in C?',
        options: [
          'Compile-time syntax error',
          'The loop never runs',
          'It creates an infinite loop unless terminated with break',
          'The loop runs only once'
        ],
        correctIndex: 2,
        explanation: 'In C, an omitted condition in a for loop defaults to true, causing an infinite loop.'
      },
      {
        id: 'c_med_3',
        difficulty: 'Medium',
        prompt: 'What is the key difference between "break" and "continue" statements inside a loop?',
        options: [
          '"break" skips the current iteration; "continue" terminates the whole loop',
          '"break" terminates the loop immediately; "continue" skips to the next iteration',
          'Both statements perform the exact same action',
          '"continue" restarts the entire program from main()'
        ],
        correctIndex: 1,
        explanation: '"break" exits the loop immediately, whereas "continue" skips remaining statements in the current iteration and jumps to the update step.'
      },
      {
        id: 'c_med_4',
        difficulty: 'Medium',
        prompt: 'What will be printed by: int x = 5; printf("%d", x++); ?',
        options: ['6', '5', '4', 'Undefined behavior'],
        correctIndex: 1,
        explanation: 'Post-increment x++ returns the current value (5) first before incrementing x to 6.'
      },
      {
        id: 'c_med_5',
        difficulty: 'Medium',
        prompt: 'Which while loop is functionally equivalent to: for (int i = 1; i <= 5; i++) { printf("%d", i); } ?',
        options: [
          'int i = 1; while (i <= 5) { printf("%d", i); i++; }',
          'while (int i = 1; i <= 5) { printf("%d", i); }',
          'int i = 5; while (i >= 1) { printf("%d", i); }',
          'int i = 1; while (i < 5) { i++; printf("%d", i); }'
        ],
        correctIndex: 0,
        explanation: 'Initializing before while, checking i <= 5, printing i, and incrementing i++ matches the for loop behavior.'
      },

      // 5 Hard Level (Complex Tracing, Memory & Edge Cases)
      {
        id: 'c_hard_1',
        difficulty: 'Hard',
        prompt: 'In nested loops: for (int i = 1; i <= 5; i++) { for (int j = 1; j <= 5; j++) { count++; } }, how many times does the inner body run?',
        options: ['10 times', '25 times', '5 times', '15 times'],
        correctIndex: 1,
        explanation: 'For each of the 5 outer loop iterations, the inner loop runs 5 times: 5 × 5 = 25 iterations total.'
      },
      {
        id: 'c_hard_2',
        difficulty: 'Hard',
        prompt: 'When iterating an array int arr[5], what happens if your loop condition is (i <= 5) instead of (i < 5)?',
        options: [
          'It compiles and works without issues',
          'Off-by-one error accessing arr[5], which is out of bounds and causes undefined behavior',
          'The compiler automatically resizes the array to 6 elements',
          'The loop exits automatically at index 4'
        ],
        correctIndex: 1,
        explanation: 'In C, an array of size 5 has valid indices 0 to 4. Accessing arr[5] reads past allocated memory.'
      },
      {
        id: 'c_hard_3',
        difficulty: 'Hard',
        prompt: 'If ptr points to the first element of an int array (int *ptr = arr;), what does *(ptr + i) evaluate to inside a loop?',
        options: [
          'The memory address of the i-th element',
          'The value of the element at index i (equivalent to arr[i])',
          'The total size of the array',
          'A null pointer'
        ],
        correctIndex: 1,
        explanation: 'Pointer arithmetic *(ptr + i) accesses the value at index i, which is identical to arr[i].'
      },
      {
        id: 'c_hard_4',
        difficulty: 'Hard',
        prompt: 'What is the time complexity of printing N numbers using a single loop in C?',
        options: ['O(1) constant time', 'O(log N) logarithmic', 'O(N) linear time', 'O(N^2) quadratic'],
        correctIndex: 2,
        explanation: 'A loop executing N iterations with constant work per iteration has O(N) linear time complexity.'
      },
      {
        id: 'c_hard_5',
        difficulty: 'Hard',
        prompt: 'What potential pitfall occurs in: unsigned int i; for (i = 5; i >= 0; i--) { printf("%u ", i); } ?',
        options: [
          'It executes normally and prints 5 4 3 2 1 0',
          'Infinite loop because an unsigned integer is always >= 0 (it wraps around to UINT_MAX)',
          'Compiler error on line 1',
          'Program crashes at i = 5'
        ],
        correctIndex: 1,
        explanation: 'Unsigned integers cannot be negative. When i is 0 and decremented (i--), it underflows to 4294967295, so i >= 0 is always true!'
      }
    ];
  }

  // ==========================================
  // 2. SCIENCE, BIOLOGY & PHOTOSYNTHESIS
  // ==========================================
  else if (
    t.includes('photosynthesis') ||
    t.includes('bio') ||
    t.includes('cell') ||
    t.includes('plant') ||
    t.includes('mitochondria') ||
    t.includes('respiration')
  ) {
    pool = [
      // 5 Low Level
      {
        id: 'bio_low_1',
        difficulty: 'Low',
        prompt: 'Which green pigment in plant chloroplasts absorbs light energy for photosynthesis?',
        options: ['Carotene', 'Chlorophyll', 'Hemoglobin', 'Melanin'],
        correctIndex: 1,
        explanation: 'Chlorophyll absorbs blue and red wavelengths of sunlight, reflecting green light.'
      },
      {
        id: 'bio_low_2',
        difficulty: 'Low',
        prompt: 'What gas do plants take in from the atmosphere for photosynthesis?',
        options: ['Oxygen', 'Carbon Dioxide (CO2)', 'Nitrogen', 'Methane'],
        correctIndex: 1,
        explanation: 'Plants absorb CO2 through microscopic pores called stomata.'
      },
      {
        id: 'bio_low_3',
        difficulty: 'Low',
        prompt: 'What is the primary usable sugar molecule produced by photosynthesis?',
        options: ['Lactose', 'Glucose (C6H12O6)', 'Sucrose', 'Starch'],
        correctIndex: 1,
        explanation: 'Glucose is the simple sugar synthesized as an energy storage molecule.'
      },
      {
        id: 'bio_low_4',
        difficulty: 'Low',
        prompt: 'Which organelle is universally known as the powerhouse of eukaryotic cells?',
        options: ['Ribosome', 'Mitochondria', 'Golgi apparatus', 'Vacuole'],
        correctIndex: 1,
        explanation: 'Mitochondria synthesize ATP through cellular respiration.'
      },
      {
        id: 'bio_low_5',
        difficulty: 'Low',
        prompt: 'What gas is released into the atmosphere as a byproduct of water splitting in photosynthesis?',
        options: ['Carbon Monoxide', 'Oxygen (O2)', 'Hydrogen gas', 'Helium'],
        correctIndex: 1,
        explanation: 'Photolysis of H2O releases oxygen gas (O2) into the atmosphere.'
      },

      // 5 Medium Level
      {
        id: 'bio_med_1',
        difficulty: 'Medium',
        prompt: 'Where specifically do the light-dependent reactions take place inside chloroplasts?',
        options: ['Stroma', 'Thylakoid membranes', 'Outer membrane', 'Mitochondrial matrix'],
        correctIndex: 1,
        explanation: 'Thylakoid membrane protein complexes absorb photons and initiate electron transport.'
      },
      {
        id: 'bio_med_2',
        difficulty: 'Medium',
        prompt: 'Where does the Calvin Cycle (light-independent reactions) occur in chloroplasts?',
        options: ['Stroma fluid', 'Thylakoid lumen', 'Ribosome', 'Nucleolus'],
        correctIndex: 0,
        explanation: 'The stroma is the fluid-filled space surrounding thylakoids where enzymes synthesize sugar.'
      },
      {
        id: 'bio_med_3',
        difficulty: 'Medium',
        prompt: 'What is the chemical balanced equation for aerobic photosynthesis?',
        options: [
          '6CO2 + 6H2O + light -> C6H12O6 + 6O2',
          'C6H12O6 + 6O2 -> 6CO2 + 6H2O',
          'CO2 + H2O -> C2H4 + O2',
          '6CO2 + 6O2 -> C6H12O6 + 6H2O'
        ],
        correctIndex: 0,
        explanation: 'Six molecules of CO2 and six molecules of H2O yield one glucose and six oxygen molecules.'
      },
      {
        id: 'bio_med_4',
        difficulty: 'Medium',
        prompt: 'What energy carriers produced during light reactions are required to drive the Calvin cycle?',
        options: ['ATP and NADPH', 'DNA and RNA', 'Glucose and Oxygen', 'ADP and NADP+'],
        correctIndex: 0,
        explanation: 'ATP provides energy and NADPH provides high-energy electrons to fix CO2 into sugar.'
      },
      {
        id: 'bio_med_5',
        difficulty: 'Medium',
        prompt: 'What is the role of stomata on plant leaves?',
        options: [
          'Absorb water from soil',
          'Regulate gas exchange (CO2 intake and O2/water vapor release)',
          'Produce pollen',
          'Store carbohydrates'
        ],
        correctIndex: 1,
        explanation: 'Stomata surrounded by guard cells open and close to balance gas exchange with transpiration.'
      },

      // 5 Hard Level
      {
        id: 'bio_hard_1',
        difficulty: 'Hard',
        prompt: 'Which key enzyme catalyzes the first major step of carbon fixation in the Calvin cycle?',
        options: ['ATP Synthase', 'RuBisCO', 'DNA Polymerase', 'Amylase'],
        correctIndex: 1,
        explanation: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase) attaches CO2 to RuBP.'
      },
      {
        id: 'bio_hard_2',
        difficulty: 'Hard',
        prompt: 'During the light reactions, what establishes the proton gradient that drives ATP synthase?',
        options: [
          'Pumping protons (H+) into the thylakoid lumen from water splitting and electron transport',
          'Direct passive diffusion of glucose',
          'Breakdown of nuclear DNA',
          'Transport of sodium ions across the cell wall'
        ],
        correctIndex: 0,
        explanation: 'Protons accumulate in the thylakoid lumen, creating an electrochemical gradient used by ATP synthase.'
      },
      {
        id: 'bio_hard_3',
        difficulty: 'Hard',
        prompt: 'What evolutionary adaptation allows C4 and CAM plants to thrive in hot, arid conditions?',
        options: [
          'They don\'t require sunlight at all',
          'Spatial or temporal separation of CO2 capture to minimize photorespiration and water loss',
          'They only produce oxygen without glucose',
          'They completely lack stomata'
        ],
        correctIndex: 1,
        explanation: 'C4 isolates carbon fixation spatially in bundle sheath cells; CAM fixes carbon at night to prevent daytime water loss.'
      },
      {
        id: 'bio_hard_4',
        difficulty: 'Hard',
        prompt: 'In cellular respiration, what is the net ATP yield per glucose molecule under ideal aerobic conditions?',
        options: ['2 ATP', '4 ATP', '30 to 32 ATP', '100 ATP'],
        correctIndex: 2,
        explanation: 'Aerobic cellular respiration typically produces a net theoretical yield of 30-32 (or 36-38) ATP molecules.'
      },
      {
        id: 'bio_hard_5',
        difficulty: 'Hard',
        prompt: 'What happens during photorespiration when RuBisCO binds oxygen (O2) instead of carbon dioxide (CO2)?',
        options: [
          'It doubles the efficiency of glucose synthesis',
          'It consumes ATP and organic carbon without producing sugars, decreasing photosynthetic efficiency',
          'It produces excess ATP',
          'It turns chloroplasts blue'
        ],
        correctIndex: 1,
        explanation: 'Photorespiration is a wasteful side reaction where oxygen is added to RuBP, wasting energy.'
      }
    ];
  }

  // ==========================================
  // 3. MATHEMATICS, ALGEBRA & EQUATIONS
  // ==========================================
  else if (
    t.includes('math') ||
    t.includes('algebra') ||
    t.includes('equation') ||
    t.includes('fraction') ||
    t.includes('quadratic') ||
    t.includes('calculus')
  ) {
    pool = [
      // 5 Low Level
      {
        id: 'math_low_1',
        difficulty: 'Low',
        prompt: 'To solve 2x + 5 = 15, what is the first step using inverse operations?',
        options: ['Divide both sides by 2', 'Subtract 5 from both sides', 'Add 15 to both sides', 'Multiply by 2'],
        correctIndex: 1,
        explanation: 'Subtracting 5 from both sides isolates the variable term: 2x = 10, then dividing by 2 gives x = 5.'
      },
      {
        id: 'math_low_2',
        difficulty: 'Low',
        prompt: 'What is the correct order of arithmetic operations (PEMDAS)?',
        options: [
          'Parentheses, Exponents, Multiplication & Division, Addition & Subtraction',
          'Addition, Subtraction, Multiplication, Division',
          'Exponents, Parentheses, Subtraction, Addition',
          'Multiplication first always'
        ],
        correctIndex: 0,
        explanation: 'PEMDAS: Parentheses, Exponents, Multiplication/Division (left to right), Addition/Subtraction (left to right).'
      },
      {
        id: 'math_low_3',
        difficulty: 'Low',
        prompt: 'What rule is used when dividing two fractions: (a/b) ÷ (c/d)?',
        options: [
          'Multiply numerators and add denominators',
          'Keep, Change, Flip: multiply by reciprocal (a/b) × (d/c)',
          'Cross-multiply and divide by zero',
          'Add both fractions together'
        ],
        correctIndex: 1,
        explanation: 'Fraction division is performed by multiplying the first fraction by the reciprocal of the second.'
      },
      {
        id: 'math_low_4',
        difficulty: 'Low',
        prompt: 'What is the slope of the linear equation y = 3x - 7?',
        options: ['-7', '3', '7', '-3'],
        correctIndex: 1,
        explanation: 'In slope-intercept form y = mx + b, m is the slope, which equals 3.'
      },
      {
        id: 'math_low_5',
        difficulty: 'Low',
        prompt: 'What is the value of 5! (5 factorial)?',
        options: ['25', '60', '120', '15'],
        correctIndex: 2,
        explanation: '5! = 5 × 4 × 3 × 2 × 1 = 120.'
      },

      // 5 Medium Level
      {
        id: 'math_med_1',
        difficulty: 'Medium',
        prompt: 'Solve for x: 3(x - 4) = 18.',
        options: ['x = 6', 'x = 10', 'x = 2', 'x = 14'],
        correctIndex: 1,
        explanation: 'Divide both sides by 3: x - 4 = 6. Add 4: x = 10. Check: 3(10 - 4) = 3(6) = 18.'
      },
      {
        id: 'math_med_2',
        difficulty: 'Medium',
        prompt: 'What is the quadratic formula to solve ax² + bx + c = 0?',
        options: [
          'x = (-b ± √(b² - 4ac)) / (2a)',
          'x = (b ± √(b² + 4ac)) / (2a)',
          'x = -b / 2a',
          'x = √(b² - 4ac) / a'
        ],
        correctIndex: 0,
        explanation: 'The quadratic formula is x = (-b ± √(b² - 4ac)) / (2a).'
      },
      {
        id: 'math_med_3',
        difficulty: 'Medium',
        prompt: 'In ax² + bx + c = 0, what does a discriminant (b² - 4ac) greater than 0 indicate?',
        options: [
          'Two distinct real roots',
          'One repeated real root',
          'Two complex/imaginary roots',
          'No solutions exist'
        ],
        correctIndex: 0,
        explanation: 'If b² - 4ac > 0, the square root yields two distinct real numbers, producing two distinct real roots.'
      },
      {
        id: 'math_med_4',
        difficulty: 'Medium',
        prompt: 'Evaluate: (2/3) ÷ (4/5).',
        options: ['8/15', '5/6', '6/5', '10/7'],
        correctIndex: 1,
        explanation: '(2/3) × (5/4) = 10/12 = 5/6.'
      },
      {
        id: 'math_med_5',
        difficulty: 'Medium',
        prompt: 'What are the roots of x² - 9 = 0?',
        options: ['x = 3 only', 'x = -3 only', 'x = 3 and x = -3', 'x = 9 and x = -9'],
        correctIndex: 2,
        explanation: 'Difference of squares: (x - 3)(x + 3) = 0, so x = 3 or x = -3.'
      },

      // 5 Hard Level
      {
        id: 'math_hard_1',
        difficulty: 'Hard',
        prompt: 'Solve the system: { 2x + y = 7, x - y = 2 }.',
        options: ['x = 3, y = 1', 'x = 2, y = 3', 'x = 4, y = -1', 'x = 5, y = -3'],
        correctIndex: 0,
        explanation: 'Adding both equations: 3x = 9 => x = 3. Substituting into second: 3 - y = 2 => y = 1.'
      },
      {
        id: 'math_hard_2',
        difficulty: 'Hard',
        prompt: 'What is the derivative with respect to x of f(x) = 4x³ - 5x² + 7x - 9?',
        options: ['12x² - 10x + 7', '12x³ - 10x + 7', '4x² - 5x + 7', 'x⁴ - x³ + 7'],
        correctIndex: 0,
        explanation: 'Using power rule d/dx(x^n) = n*x^(n-1): 4(3x²) - 5(2x) + 7 = 12x² - 10x + 7.'
      },
      {
        id: 'math_hard_3',
        difficulty: 'Hard',
        prompt: 'What is the sum of an infinite geometric series with first term a = 6 and common ratio r = 1/3?',
        options: ['9', '18', '12', '6'],
        correctIndex: 0,
        explanation: 'Formula S = a / (1 - r) = 6 / (1 - 1/3) = 6 / (2/3) = 6 × (3/2) = 9.'
      },
      {
        id: 'math_hard_4',
        difficulty: 'Hard',
        prompt: 'Solve for x in the logarithmic equation: log₂(x) + log₂(x - 2) = 3.',
        options: ['x = 4', 'x = -2', 'x = 4 and x = -2', 'x = 8'],
        correctIndex: 0,
        explanation: 'log₂(x(x - 2)) = 3 => x² - 2x = 2³ = 8 => x² - 2x - 8 = 0 => (x - 4)(x + 2) = 0. Since log cannot accept negative arguments, x = 4 is the only valid solution.'
      },
      {
        id: 'math_hard_5',
        difficulty: 'Hard',
        prompt: 'What is the period of the trigonometric function f(x) = 3sin(2x)?',
        options: ['2π', 'π', 'π/2', '4π'],
        correctIndex: 1,
        explanation: 'For sin(Bx), the period is 2π / B. Here B = 2, so Period = 2π / 2 = π.'
      }
    ];
  }

  // ==========================================
  // 4. UNIVERSAL ACADEMIC & GENERAL TOPICS
  // ==========================================
  else {
    pool = [
      // 5 Low Level
      {
        id: 'gen_low_1',
        difficulty: 'Low',
        prompt: `In the foundational study of ${topic}, what is the first priority when approaching a problem?`,
        options: [
          'Identify the given facts, variables, and what is being asked',
          'Guess the most common answer option',
          'Skip reading the problem statement',
          'Change the units arbitrarily'
        ],
        correctIndex: 0,
        explanation: 'Clearly identifying given information and requirements prevents foundational errors.'
      },
      {
        id: 'gen_low_2',
        difficulty: 'Low',
        prompt: `Which approach ensures your definitions in ${topic} remain accurate?`,
        options: [
          'Rely solely on intuitive guesses',
          'Verify foundational rules and standardized terminology',
          'Ignore boundary conditions',
          'Never cross-reference textbook examples'
        ],
        correctIndex: 1,
        explanation: 'Standard terminology and foundational axioms provide the grounding for all correct work.'
      },
      {
        id: 'gen_low_3',
        difficulty: 'Low',
        prompt: `Why is unit consistency critical when solving quantitative problems in ${topic}?`,
        options: [
          'It is strictly aesthetic and does not affect the answer',
          'Mismatched units cause dimensional errors and incorrect numerical magnitudes',
          'Units cancel out automatically in all calculations',
          'Units only matter in geometry'
        ],
        correctIndex: 1,
        explanation: 'Dimensional analysis guarantees that operations are physically and mathematically valid.'
      },
      {
        id: 'gen_low_4',
        difficulty: 'Low',
        prompt: `What is the best way to verify an algebraic or logical deduction in ${topic}?`,
        options: [
          'Substitute the solution back into the original condition',
          'Assume the first calculation was error-free',
          'Reverse the sign arbitrarily',
          'Look for the longest answer choice'
        ],
        correctIndex: 0,
        explanation: 'Back-substitution confirms whether candidate answers satisfy the initial conditions.'
      },
      {
        id: 'gen_low_5',
        difficulty: 'Low',
        prompt: `In ${topic}, what does a controlled variable represent in an experiment?`,
        options: [
          'The factor deliberately altered by the researcher',
          'A factor kept constant to prevent confounding the observed result',
          'The outcome measurement',
          'An unintended error'
        ],
        correctIndex: 1,
        explanation: 'Control variables are held constant so that any observed change is due to the independent variable.'
      },

      // 5 Medium Level
      {
        id: 'gen_med_1',
        difficulty: 'Medium',
        prompt: `When synthesizing concepts in ${topic}, how do primary causes differ from secondary symptoms?`,
        options: [
          'Symptoms originate the system; causes are side effects',
          'Primary causes drive underlying mechanisms, while symptoms are visible manifestations',
          'There is no distinction between cause and symptom',
          'Causes only occur at the conclusion'
        ],
        correctIndex: 1,
        explanation: 'Root causes drive mechanisms, whereas symptoms are downstream observable effects.'
      },
      {
        id: 'gen_med_2',
        difficulty: 'Medium',
        prompt: `In problem-solving within ${topic}, what is the purpose of testing boundary conditions (e.g. 0, 1, or infinity)?`,
        options: [
          'To intentionally cause calculations to fail',
          'To confirm behavior at extreme limits and catch formula or logic errors',
          'To replace the general formula entirely',
          'Boundary testing is only used in literature'
        ],
        correctIndex: 1,
        explanation: 'Boundary cases quickly highlight whether a formula behaves rationally at edges.'
      },
      {
        id: 'gen_med_3',
        difficulty: 'Medium',
        prompt: `Why is the principle of conservation (mass, energy, momentum) central across ${topic}?`,
        options: [
          'It states that key quantities cannot appear or disappear spontaneously in a closed system',
          'It allows equations to change balance arbitrarily',
          'It only applies in open atmospheric conditions',
          'It eliminates the need for mathematical rigor'
        ],
        correctIndex: 0,
        explanation: 'Conservation laws set the boundary equations for all equilibrium calculations.'
      },
      {
        id: 'gen_med_4',
        difficulty: 'Medium',
        prompt: `When analyzing opposing arguments or mechanisms in ${topic}, what yields the most rigorous evaluation?`,
        options: [
          'Dismissing counterarguments without evidence',
          'Comparing empirical evidence, replicability, and predictive validity',
          'Choosing the oldest theory available',
          'Voting based on popular sentiment'
        ],
        correctIndex: 1,
        explanation: 'Empirical data and testable predictions provide the standard of scientific validity.'
      },
      {
        id: 'gen_med_5',
        difficulty: 'Medium',
        prompt: `What is the danger of confounding variables in an analysis of ${topic}?`,
        options: [
          'They clarify the direct relationship',
          'They can introduce false correlations and mask the true causal relationship',
          'They make calculations faster',
          'They have zero mathematical influence'
        ],
        correctIndex: 1,
        explanation: 'Confounders distort the observed association between treatment and outcome.'
      },

      // 5 Hard Level
      {
        id: 'gen_hard_1',
        difficulty: 'Hard',
        prompt: `In multi-variable systems within ${topic}, what does non-linear feedback imply?`,
        options: [
          'Effects are always strictly proportional to causes',
          'Small initial fluctuations can trigger disproportionately large cascading responses',
          'The system stops changing forever',
          'All equations simplify to linear addition'
        ],
        correctIndex: 1,
        explanation: 'Non-linear feedback creates complex dynamics where inputs produce amplified or damped non-proportional outputs.'
      },
      {
        id: 'gen_hard_2',
        difficulty: 'Hard',
        prompt: `How does sensitivity analysis enhance conclusions drawn in ${topic}?`,
        options: [
          'It measures how changes in model assumptions affect the reliability of the outcome',
          'It eliminates all uncertainty completely',
          'It replaces empirical evidence with intuition',
          'It guarantees a single immutable answer'
        ],
        correctIndex: 0,
        explanation: 'Sensitivity analysis reveals which parameters drive outcomes and where precision matters most.'
      },
      {
        id: 'gen_hard_3',
        difficulty: 'Hard',
        prompt: `What distinguishes deductive reasoning from inductive reasoning in rigorous work on ${topic}?`,
        options: [
          'Deductive starts with general axioms to guarantee specific truths; inductive extrapolates general patterns from specific observations',
          'Inductive is 100% certain while deductive is always a guess',
          'Deductive only applies to poetry',
          'They are interchangeable terms'
        ],
        correctIndex: 0,
        explanation: 'Deductive reasoning moves from general laws to specific instances; induction builds general rules from sample observations.'
      },
      {
        id: 'gen_hard_4',
        difficulty: 'Hard',
        prompt: `When evaluating an asymptotic limit in ${topic}, what does the limit describe?`,
        options: [
          'The exact starting value at t = 0',
          'The stable boundary value approached as an independent variable grows arbitrarily large',
          'A random noise fluctuation',
          'An undefined mathematical error'
        ],
        correctIndex: 1,
        explanation: 'Asymptotic limits describe long-term behavior as variables approach infinity or boundaries.'
      },
      {
        id: 'gen_hard_5',
        difficulty: 'Hard',
        prompt: `In theoretical frameworks for ${topic}, what is Occam's Razor?`,
        options: [
          'The most complex theory with the most variables is always correct',
          'Among competing hypotheses that predict equally well, the one with the fewest assumptions is favored',
          'All scientific laws must be rewritten every decade',
          'Mathematical proofs can omit logical steps'
        ],
        correctIndex: 1,
        explanation: 'Parsimony states that simpler models with fewer assumptions are preferable when predictive accuracy is equal.'
      }
    ];
  }

  // If user requested 15 tiered questions, return the full 15 (5 Low, 5 Medium, 5 Hard)
  if (tiered && questionCount >= 15) {
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 5);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 5);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 5);
    return [...low, ...med, ...hard];
  }

  // If user requested a custom count (e.g. 5 or 10)
  if (questionCount === 5) {
    // 2 Low, 2 Med, 1 Hard
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 2);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 2);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 1);
    return [...low, ...med, ...hard];
  }

  if (questionCount === 10) {
    // 3 Low, 4 Med, 3 Hard
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 3);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 4);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 3);
    return [...low, ...med, ...hard];
  }

  return pool.slice(0, questionCount);
}

export function generateTopicFlashcards(topic: string): Flashcard[] {
  const t = topic.toLowerCase();

  // Coding & C Programming & Loops
  if (
    t.includes('c') ||
    t.includes('loop') ||
    t.includes('code') ||
    t.includes('program') ||
    t.includes('python') ||
    t.includes('java')
  ) {
    return [
      {
        id: 'fc1',
        front: 'for Loop Syntax in C',
        back: 'for (initialization; condition; increment/decrement) {\n    // code to repeat\n}\nExample: for (int i = 1; i <= 5; i++) { printf("%d\\n", i); }',
        category: 'C Programming'
      },
      {
        id: 'fc2',
        front: 'while Loop in C',
        back: 'Evaluates condition BEFORE entering body:\nint i = 1;\nwhile (i <= 5) {\n    printf("%d\\n", i);\n    i++;\n}',
        category: 'C Programming'
      },
      {
        id: 'fc3',
        front: 'do-while Loop Guarantee',
        back: 'Executes the block AT LEAST ONCE before evaluating condition at the end:\ndo {\n    printf("%d\\n", i);\n    i++;\n} while (i <= 5);',
        category: 'C Programming'
      },
      {
        id: 'fc4',
        front: '#include <stdio.h>',
        back: 'Pre-processor directive that includes the Standard Input/Output library required for printf() and scanf().',
        category: 'C Standard Library'
      },
      {
        id: 'fc5',
        front: 'Off-by-One Loop Error',
        back: 'Difference between (i < 5) and (i <= 5):\n• Starting at 1, (i <= 5) runs 5 times (1, 2, 3, 4, 5).\n• (i < 5) stops at 4!',
        category: 'Debugging & Best Practices'
      }
    ];
  }

  // Science & Photosynthesis
  if (t.includes('photosynthesis') || t.includes('bio') || t.includes('cell') || t.includes('plant')) {
    return [
      {
        id: 'fc1',
        front: 'Photosynthesis Chemical Formula',
        back: '6CO₂ + 6H₂O + light energy ➔ C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)',
        category: 'Biology'
      },
      {
        id: 'fc2',
        front: 'Light-Dependent Reactions',
        back: 'Occur in Thylakoids: Chlorophyll absorbs sunlight, splits water (H₂O), releasing O₂ and charging ATP and NADPH.',
        category: 'Plant Physiology'
      },
      {
        id: 'fc3',
        front: 'Calvin Cycle (Light-Independent)',
        back: 'Occurs in Stroma: Uses ATP and NADPH to fix CO₂ into glucose sugar without needing direct light.',
        category: 'Plant Physiology'
      },
      {
        id: 'fc4',
        front: 'Mitochondria vs Chloroplast',
        back: '• Chloroplasts MAKE glucose using sunlight.\n• Mitochondria BREAK DOWN glucose into ATP energy for cell work.',
        category: 'Cell Biology'
      }
    ];
  }

  // Mathematics & Algebra
  if (t.includes('math') || t.includes('algebra') || t.includes('equation') || t.includes('fraction')) {
    return [
      {
        id: 'fc1',
        front: 'Golden Rule of Algebraic Equations',
        back: 'Whatever operation you perform on one side of the equals sign (=), you MUST perform identically on the other side.',
        category: 'Algebra'
      },
      {
        id: 'fc2',
        front: 'Fraction Division: "Keep, Change, Flip"',
        back: '(a/b) ÷ (c/d) = (a/b) × (d/c)\nKeep 1st fraction, Change ÷ to ×, Flip 2nd fraction to reciprocal.',
        category: 'Arithmetic'
      },
      {
        id: 'fc3',
        front: 'Quadratic Formula',
        back: 'x = (-b ± √(b² - 4ac)) / (2a)\nUsed to find the roots of ax² + bx + c = 0.',
        category: 'Algebra'
      },
      {
        id: 'fc4',
        front: 'Order of Operations (PEMDAS)',
        back: '1. Parentheses\n2. Exponents\n3. Multiplication & Division (left-to-right)\n4. Addition & Subtraction (left-to-right)',
        category: 'Foundations'
      }
    ];
  }

  // Default Flashcards
  return [
    {
      id: 'fc1',
      front: `Core Principle of ${topic}`,
      back: 'The fundamental law or rule governing how this system or concept behaves under standard conditions.',
      category: topic
    },
    {
      id: 'fc2',
      front: 'Common Trap to Avoid',
      back: 'Jumping to conclusions without verifying intermediate steps or boundary cases.',
      category: topic
    },
    {
      id: 'fc3',
      front: 'Verification Method',
      back: 'Test candidate solutions with edge values (0, 1, negatives) or plug back into the original condition.',
      category: topic
    },
    {
      id: 'fc4',
      front: 'Exam Quick-Tip',
      back: 'Annotate key given values and units before starting your solution.',
      category: topic
    }
  ];
}
