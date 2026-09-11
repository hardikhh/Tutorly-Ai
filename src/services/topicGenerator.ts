export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: 'Low' | 'Medium' | 'Hard';
  type?: 'mcq' | 'truefalse';
}

/** Shuffle an array in-place using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle the options of each question and update correctIndex so the right
 * answer is never predictably in the same slot.
 */
export function shuffleOptions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map(q => {
    const correctAnswer = q.options[q.correctIndex];
    const shuffled = shuffle(q.options);
    return {
      ...q,
      options: shuffled,
      correctIndex: shuffled.indexOf(correctAnswer)
    };
  });
}

/**
 * Convert MCQ questions into True / False format:
 * Each question becomes "True or False: <correct statement>"
 * with ["True", "False"] options.
 */
export function toTrueFalse(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((q, i) => ({
    ...q,
    id: `tf_${i}`,
    type: 'truefalse' as const,
    // Use the correct option text as the statement — answer is always True
    prompt: `True or False: ${q.options[q.correctIndex]}`,
    options: ['True', 'False'],
    // Randomly decide if we present the true statement (answer=True) or
    // flip it to a false statement (answer=False) for variety
    ...(() => {
      const showAsTrue = Math.random() > 0.5;
      if (showAsTrue) {
        return { prompt: `True or False: ${q.options[q.correctIndex]}`, options: ['True', 'False'], correctIndex: 0 };
      } else {
        // Pick a wrong option as the statement
        const wrongOptions = q.options.filter((_, idx) => idx !== q.correctIndex);
        const wrongStatement = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || q.options[q.correctIndex];
        return { prompt: `True or False: ${wrongStatement}`, options: ['True', 'False'], correctIndex: 1 };
      }
    })()
  }));
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

// Helper detection functions with word boundaries to avoid false positives (e.g. matching 'c' in 'calculus')
export function isCProgramming(t: string): boolean {
  return (
    /\b(c\s+prog|c\s+lang|c\s+syntax|c\s+loops?|c\s+pointers?|stdio\.h)\b/i.test(t) ||
    t === 'c' ||
    t === 'c programming' ||
    t === 'c language' ||
    t === 'c loops & syntax' ||
    t === 'c programming & loops'
  );
}

export function isPython(t: string): boolean {
  return /\b(python|py|django|flask|pandas|numpy|list comprehension)\b/i.test(t);
}

export function isJava(t: string): boolean {
  return /\b(java|jvm|spring|oop|object oriented|polymorphism|inheritance)\b/i.test(t) && !/javascript/i.test(t);
}

export function isBiology(t: string): boolean {
  return /\b(bio|biology|photosynthesis|cell|cells|plant|plants|chloroplast|mitochondria|respiration|dna|rna|gene|genetics|enzyme|ecology)\b/i.test(t);
}

export function isMathematics(t: string): boolean {
  return /\b(math|mathematics|algebra|calculus|derivative|integral|equation|equations|fraction|fractions|quadratic|geometry|trig|trigonometry|pemdas|matrix)\b/i.test(t);
}

export function isPhysics(t: string): boolean {
  return /\b(physic|physics|newton|newtonian|force|forces|gravity|velocity|acceleration|momentum|kinetic|potential|thermodynamics?|optics|friction|inertia|wave|electromagnetism)\b/i.test(t);
}

export function isChemistry(t: string): boolean {
  return /\b(chem|chemistry|chemical|periodic|element|atom|atomic|molecule|reaction|reactions|acid|base|bonding|stoichiometry|ion|covalent|organic chem)\b/i.test(t);
}

export function isHistory(t: string): boolean {
  return /\b(history|historical|revolution|french revolution|war|ww1|ww2|world war|empire|treaty|monarchy|renaissance|democracy|civil war|medieval|dynasty)\b/i.test(t);
}

export function generateTopicQuiz(
  topic: string,
  questionCount: number = 15,
  tiered: boolean = true
): QuizQuestion[] {
  const t = topic.trim().toLowerCase();
  let pool: QuizQuestion[] = [];

  // 1. CODING: C PROGRAMMING & LOOPS
  if (isCProgramming(t)) {
    pool = [
      // 5 Low
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
        options: ['for (int i = 1; i <= 5; i++)', 'for (int i = 0; i < 5; i--)', 'for (i = 1 to 5)', 'loop (1 <= 5)'],
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
      // 5 Med
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
        prompt: 'What is the purpose of the "break" statement inside a loop in C?',
        options: [
          'Skip the current iteration and proceed to next',
          'Immediately terminate and exit the innermost loop',
          'Restart the loop from 0',
          'Pause the computer clock'
        ],
        correctIndex: 1,
        explanation: '"break" terminates the loop immediately, jumping execution to the first statement after the loop.'
      },
      {
        id: 'c_med_3',
        difficulty: 'Medium',
        prompt: 'What does "continue" do inside a while loop?',
        options: [
          'Terminates the program',
          'Skips the rest of the current iteration and jumps to the loop condition test',
          'Increments variables by 2',
          'Prints the current variable'
        ],
        correctIndex: 1,
        explanation: '"continue" skips remaining statements in the current iteration and triggers the next condition check.'
      },
      {
        id: 'c_med_4',
        difficulty: 'Medium',
        prompt: 'What happens if a loop condition is never false, e.g., while (1) { ... } without a break?',
        options: ['Segmentation fault', 'An infinite loop', 'Compiler error', 'Automatic restart'],
        correctIndex: 1,
        explanation: 'When the loop condition always evaluates to non-zero (true), an infinite loop occurs.'
      },
      {
        id: 'c_med_5',
        difficulty: 'Medium',
        prompt: 'What is the value of i after exiting: int i; for (i = 0; i < 4; i++) { } ?',
        options: ['3', '4', '5', '0'],
        correctIndex: 1,
        explanation: 'The loop increments i to 4. Since 4 < 4 is false, the loop exits with i equal to 4.'
      },
      // 5 Hard
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

  // 2. PYTHON PROGRAMMING
  else if (isPython(t)) {
    pool = [
      // 5 Low
      {
        id: 'py_low_1',
        difficulty: 'Low',
        prompt: 'Which keyword is used to define a function in Python?',
        options: ['func', 'def', 'function', 'define'],
        correctIndex: 1,
        explanation: 'In Python, functions are defined using the "def" keyword followed by the function name.'
      },
      {
        id: 'py_low_2',
        difficulty: 'Low',
        prompt: 'What data structure in Python is ordered, mutable, and written with square brackets []?',
        options: ['Tuple', 'Dictionary', 'List', 'Set'],
        correctIndex: 2,
        explanation: 'Lists are mutable sequences defined using square brackets: [1, 2, 3].'
      },
      {
        id: 'py_low_3',
        difficulty: 'Low',
        prompt: 'What is the output of len("Tutorly") in Python?',
        options: ['6', '7', '8', 'None'],
        correctIndex: 1,
        explanation: '"Tutorly" has 7 characters, so len() returns 7.'
      },
      {
        id: 'py_low_4',
        difficulty: 'Low',
        prompt: 'How are code blocks defined in Python instead of curly braces {}?',
        options: ['Semicolons', 'Indentation (whitespace)', 'Parentheses', 'Tags'],
        correctIndex: 1,
        explanation: 'Python uses indentation (standard 4 spaces) to delimit code blocks and scope.'
      },
      {
        id: 'py_low_5',
        difficulty: 'Low',
        prompt: 'What function is used to take user text input from the console in Python 3?',
        options: ['scanf()', 'read()', 'input()', 'cin >>'],
        correctIndex: 2,
        explanation: 'input() pauses execution and reads a string from user console input.'
      },
      // 5 Med
      {
        id: 'py_med_1',
        difficulty: 'Medium',
        prompt: 'What does the list comprehension [x**2 for x in range(4)] produce?',
        options: ['[0, 1, 4, 9]', '[1, 4, 9, 16]', '[0, 2, 4, 6]', '[1, 2, 3, 4]'],
        correctIndex: 0,
        explanation: 'range(4) yields 0, 1, 2, 3. Squaring each yields [0, 1, 4, 9].'
      },
      {
        id: 'py_med_2',
        difficulty: 'Medium',
        prompt: 'What is the key difference between a Python list and a Python tuple?',
        options: [
          'Lists cannot store strings; tuples can',
          'Lists are mutable; tuples are immutable (cannot be changed after creation)',
          'Tuples are slower than lists in all cases',
          'Lists use parentheses; tuples use curly braces'
        ],
        correctIndex: 1,
        explanation: 'Tuples are immutable; once created, elements cannot be modified, added, or removed.'
      },
      {
        id: 'py_med_3',
        difficulty: 'Medium',
        prompt: 'In a dictionary d = {"a": 1, "b": 2}, what happens when calling d.get("c", 0)?',
        options: ['KeyError exception', 'Returns None', 'Returns default value 0 without raising an error', 'Adds "c": 0 to dictionary'],
        correctIndex: 2,
        explanation: 'dict.get(key, default) safely retrieves values, returning the default if the key is absent.'
      },
      {
        id: 'py_med_4',
        difficulty: 'Medium',
        prompt: 'What does the slice s[::-1] do on a string s = "hello"?',
        options: ['Removes first letter', 'Reverses the string to "olleh"', 'Capitalizes each letter', 'Returns empty string'],
        correctIndex: 1,
        explanation: 'A step size of -1 traverses the sequence in reverse order.'
      },
      {
        id: 'py_med_5',
        difficulty: 'Medium',
        prompt: 'What is the purpose of the "finally" block in Python exception handling?',
        options: [
          'Runs only if an exception is thrown',
          'Executes always, whether an exception occurred or not (useful for cleanup)',
          'Suppresses all errors',
          'Restarts the program'
        ],
        correctIndex: 1,
        explanation: 'The finally block always runs, making it ideal for closing files and releasing resources.'
      },
      // 5 Hard
      {
        id: 'py_hard_1',
        difficulty: 'Hard',
        prompt: 'What is a Python generator and which keyword distinguishes it from a regular function?',
        options: [
          'A class with __init__',
          'A function that uses "yield" to lazily produce values one at a time on demand',
          'A compiler optimization flag',
          'An external C library'
        ],
        correctIndex: 1,
        explanation: 'The yield keyword turns a function into a generator that produces items on the fly without storing the full sequence in memory.'
      },
      {
        id: 'py_hard_2',
        difficulty: 'Hard',
        prompt: 'What does the Global Interpreter Lock (GIL) in CPython do?',
        options: [
          'Encrypts memory addresses',
          'Restricts CPU-bound Python threads so only one thread executes Python bytecode at a time',
          'Prevents imports of third-party libraries',
          'Locks files against write access'
        ],
        correctIndex: 1,
        explanation: 'CPython GIL is a mutex that prevents multiple native threads from executing Python bytecodes at once.'
      },
      {
        id: 'py_hard_3',
        difficulty: 'Hard',
        prompt: 'In Python decorators, what does functools.wraps do when applied to the wrapper function?',
        options: [
          'Compiles the wrapper to C',
          'Preserves the original function name, docstring, and metadata',
          'Enforces type checking',
          'Caches return values'
        ],
        correctIndex: 1,
        explanation: '@wraps copies original function attributes (__name__, __doc__) to preserve metadata.'
      },
      {
        id: 'py_hard_4',
        difficulty: 'Hard',
        prompt: 'What happens with default mutable arguments: def add_item(val, target=[]): target.append(val); return target?',
        options: [
          'A fresh new empty list is created on each function call',
          'The default list is instantiated once at function definition time and shared across subsequent calls',
          'Raises TypeError on second call',
          'Python garbage collects the list immediately'
        ],
        correctIndex: 1,
        explanation: 'Default arguments are evaluated once at definition time, so mutable defaults persist mutations across calls.'
      },
      {
        id: 'py_hard_5',
        difficulty: 'Hard',
        prompt: 'What is the average time complexity of checking membership (x in container) for a Python set vs list?',
        options: ['O(N) for set, O(1) for list', 'O(1) for set (hash table lookup), O(N) for list', 'O(log N) for both', 'O(N²) for both'],
        correctIndex: 1,
        explanation: 'Python sets use hash tables for average O(1) membership testing, whereas lists require O(N) linear scans.'
      }
    ];
  }

  // 3. SCIENCE: BIOLOGY & PHOTOSYNTHESIS
  else if (isBiology(t)) {
    pool = [
      // 5 Low
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
      // 5 Med
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
        prompt: 'What is the balanced chemical equation for aerobic photosynthesis?',
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
      // 5 Hard
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
          'They do not require sunlight at all',
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
        explanation: 'Aerobic cellular respiration typically produces a net theoretical yield of 30-32 ATP molecules.'
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

  // 4. MATHEMATICS: ALGEBRA & CALCULUS
  else if (isMathematics(t)) {
    pool = [
      // 5 Low
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
      // 5 Med
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
        options: ['Two distinct real roots', 'One repeated real root', 'Two complex/imaginary roots', 'No solutions exist'],
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
      // 5 Hard
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

  // 5. PHYSICS: FORCES, MOTION & NEWTON'S LAWS
  else if (isPhysics(t)) {
    pool = [
      // 5 Low
      {
        id: 'phys_low_1',
        difficulty: 'Low',
        prompt: "What is Newton's Second Law of Motion expressed as a formula?",
        options: ['F = m × a', 'E = mc²', 'v = d / t', 'p = m × v'],
        correctIndex: 0,
        explanation: 'Newton\'s Second Law states that force equals mass multiplied by acceleration (F = ma).'
      },
      {
        id: 'phys_low_2',
        difficulty: 'Low',
        prompt: 'What is the difference between speed and velocity in physics?',
        options: [
          'Speed has direction, velocity does not',
          'Velocity is a vector quantity (has magnitude AND direction); speed is a scalar',
          'They are identical in all aspects',
          'Speed is measured in Newtons, velocity in Joules'
        ],
        correctIndex: 1,
        explanation: 'Velocity specifies both speed and direction of motion, making it a vector quantity.'
      },
      {
        id: 'phys_low_3',
        difficulty: 'Low',
        prompt: 'What is the standard acceleration due to gravity near Earth\'s surface (g)?',
        options: ['9.8 m/s²', '3.14 m/s²', '100 m/s²', '0 m/s²'],
        correctIndex: 0,
        explanation: 'Free-fall gravitational acceleration on Earth is approximately 9.8 meters per second squared.'
      },
      {
        id: 'phys_low_4',
        difficulty: 'Low',
        prompt: 'Which of Newton\'s laws states that every action has an equal and opposite reaction?',
        options: ['First Law (Inertia)', 'Second Law (F=ma)', 'Third Law (Action-Reaction)', 'Law of Universal Gravitation'],
        correctIndex: 2,
        explanation: 'Newton\'s Third Law states that forces always occur in matched action-reaction pairs.'
      },
      {
        id: 'phys_low_5',
        difficulty: 'Low',
        prompt: 'What is the SI unit of Force?',
        options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Pascal (Pa)'],
        correctIndex: 2,
        explanation: 'The SI unit of force is the Newton (1 N = 1 kg·m/s²).'
      },
      // 5 Med
      {
        id: 'phys_med_1',
        difficulty: 'Medium',
        prompt: 'A 10 kg box is pushed across a frictionless surface with a net force of 50 N. What is its acceleration?',
        options: ['0.2 m/s²', '5 m/s²', '500 m/s²', '10 m/s²'],
        correctIndex: 1,
        explanation: 'Using a = F / m: a = 50 N / 10 kg = 5 m/s².'
      },
      {
        id: 'phys_med_2',
        difficulty: 'Medium',
        prompt: 'What happens to the kinetic energy of an object if its velocity is doubled?',
        options: ['It doubles (2×)', 'It quadruples (4×)', 'It remains unchanged', 'It halves (0.5×)'],
        correctIndex: 1,
        explanation: 'Kinetic energy KE = 0.5 * m * v². Since v is squared, doubling velocity increases KE by 2² = 4 times.'
      },
      {
        id: 'phys_med_3',
        difficulty: 'Medium',
        prompt: 'What law of physics explains why passengers lurch forward when a bus suddenly brakes?',
        options: ['Inertia (Newton\'s First Law)', 'Bernoulli\'s principle', 'Coulomb\'s law', 'Ohm\'s law'],
        correctIndex: 0,
        explanation: 'Inertia keeps the passengers in forward motion until an external stopping force acts upon them.'
      },
      {
        id: 'phys_med_4',
        difficulty: 'Medium',
        prompt: 'What is the formula for gravitational potential energy near Earth\'s surface?',
        options: ['PE = mgh', 'PE = 0.5 mv²', 'PE = F × d', 'PE = m / g'],
        correctIndex: 0,
        explanation: 'Gravitational potential energy is calculated as mass × gravitational acceleration × height (mgh).'
      },
      {
        id: 'phys_med_5',
        difficulty: 'Medium',
        prompt: 'In an isolated system with no external forces, what quantity is always strictly conserved during a collision?',
        options: ['Kinetic energy only', 'Total momentum', 'Temperature', 'Speed'],
        correctIndex: 1,
        explanation: 'Total linear momentum is conserved in all closed-system collisions (both elastic and inelastic).'
      },
      // 5 Hard
      {
        id: 'phys_hard_1',
        difficulty: 'Hard',
        prompt: 'If the distance between two gravitational masses is tripled (3r), how does the gravitational force change?',
        options: ['Decreases to 1/3', 'Decreases to 1/9', 'Increases by 3 times', 'Remains unchanged'],
        correctIndex: 1,
        explanation: 'Newton\'s Law of Gravitation follows an inverse-square law: F ∝ 1/r². Tripling r gives 1/(3²) = 1/9 the original force.'
      },
      {
        id: 'phys_hard_2',
        difficulty: 'Hard',
        prompt: 'What provides the centripetal force required to keep a satellite in circular orbit around Earth?',
        options: ['Atmospheric pressure', 'Earth\'s gravitational attraction', 'Solar wind', 'The satellite\'s engine thrust'],
        correctIndex: 1,
        explanation: 'Earth\'s gravitational pull acts directly toward Earth\'s center, providing the needed centripetal acceleration.'
      },
      {
        id: 'phys_hard_3',
        difficulty: 'Hard',
        prompt: 'In an inelastic collision between two identical cars that stick together after impact, what happens to kinetic energy?',
        options: ['It increases', 'It is 100% conserved', 'A portion of kinetic energy is converted to thermal, acoustic, and deformation energy', 'It vanishes entirely'],
        correctIndex: 2,
        explanation: 'Inelastic collisions conserve total momentum, but kinetic energy is dissipated into heat, sound, and structural deformation.'
      },
      {
        id: 'phys_hard_4',
        difficulty: 'Hard',
        prompt: 'What is terminal velocity of a falling skydiver?',
        options: [
          'The speed of sound',
          'The constant velocity reached when upward drag force equals downward gravitational force (net force = 0)',
          'The maximum speed of light',
          'Zero speed'
        ],
        correctIndex: 1,
        explanation: 'When aerodynamic drag equals weight, acceleration drops to zero and the object falls at constant terminal velocity.'
      },
      {
        id: 'phys_hard_5',
        difficulty: 'Hard',
        prompt: 'What is the First Law of Thermodynamics fundamentally equivalent to?',
        options: ['Law of Conservation of Energy', 'Law of Universal Gravitation', 'Ideal Gas Law', 'Archimedes Principle'],
        correctIndex: 0,
        explanation: 'The First Law of Thermodynamics states ΔU = Q - W, which is the conservation of energy applied to thermodynamic systems.'
      }
    ];
  }

  // 6. CHEMISTRY: ATOMS, BONDS & REACTIONS
  else if (isChemistry(t)) {
    pool = [
      // 5 Low
      {
        id: 'chem_low_1',
        difficulty: 'Low',
        prompt: 'What subatomic particles are located inside the nucleus of an atom?',
        options: ['Electrons and protons', 'Protons and neutrons', 'Electrons and photons', 'Neutrons and electrons'],
        correctIndex: 1,
        explanation: 'Protons and neutrons reside in the nucleus, while electrons orbit in electron clouds.'
      },
      {
        id: 'chem_low_2',
        difficulty: 'Low',
        prompt: 'What is the pH of a neutral solution (like pure distilled water at 25°C)?',
        options: ['0', '7', '14', '1'],
        correctIndex: 1,
        explanation: 'A pH of 7 represents neutral. Values < 7 are acidic and > 7 are basic/alkaline.'
      },
      {
        id: 'chem_low_3',
        difficulty: 'Low',
        prompt: 'What chemical bond is formed when electrons are shared between two nonmetal atoms?',
        options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
        correctIndex: 1,
        explanation: 'Covalent bonds form when nonmetal atoms share pairs of valence electrons.'
      },
      {
        id: 'chem_low_4',
        difficulty: 'Low',
        prompt: 'What is the chemical symbol for Gold on the periodic table?',
        options: ['Ag', 'Au', 'Fe', 'Gd'],
        correctIndex: 1,
        explanation: 'Au (from Latin Aurum) is the chemical symbol for Gold.'
      },
      {
        id: 'chem_low_5',
        difficulty: 'Low',
        prompt: 'What gas is evolved when an active metal reacts with dilute hydrochloric acid?',
        options: ['Oxygen', 'Hydrogen (H2)', 'Carbon Dioxide', 'Nitrogen'],
        correctIndex: 1,
        explanation: 'Metals displace hydrogen from acids: Zn + 2HCl -> ZnCl2 + H2.'
      },
      // 5 Med
      {
        id: 'chem_med_1',
        difficulty: 'Medium',
        prompt: 'What is the molar mass of water (H2O), given H = 1 g/mol and O = 16 g/mol?',
        options: ['17 g/mol', '18 g/mol', '32 g/mol', '16 g/mol'],
        correctIndex: 1,
        explanation: '2(1) + 16 = 18 g/mol.'
      },
      {
        id: 'chem_med_2',
        difficulty: 'Medium',
        prompt: 'Which elements on the periodic table have complete valence shells and are largely chemically inert?',
        options: ['Alkali metals', 'Halogens', 'Noble gases', 'Transition metals'],
        correctIndex: 2,
        explanation: 'Noble gases (Group 18: Helium, Neon, Argon, etc.) have full outer valence octets.'
      },
      {
        id: 'chem_med_3',
        difficulty: 'Medium',
        prompt: 'What does Le Chatelier\'s Principle predict when pressure is increased on a gaseous equilibrium system?',
        options: [
          'Reaction stops completely',
          'Equilibrium shifts toward the side with fewer moles of gas',
          'Temperature drops to absolute zero',
          'Equilibrium never changes'
        ],
        correctIndex: 1,
        explanation: 'Increasing pressure shifts equilibrium to counteract the increase by favoring fewer gas molecules.'
      },
      {
        id: 'chem_med_4',
        difficulty: 'Medium',
        prompt: 'In a redox reaction, what happens to the species that undergoes oxidation?',
        options: ['It gains electrons (LEO says GER)', 'It loses electrons', 'It gains protons', 'Its mass doubles'],
        correctIndex: 1,
        explanation: 'Oxidation is the Loss of electrons (OIL RIG: Oxidation Is Loss, Reduction Is Gain).'
      },
      {
        id: 'chem_med_5',
        difficulty: 'Medium',
        prompt: 'What type of bond forms between Sodium (Na) and Chlorine (Cl) in table salt (NaCl)?',
        options: ['Pure covalent', 'Ionic bond', 'Nonpolar covalent', 'Van der Waals'],
        correctIndex: 1,
        explanation: 'Sodium transfers an electron to Chlorine, forming Na+ and Cl- held by electrostatic attraction (ionic bond).'
      },
      // 5 Hard
      {
        id: 'chem_hard_1',
        difficulty: 'Hard',
        prompt: 'What does the hybridization of carbon in methane (CH4) equal?',
        options: ['sp', 'sp²', 'sp³', 'dsp²'],
        correctIndex: 2,
        explanation: 'Carbon in methane forms 4 single sigma bonds with tetrahedral geometry, corresponding to sp³ hybridization.'
      },
      {
        id: 'chem_hard_2',
        difficulty: 'Hard',
        prompt: 'According to the Arrhenius equation k = A * e^(-Ea / RT), what happens to reaction rate when temperature increases?',
        options: [
          'Rate constant k decreases exponentially',
          'Rate constant k increases because more reactant particles possess energy exceeding the activation energy (Ea)',
          'Activation energy disappears',
          'Reaction becomes endothermic automatically'
        ],
        correctIndex: 1,
        explanation: 'Higher temperature exponentially increases the fraction of collisions exceeding the activation energy threshold.'
      },
      {
        id: 'chem_hard_3',
        difficulty: 'Hard',
        prompt: 'For a spontaneous reaction under standard conditions, what must be true about Gibbs Free Energy (ΔG)?',
        options: ['ΔG > 0 (positive)', 'ΔG < 0 (negative)', 'ΔG = 0', 'ΔG is infinite'],
        correctIndex: 1,
        explanation: 'A reaction is thermodynamically spontaneous at constant T and P when ΔG is negative (ΔG < 0).'
      },
      {
        id: 'chem_hard_4',
        difficulty: 'Hard',
        prompt: 'Why is water (H2O) a polar molecule with a bent molecular shape rather than linear?',
        options: [
          'Oxygen has two lone pairs that exert repulsive forces on the bonding electron pairs',
          'Hydrogen is heavier than oxygen',
          'Water only exists as a solid',
          'Oxygen forms triple bonds'
        ],
        correctIndex: 0,
        explanation: 'The two lone pairs on oxygen create an asymmetrical tetrahedral electron domain geometry with a ~104.5° bent angle.'
      },
      {
        id: 'chem_hard_5',
        difficulty: 'Hard',
        prompt: 'What is the oxidation state of Chromium in the dichromate ion (Cr2O7)²⁻?',
        options: ['+3', '+6', '+7', '+2'],
        correctIndex: 1,
        explanation: '7 oxygens contribute -14. With net charge -2, 2(Cr) - 14 = -2 => 2(Cr) = 12 => Cr = +6.'
      }
    ];
  }

  // 7. HISTORY: WORLD HISTORY & REVOLUTIONS
  else if (isHistory(t)) {
    pool = [
      // 5 Low
      {
        id: 'hist_low_1',
        difficulty: 'Low',
        prompt: 'In which year did the French Revolution begin with the storming of the Bastille?',
        options: ['1776', '1789', '1804', '1815'],
        correctIndex: 1,
        explanation: 'The storming of the Bastille took place on July 14, 1789 in Paris.'
      },
      {
        id: 'hist_low_2',
        difficulty: 'Low',
        prompt: 'Who was the king of France during the outbreak of the French Revolution?',
        options: ['Louis XIV', 'Louis XVI', 'Napoleon Bonaparte', 'Charles de Gaulle'],
        correctIndex: 1,
        explanation: 'King Louis XVI and Queen Marie Antoinette ruled France at the start of the 1789 revolution.'
      },
      {
        id: 'hist_low_3',
        difficulty: 'Low',
        prompt: 'In pre-revolutionary France, which Estate represented 98% of the population, including peasants and merchants?',
        options: ['First Estate (Clergy)', 'Second Estate (Nobility)', 'Third Estate (Commoners)', 'Fourth Estate'],
        correctIndex: 2,
        explanation: 'The Third Estate comprised the entire commoner population who bore almost all taxes.'
      },
      {
        id: 'hist_low_4',
        difficulty: 'Low',
        prompt: 'In which year did World War I end with the signing of the Armistice?',
        options: ['1914', '1918', '1939', '1945'],
        correctIndex: 1,
        explanation: 'World War I concluded on November 11, 1918.'
      },
      {
        id: 'hist_low_5',
        difficulty: 'Low',
        prompt: 'What ancient civilization built the Pyramids of Giza along the Nile River?',
        options: ['Roman Empire', 'Ancient Egypt', 'Mesopotamia', 'Inca Empire'],
        correctIndex: 1,
        explanation: 'Ancient Egyptians built the Giza pyramids as monumental royal tombs.'
      },
      // 5 Med
      {
        id: 'hist_med_1',
        difficulty: 'Medium',
        prompt: 'What radical phase of the French Revolution (1793–1794) was led by Maximilien Robespierre?',
        options: ['The Enlightenment', 'The Reign of Terror', 'The Hundred Days', 'The Pax Romana'],
        correctIndex: 1,
        explanation: 'The Committee of Public Safety under Robespierre executed thousands during the Reign of Terror.'
      },
      {
        id: 'hist_med_2',
        difficulty: 'Medium',
        prompt: 'What document adopted in 1789 declared that all men are born free and equal in rights?',
        options: [
          'Magna Carta',
          'Declaration of the Rights of Man and of the Citizen',
          'Treaty of Versailles',
          'The Communist Manifesto'
        ],
        correctIndex: 1,
        explanation: 'Adopted by France\'s National Constituent Assembly in August 1789.'
      },
      {
        id: 'hist_med_3',
        difficulty: 'Medium',
        prompt: 'What was the direct spark that ignited World War I in June 1914?',
        options: [
          'The sinking of the Lusitania',
          'The assassination of Archduke Franz Ferdinand in Sarajevo',
          'The invasion of Poland',
          'The Russian Revolution'
        ],
        correctIndex: 1,
        explanation: 'Archduke Franz Ferdinand of Austria was assassinated by Gavrilo Princip on June 28, 1914.'
      },
      {
        id: 'hist_med_4',
        difficulty: 'Medium',
        prompt: 'Which military leader seized power in France in 1799 and later crowned himself Emperor?',
        options: ['Robespierre', 'Napoleon Bonaparte', 'Danton', 'Marat'],
        correctIndex: 1,
        explanation: 'Napoleon Bonaparte took control in the Coup of 18 Brumaire (1799) and was crowned Emperor in 1804.'
      },
      {
        id: 'hist_med_5',
        difficulty: 'Medium',
        prompt: 'What treaty officially ended World War I in 1919 and imposed heavy reparations on Germany?',
        options: ['Treaty of Paris', 'Treaty of Versailles', 'Congress of Vienna', 'Treaty of Ghent'],
        correctIndex: 1,
        explanation: 'The 1919 Treaty of Versailles placed war guilt and massive financial reparations on Germany.'
      },
      // 5 Hard
      {
        id: 'hist_hard_1',
        difficulty: 'Hard',
        prompt: 'What financial crisis directly compelled King Louis XVI to convene the Estates-General in May 1789 for the first time in 175 years?',
        options: [
          'Rampant inflation from gold mines',
          'Massive national debt from funding foreign wars (including the American Revolution) and an inequitable tax system',
          'The collapse of the French East India Company',
          'A nationwide banking holiday'
        ],
        correctIndex: 1,
        explanation: 'France faced state bankruptcy caused by military loans, royal spending, and tax exemption for nobility and clergy.'
      },
      {
        id: 'hist_hard_2',
        difficulty: 'Hard',
        prompt: 'What was the significance of the Tennis Court Oath (Serment du Jeu de Paume) in June 1789?',
        options: [
          'The nobility pledged loyalty to the King',
          'Representatives of the Third Estate swore not to separate until they had written a French Constitution',
          'France declared war on Austria',
          'The King dissolved the parliament permanently'
        ],
        correctIndex: 1,
        explanation: 'Locked out of their hall, delegates met on a nearby indoor tennis court and pledged to create a constitution.'
      },
      {
        id: 'hist_hard_3',
        difficulty: 'Hard',
        prompt: 'What was the Schlieffen Plan devised by Germany prior to WWI?',
        options: [
          'A defensive naval blockade in the North Sea',
          'A rapid sweep through neutral Belgium to quickly knock out France before pivoting east against Russia',
          'An alliance with the United States',
          'An economic embargo on Britain'
        ],
        correctIndex: 1,
        explanation: 'Germany planned to avoid a prolonged two-front war by defeating France within six weeks through Belgium.'
      },
      {
        id: 'hist_hard_4',
        difficulty: 'Hard',
        prompt: 'How did the Civil Constitution of the Clergy (1790) alter the Catholic Church in revolutionary France?',
        options: [
          'It made Catholicism the exclusive state religion',
          'It subordinated the French Catholic Church to the civil government and required priests to swear allegiance to the state',
          'It moved the Papacy to Avignon permanently',
          'It outlawed religion entirely'
        ],
        correctIndex: 1,
        explanation: 'It turned clergy into salaried public servants elected by parishioners, causing a deep rift with Rome and rural Catholics.'
      },
      {
        id: 'hist_hard_5',
        difficulty: 'Hard',
        prompt: 'What major geopolitical shift resulted from the 1648 Peace of Westphalia?',
        options: [
          'The reunification of the Roman Empire',
          'The establishment of the concept of sovereign nation-states and non-interference in domestic affairs',
          'The colonization of South America',
          'The end of the Napoleonic Wars'
        ],
        correctIndex: 1,
        explanation: 'Westphalia ended the Thirty Years\' War and founded modern international relations based on state sovereignty.'
      }
    ];
  }

  // 8. UNIVERSAL ADAPTIVE GENERATOR FOR ANY OTHER TOPIC
  else {
    const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
    pool = [
      // 5 Low
      {
        id: 'univ_low_1',
        difficulty: 'Low',
        prompt: `In the core study of ${capitalized}, what is the essential first step when approaching a fundamental concept?`,
        options: [
          'Identify key definitions, axioms, and given variables',
          'Memorize answers without understanding definitions',
          'Ignore boundary conditions',
          'Assume all properties are constant'
        ],
        correctIndex: 0,
        explanation: `Understanding the precise definitions and parameters in ${capitalized} establishes the foundation for problem solving.`
      },
      {
        id: 'univ_low_2',
        difficulty: 'Low',
        prompt: `Which principle is fundamental to verifying solutions in ${capitalized}?`,
        options: [
          'Consistency across units, equations, and empirical observations',
          'Relying purely on intuitive guesswork',
          'Discarding counter-evidence',
          'Always picking the shortest answer'
        ],
        correctIndex: 0,
        explanation: `Consistency across standardized laws and empirical observations is critical when analyzing ${capitalized}.`
      },
      {
        id: 'univ_low_3',
        difficulty: 'Low',
        prompt: `How are foundational rules in ${capitalized} applied in real-world scenarios?`,
        options: [
          'By modeling complex systems into simplified, measurable components',
          'By ignoring environmental factors',
          'By assuming systems never undergo change',
          'By replacing rigorous models with opinion'
        ],
        correctIndex: 0,
        explanation: `Scientific and academic practice simplifies real-world systems into verified component models.`
      },
      {
        id: 'univ_low_4',
        difficulty: 'Low',
        prompt: `Why is precise terminology critical in ${capitalized}?`,
        options: [
          'It prevents misinterpretations of core mechanisms and theorems',
          'It is purely decorative',
          'It makes problems intentionally harder',
          'It eliminates the need for testing'
        ],
        correctIndex: 0,
        explanation: `Standard terminology ensures unambiguous communication of mechanisms in ${capitalized}.`
      },
      {
        id: 'univ_low_5',
        difficulty: 'Low',
        prompt: `In experiments or case studies in ${capitalized}, what purpose does a control variable serve?`,
        options: [
          'It is held constant to isolate the effect of the independent variable',
          'It is the variable being measured',
          'It is intentionally randomized',
          'It cancels out the hypothesis'
        ],
        correctIndex: 0,
        explanation: `Controls eliminate confounding influences so observed effects can be attributed to the test variable.`
      },
      // 5 Med
      {
        id: 'univ_med_1',
        difficulty: 'Medium',
        prompt: `When analyzing cause and effect in ${capitalized}, how do direct mechanisms differ from secondary symptoms?`,
        options: [
          'Direct mechanisms drive the core process; symptoms are downstream observable effects',
          'Symptoms cause the underlying phenomenon',
          'There is no distinction in scientific inquiry',
          'Mechanisms only appear in theoretical models'
        ],
        correctIndex: 0,
        explanation: `Identifying root mechanisms rather than superficial symptoms is essential in ${capitalized}.`
      },
      {
        id: 'univ_med_2',
        difficulty: 'Medium',
        prompt: `Why is boundary limit testing (e.g. at zero or infinity) valuable when examining formulas or models in ${capitalized}?`,
        options: [
          'It highlights edge-case behaviors and reveals logical or mathematical inconsistencies',
          'It permanently breaks the model',
          'It replaces the need for general equations',
          'It only works for whole numbers'
        ],
        correctIndex: 0,
        explanation: `Boundary testing tests whether formulas behave sensibly at extreme operational edges.`
      },
      {
        id: 'univ_med_3',
        difficulty: 'Medium',
        prompt: `How does conservation (of mass, energy, or information) govern systems in ${capitalized}?`,
        options: [
          'It provides balance equations: input minus output equals accumulation',
          'It allows energy to appear spontaneously',
          'It only applies in static states',
          'It renders calculations obsolete'
        ],
        correctIndex: 0,
        explanation: `Conservation laws set the boundary constraints for all equilibrium analysis in ${capitalized}.`
      },
      {
        id: 'univ_med_4',
        difficulty: 'Medium',
        prompt: `What is the most reliable method for evaluating competing hypotheses in ${capitalized}?`,
        options: [
          'Comparing empirical predictive accuracy and replicable evidence',
          'Selecting the most popular theory',
          'Choosing the explanation with the most jargon',
          'Relying on tradition alone'
        ],
        correctIndex: 0,
        explanation: `Empirical evidence and reproducibility form the cornerstone of rigorous inquiry.`
      },
      {
        id: 'univ_med_5',
        difficulty: 'Medium',
        prompt: `What is a confounding variable in the context of analyzing ${capitalized}?`,
        options: [
          'An extraneous factor that correlates with both the independent and dependent variables, skewing conclusions',
          'The main measurement device',
          'The constant of proportionality',
          'A guaranteed outcome'
        ],
        correctIndex: 0,
        explanation: `Confounders distort observed relationships by introducing hidden outside correlations.`
      },
      // 5 Hard
      {
        id: 'univ_hard_1',
        difficulty: 'Hard',
        prompt: `In complex multi-variable analysis of ${capitalized}, what does non-linear feedback imply?`,
        options: [
          'Output responses are non-proportional, and small perturbations can cascade into large system changes',
          'Outputs are always strictly linear and predictable',
          'The system remains entirely static',
          'All feedback loops cancel out automatically'
        ],
        correctIndex: 0,
        explanation: `Non-linear feedback creates dynamic tipping points and sensitivity to initial parameters.`
      },
      {
        id: 'univ_hard_2',
        difficulty: 'Hard',
        prompt: `How does sensitivity analysis enhance conclusions drawn in ${capitalized}?`,
        options: [
          'It identifies which model parameters have the greatest influence on outcomes and where measurement precision matters most',
          'It eliminates all uncertainty completely',
          'It replaces physical testing with conjecture',
          'It guarantees a single immutable truth'
        ],
        correctIndex: 0,
        explanation: `Sensitivity analysis pinpoints high-leverage variables that dominate system behavior.`
      },
      {
        id: 'univ_hard_3',
        difficulty: 'Hard',
        prompt: `What distinguishes deductive reasoning from inductive reasoning when formulating theories in ${capitalized}?`,
        options: [
          'Deductive moves from established general axioms to specific conclusions; inductive derives general principles from observed sample data',
          'Inductive is 100% mathematically proven while deductive is always an estimate',
          'Deductive only applies to humanities',
          'They are synonyms'
        ],
        correctIndex: 0,
        explanation: `Deductive reasoning proves specific conclusions from axioms; induction generalizes patterns from data.`
      },
      {
        id: 'univ_hard_4',
        difficulty: 'Hard',
        prompt: `When evaluating an asymptotic limit in ${capitalized}, what is being described?`,
        options: [
          'The stable state or value approached as a variable grows arbitrarily large',
          'An immediate measurement at time t = 0',
          'A numerical error in calculation',
          'A random noise fluctuation'
        ],
        correctIndex: 0,
        explanation: `Asymptotes define long-term boundary behaviors of functions as inputs approach infinity or singularities.`
      },
      {
        id: 'univ_hard_5',
        difficulty: 'Hard',
        prompt: `According to Occam's Razor in theoretical frameworks for ${capitalized}, which hypothesis should be preferred?`,
        options: [
          'Among competing hypotheses that predict observations equally well, the one requiring the fewest assumptions',
          'The hypothesis with the most complex variables and layers',
          'The hypothesis proposed most recently',
          'The one with circular logic'
        ],
        correctIndex: 0,
        explanation: `Parsimony dictates that simpler models with fewer unproven assumptions are superior when predictive accuracy is equal.`
      }
    ];
  }

  // Tiered 15-question challenge
  if (tiered && questionCount >= 15) {
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 5);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 5);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 5);
    return shuffleOptions([...low, ...med, ...hard]);
  }

  // 5 Questions: 2 Low, 2 Med, 1 Hard
  if (questionCount === 5) {
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 2);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 2);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 1);
    return shuffleOptions([...low, ...med, ...hard]);
  }

  // 10 Questions: 4 Low, 4 Med, 2 Hard
  if (questionCount === 10) {
    const low = pool.filter(q => q.difficulty === 'Low').slice(0, 4);
    const med = pool.filter(q => q.difficulty === 'Medium').slice(0, 4);
    const hard = pool.filter(q => q.difficulty === 'Hard').slice(0, 2);
    return shuffleOptions([...low, ...med, ...hard]);
  }

  return shuffleOptions(pool.slice(0, questionCount));
}

export function generateTopicFlashcards(topic: string): Flashcard[] {
  const t = topic.trim().toLowerCase();

  // C Programming
  if (isCProgramming(t)) {
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

  // Python
  if (isPython(t)) {
    return [
      {
        id: 'fc1',
        front: 'Python List Comprehension',
        back: '[expression for item in iterable if condition]\nExample: [x**2 for x in range(5) if x % 2 == 0] -> [0, 4, 16]',
        category: 'Python'
      },
      {
        id: 'fc2',
        front: 'List vs Tuple in Python',
        back: '• List: Mutable, defined with []\n• Tuple: Immutable, defined with ()\nTuples protect data integrity and have less memory overhead.',
        category: 'Python Data Structures'
      },
      {
        id: 'fc3',
        front: 'Dictionary Key Lookup: dict.get()',
        back: 'dict.get(key, default) safely looks up a key without throwing a KeyError if the key is missing.',
        category: 'Python'
      },
      {
        id: 'fc4',
        front: 'Python *args and **kwargs',
        back: '• *args: passes variable number of positional arguments as a tuple\n• **kwargs: passes variable keyword arguments as a dictionary',
        category: 'Python Functions'
      }
    ];
  }

  // Science & Photosynthesis
  if (isBiology(t)) {
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
  if (isMathematics(t)) {
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

  // Physics
  if (isPhysics(t)) {
    return [
      {
        id: 'fc1',
        front: "Newton's 3 Laws of Motion",
        back: '1. Inertia: Objects stay at rest or constant velocity unless acted on by net force.\n2. F = ma: Acceleration is proportional to net force.\n3. Action-Reaction: Forces exist in equal and opposite pairs.',
        category: 'Physics'
      },
      {
        id: 'fc2',
        front: 'Kinetic Energy vs Potential Energy',
        back: '• Kinetic: KE = ½ mv² (energy of motion)\n• Gravitational Potential: PE = mgh (energy of position)\nTotal mechanical energy is conserved in absence of friction.',
        category: 'Physics'
      },
      {
        id: 'fc3',
        front: 'Weight vs Mass',
        back: '• Mass (kg): Amount of matter (constant everywhere).\n• Weight (N): Gravitational force on that mass (W = mg).',
        category: 'Physics'
      },
      {
        id: 'fc4',
        front: 'Conservation of Momentum',
        back: 'In any closed system with no external net forces, total linear momentum before collision equals total momentum after.',
        category: 'Physics'
      }
    ];
  }

  // Chemistry
  if (isChemistry(t)) {
    return [
      {
        id: 'fc1',
        front: 'Covalent vs Ionic Bonds',
        back: '• Covalent: Nonmetals sharing valence electron pairs.\n• Ionic: Metal transfers electron(s) to nonmetal, forming electrostatic ions (e.g. Na⁺Cl⁻).',
        category: 'Chemistry'
      },
      {
        id: 'fc2',
        front: 'pH Scale & Acidity',
        back: 'pH = -log[H⁺]\n• pH < 7: Acidic (excess H⁺ / H₃O⁺)\n• pH = 7: Neutral\n• pH > 7: Basic / Alkaline (excess OH⁻)',
        category: 'Chemistry'
      },
      {
        id: 'fc3',
        front: 'Oxidation vs Reduction (OIL RIG)',
        back: '• Oxidation Is Loss of electrons.\n• Reduction Is Gain of electrons.',
        category: 'Chemistry'
      },
      {
        id: 'fc4',
        front: 'Le Chatelier\'s Principle',
        back: 'If a chemical system at equilibrium experiences a change in concentration, temperature, or pressure, the equilibrium shifts to counteract that change.',
        category: 'Chemistry'
      }
    ];
  }

  // History
  if (isHistory(t)) {
    return [
      {
        id: 'fc1',
        front: 'The Three Estates in 1789 France',
        back: '• 1st Estate: Clergy (tax-exempt)\n• 2nd Estate: Nobility (tax-exempt)\n• 3rd Estate: Commoners, peasants & bourgeoisie (98% of population, bore all taxes)',
        category: 'History'
      },
      {
        id: 'fc2',
        front: 'Storming of the Bastille',
        back: 'July 14, 1789: Parisian revolutionaries stormed the medieval fortress/prison, symbolizing the overthrow of royal despotism.',
        category: 'History'
      },
      {
        id: 'fc3',
        front: 'Causes of WWI (M-A-I-N)',
        back: '• Militarism\n• Alliances\n• Imperialism\n• Nationalism\nSparked by the assassination of Archduke Franz Ferdinand.',
        category: 'History'
      },
      {
        id: 'fc4',
        front: 'Declaration of the Rights of Man (1789)',
        back: 'Fundamental charter of human liberties proclaiming that "men are born and remain free and equal in rights".',
        category: 'History'
      }
    ];
  }

  // Default Flashcards for any custom topic
  const capitalized = topic.charAt(0).toUpperCase() + topic.slice(1);
  return [
    {
      id: 'fc1',
      front: `Core Principle of ${capitalized}`,
      back: `The fundamental law, theorem, or rule governing how ${capitalized} functions under standard conditions.`,
      category: capitalized
    },
    {
      id: 'fc2',
      front: `Common Misconception in ${capitalized}`,
      back: 'Confusing symptoms with root causes, or assuming simplified boundary conditions apply unconditionally.',
      category: capitalized
    },
    {
      id: 'fc3',
      front: `Verification Method for ${capitalized}`,
      back: 'Back-substitute test values into initial boundary conditions and verify dimensional consistency.',
      category: capitalized
    },
    {
      id: 'fc4',
      front: `Exam Quick-Tip for ${capitalized}`,
      back: 'Carefully annotate known variables, target outcomes, and unit constraints before calculating.',
      category: capitalized
    }
  ];
}
