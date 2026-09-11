import { ConceptNode, Question, SubjectId } from '../types';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  iconName: string;
  tagline: string;
  description: string;
  color: string;
}

export const SUBJECTS: SubjectInfo[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    iconName: 'Sigma',
    tagline: 'From foundational arithmetic to multi-step algebra & functions',
    description: 'Master deep conceptual thinking, equation balancing, and algebraic reasoning.',
    color: '#6366F1'
  },
  {
    id: 'physics',
    name: 'Physics & Mechanics',
    iconName: 'Atom',
    tagline: 'Understand the fundamental laws governing motion and forces',
    description: 'Explore kinematics, Newton’s laws, and energy conservation through intuitive models.',
    color: '#06B6D4'
  },
  {
    id: 'computer_science',
    name: 'Computer Science',
    iconName: 'Code',
    tagline: 'Computational thinking, algorithmic logic, and state manipulation',
    description: 'Deconstruct loops, conditional flow, and recursive problem solving with precision.',
    color: '#10B981'
  }
];

export const KNOWLEDGE_GRAPH_NODES: ConceptNode[] = [
  // ── MATHEMATICS CURRICULUM GRAPH ──
  {
    id: 'math_negative_numbers',
    subjectId: 'mathematics',
    chapter: 'Foundational Number Sense',
    name: 'Negative Numbers & Signs',
    level: 1,
    bloomLevel: 'comprehension',
    description: 'Rules for adding, subtracting, multiplying, and dividing directed numbers on a number line.',
    prerequisites: [],
    realWorldApplication: 'Tracking debt/credit, sea level depths, and thermodynamic temperature changes.',
    commonMisconceptions: [
      'Believing two negative numbers added together produce a positive result',
      'Confusing subtracting a negative with regular subtraction',
      'Forgetting that multiplying an odd count of negatives yields a negative'
    ],
    keyFormulaLatex: 'a - (-b) = a + b',
    visualMetaphor: 'A debt thermometer: taking away a cold temperature ice cube makes the room warmer.'
  },
  {
    id: 'math_order_of_operations',
    subjectId: 'mathematics',
    chapter: 'Foundational Number Sense',
    name: 'Order of Operations (PEMDAS)',
    level: 1,
    bloomLevel: 'recall',
    description: 'The strict hierarchy of operations: Parentheses, Exponents, Multiplication & Division (L-to-R), Addition & Subtraction (L-to-R).',
    prerequisites: [],
    realWorldApplication: 'Writing computer formulas, calculating financial compound interest, engineering tolerances.',
    commonMisconceptions: [
      'Assuming multiplication must always occur before division regardless of left-to-right order',
      'Computing addition before subtraction blindly rather than from left to right'
    ],
    keyFormulaLatex: '3 + 4 \\times 2 = 3 + 8 = 11',
    visualMetaphor: 'A layered recipe: you must bake the pastry before spreading the frosting.'
  },
  {
    id: 'math_variables_expressions',
    subjectId: 'mathematics',
    chapter: 'Algebra Foundations',
    name: 'Variables & Like Terms',
    level: 2,
    bloomLevel: 'comprehension',
    description: 'Using letters as placeholders for variable quantities and grouping like terms.',
    prerequisites: ['math_negative_numbers', 'math_order_of_operations'],
    realWorldApplication: 'Writing budgeting equations where costs vary with usage.',
    commonMisconceptions: [
      'Combining unlike terms (e.g. 2x + 3 = 5x)',
      'Confusing the coefficient with an exponent (2x vs x^2)',
      'Dropping negative signs attached to variable terms'
    ],
    keyFormulaLatex: '3x + 5 - x + 2 = 2x + 7',
    visualMetaphor: 'Fruit baskets: you can group apples with apples, but you cannot combine 2 apples and 3 oranges into 5 apploranges.'
  },
  {
    id: 'math_distributive_property',
    subjectId: 'mathematics',
    chapter: 'Algebra Foundations',
    name: 'Distributive Property',
    level: 2,
    bloomLevel: 'application',
    description: 'Multiplying a single term across all terms inside a grouped parenthesis: a(b + c) = ab + ac.',
    prerequisites: ['math_negative_numbers', 'math_variables_expressions'],
    realWorldApplication: 'Scaling bulk orders with packaging costs or tax computations across items.',
    commonMisconceptions: [
      'Only distributing to the first term (e.g., 2(x + 3) -> 2x + 3)',
      'Sign errors when distributing a negative coefficient: -2(x - 4) -> -2x - 8 instead of -2x + 8'
    ],
    keyFormulaLatex: 'a(b + c) = ab + ac',
    visualMetaphor: 'Handing out party favors: the host must give a favor to every guest at the table, not just the first one.'
  },
  {
    id: 'math_one_step_equations',
    subjectId: 'mathematics',
    chapter: 'Equation Solving',
    name: 'One-Step Equations',
    level: 2,
    bloomLevel: 'application',
    description: 'Using inverse operations (addition/subtraction, multiplication/division) to balance and isolate a variable.',
    prerequisites: ['math_variables_expressions'],
    realWorldApplication: 'Calculating missing change when buying groceries or measuring remaining distance.',
    commonMisconceptions: [
      'Applying the operation to only one side of the equal sign',
      'Using the same operation instead of inverse (e.g. adding 5 when 5 is already added)'
    ],
    keyFormulaLatex: 'x + 7 = 12 \\implies x = 12 - 7 = 5',
    visualMetaphor: 'A balanced seesaw: anything you remove from the left side must also be removed from the right side.'
  },
  {
    id: 'math_two_step_equations',
    subjectId: 'mathematics',
    chapter: 'Equation Solving',
    name: 'Two-Step Equations',
    level: 3,
    bloomLevel: 'application',
    description: 'Unwrapping equations with two operations in reverse order of operations (undo addition/subtraction first, then multiplication/division).',
    prerequisites: ['math_one_step_equations', 'math_negative_numbers'],
    realWorldApplication: 'Phone bill pricing: Base monthly fee plus cost per gigabyte of cellular data.',
    commonMisconceptions: [
      'Dividing the variable term before undoing the constant',
      'Forgetting to divide both terms on the right side if dividing early'
    ],
    keyFormulaLatex: '2x + 5 = 15 \\implies 2x = 10 \\implies x = 5',
    visualMetaphor: 'Unwrapping a birthday gift: you remove the outer wrapping paper (the constant) before opening the box inside (the coefficient).'
  },
  {
    id: 'math_linear_equations',
    subjectId: 'mathematics',
    chapter: 'Linear Systems',
    name: 'Multi-Step Linear Equations',
    level: 4,
    bloomLevel: 'analysis',
    description: 'Equations involving variables on both sides, parentheses, and fractional coefficients.',
    prerequisites: ['math_two_step_equations', 'math_distributive_property'],
    realWorldApplication: 'Determining break-even points where two competing subscription plans cost the exact same.',
    commonMisconceptions: [
      'Losing signs when shifting variable terms across the equality boundary',
      'Mixing up constants and variable coefficients during transpositions'
    ],
    keyFormulaLatex: '3(x - 2) = 2x + 5 \\implies 3x - 6 = 2x + 5 \\implies x = 11',
    visualMetaphor: 'Sorting warehouse crates: move all variable crates to one conveyor belt and all number weights to the other.'
  },
  {
    id: 'math_systems_equations',
    subjectId: 'mathematics',
    chapter: 'Linear Systems',
    name: 'Systems of Linear Equations',
    level: 5,
    bloomLevel: 'analysis',
    description: 'Solving multiple simultaneous linear equations using substitution or elimination.',
    prerequisites: ['math_linear_equations'],
    realWorldApplication: 'Calculating ticket sales of adult vs child tickets given total revenue and attendance.',
    commonMisconceptions: [
      'Substituting an expression into the same equation it was isolated from',
      'Failing to multiply entire rows by the scale factor during elimination'
    ],
    keyFormulaLatex: '\\begin{cases} x + y = 10 \\\\ 2x - y = 5 \\end{cases} \\implies 3x = 15 \\implies x=5, y=5',
    visualMetaphor: 'Two roads intersecting at an exact coordinate on a city street map.'
  },

  // ── PHYSICS CURRICULUM GRAPH ──
  {
    id: 'phys_vectors_scalars',
    subjectId: 'physics',
    chapter: 'Kinematics',
    name: 'Scalars vs. Vectors',
    level: 1,
    bloomLevel: 'comprehension',
    description: 'Distinction between magnitude-only quantities (speed, distance, mass) and magnitude-plus-direction quantities (velocity, displacement, force).',
    prerequisites: [],
    realWorldApplication: 'Airplane navigation requiring both airspeed and wind vector direction.',
    commonMisconceptions: [
      'Confusing distance with displacement when an object returns to start',
      'Assuming speed and velocity are interchangeable terms'
    ],
    keyFormulaLatex: '\\vec{v} = \\frac{\\Delta \\vec{x}}{\\Delta t}',
    visualMetaphor: 'An arrow on a map: the length is how fast you walk, the arrowhead shows where you walk.'
  },
  {
    id: 'phys_velocity_acceleration',
    subjectId: 'physics',
    chapter: 'Kinematics',
    name: 'Velocity & Acceleration',
    level: 2,
    bloomLevel: 'application',
    description: 'Acceleration as the rate of change of velocity over time: speeding up, slowing down, or turning.',
    prerequisites: ['phys_vectors_scalars'],
    realWorldApplication: 'Vehicle braking distances and rollercoaster safety loops.',
    commonMisconceptions: [
      'Believing zero velocity implies zero acceleration (e.g. ball at the peak of a throw)',
      'Equating negative acceleration always with slowing down (ignoring moving in negative direction)'
    ],
    keyFormulaLatex: 'a = \\frac{v_f - v_i}{t}',
    visualMetaphor: 'Stepping on the gas pedal vs stepping on the brake in a car.'
  },
  {
    id: 'phys_newtons_laws',
    subjectId: 'physics',
    chapter: 'Dynamics & Forces',
    name: 'Newton’s Second Law (F = ma)',
    level: 3,
    bloomLevel: 'analysis',
    description: 'Net force produces acceleration proportional to force and inversely proportional to mass.',
    prerequisites: ['phys_velocity_acceleration'],
    realWorldApplication: 'Rocket propulsion, car crash impact absorption, elevator cable design.',
    commonMisconceptions: [
      'Thinking force is needed to keep an object moving at constant speed',
      'Neglecting to sum all forces before setting equal to ma'
    ],
    keyFormulaLatex: '\\Sigma \\vec{F} = m \\vec{a}',
    visualMetaphor: 'Pushing a shopping cart: an empty cart accelerates rapidly; a cart loaded with lead bricks accelerates sluggishly.'
  },

  // ── COMPUTER SCIENCE CURRICULUM GRAPH ──
  {
    id: 'cs_variables_types',
    subjectId: 'computer_science',
    chapter: 'Programming Foundations',
    name: 'Variables & Data Types',
    level: 1,
    bloomLevel: 'comprehension',
    description: 'Storing data in memory: integers, floats, strings, booleans, and type conversions.',
    prerequisites: [],
    realWorldApplication: 'Keeping player scores, username profiles, and shopping cart prices in software.',
    commonMisconceptions: [
      'Confusing string concatenation with numerical addition ("3" + "4" = "34")',
      'Believing variable assignment x = x + 1 is an algebraic equation rather than an update operation'
    ],
    keyFormulaLatex: 'total = price \\times (1 + tax\\_rate)',
    visualMetaphor: 'Labeled storage boxes in a post office where you can swap out the contents.'
  },
  {
    id: 'cs_conditionals',
    subjectId: 'computer_science',
    chapter: 'Control Flow',
    name: 'Conditional Logic (if/else)',
    level: 2,
    bloomLevel: 'application',
    description: 'Branching execution paths based on boolean evaluations and logical operators (AND, OR, NOT).',
    prerequisites: ['cs_variables_types'],
    realWorldApplication: 'Authentication checks (if password matches, grant access; else lock).',
    commonMisconceptions: [
      'Confusing assignment = with equality comparison ==',
      'Assuming multiple consecutive if statements behave the same as if-elif-else ladders'
    ],
    keyFormulaLatex: 'isEligible = (age \\ge 18) \\land (hasLicense == True)',
    visualMetaphor: 'A railway track switch directing trains onto different tracks.'
  },
  {
    id: 'cs_loops_iteration',
    subjectId: 'computer_science',
    chapter: 'Control Flow',
    name: 'Loops & Iteration (for/while)',
    level: 3,
    bloomLevel: 'analysis',
    description: 'Repeating code blocks over ranges or collections until termination criteria are met.',
    prerequisites: ['cs_conditionals'],
    realWorldApplication: 'Scanning thousands of medical records, rendering frames in a video game.',
    commonMisconceptions: [
      'Off-by-one errors in loop boundaries (inclusive vs exclusive range endpoints)',
      'Accidental infinite while-loops caused by missing update statements'
    ],
    keyFormulaLatex: 'for \\; i \\in [0, n-1]: \\;\\text{process}(item[i])',
    visualMetaphor: 'An assembly line conveyor belt running until every box is inspected.'
  }
];

// Rich Diagnostic and Adaptive Question Bank
export const SAMPLE_QUESTIONS: Question[] = [
  // Linear Equations with prerequisite distractors
  {
    id: 'q_linear_01',
    conceptId: 'math_linear_equations',
    conceptName: 'Multi-Step Linear Equations',
    prompt: 'Solve for x in the following multi-step equation:',
    latexEquation: '2(x + 3) = 14',
    questionType: 'multiple_choice',
    difficulty: 'medium',
    options: ['x = 4', 'x = 5.5', 'x = 8.5', 'x = 1'],
    correctAnswer: 'x = 4',
    explanation: 'Step 1: Distribute the 2 to both x and 3, giving 2x + 6 = 14. Step 2: Subtract 6 from both sides, yielding 2x = 8. Step 3: Divide by 2, yielding x = 4.',
    prerequisiteId: 'math_distributive_property',
    hints: [
      'Remember the distributive property: multiply the 2 outside by everything inside the parentheses.',
      '2 times x is 2x, and 2 times 3 is 6. What does 2x + 6 = 14 become when you subtract 6?'
    ],
    misconceptionDistractors: [
      {
        optionValue: 'x = 5.5',
        category: 'conceptual_misunderstanding',
        diagnosticFeedback: 'You only distributed 2 to the x, writing 2x + 3 = 14, which leads to 2x = 11 and x = 5.5. You missed multiplying 2 by 3!',
        missingPrerequisiteId: 'math_distributive_property'
      },
      {
        optionValue: 'x = 8.5',
        category: 'calculation_error',
        diagnosticFeedback: 'You subtracted 3 from 14 first before dealing with the multiplier 2, violating the order of operations.',
        missingPrerequisiteId: 'math_order_of_operations'
      },
      {
        optionValue: 'x = 1',
        category: 'careless_error',
        diagnosticFeedback: 'You added 6 to 14 instead of subtracting it from 14.',
        missingPrerequisiteId: 'math_one_step_equations'
      }
    ]
  },
  // Negative numbers diagnostic question
  {
    id: 'q_neg_01',
    conceptId: 'math_negative_numbers',
    conceptName: 'Negative Numbers & Signs',
    prompt: 'Evaluate the following integer expression:',
    latexEquation: '-5 - (-8)',
    questionType: 'multiple_choice',
    difficulty: 'easy',
    options: ['3', '-13', '-3', '13'],
    correctAnswer: '3',
    explanation: 'Subtracting a negative number is equivalent to adding its opposite positive value: -5 - (-8) = -5 + 8 = 3.',
    prerequisiteId: 'math_negative_numbers',
    hints: [
      'Recall: subtracting a negative is the same as adding a positive!',
      '-5 + 8: think of being 5 meters below sea level and climbing up 8 meters.'
    ],
    misconceptionDistractors: [
      {
        optionValue: '-13',
        category: 'conceptual_misunderstanding',
        diagnosticFeedback: 'You saw two minus signs and added -5 and -8 to get -13. Subtracting a negative is adding: -5 + 8.',
        missingPrerequisiteId: 'math_negative_numbers'
      },
      {
        optionValue: '-3',
        category: 'careless_error',
        diagnosticFeedback: 'You found the difference between 8 and 5, but kept the negative sign even though +8 has the larger absolute value.',
        missingPrerequisiteId: 'math_negative_numbers'
      },
      {
        optionValue: '13',
        category: 'guessing',
        diagnosticFeedback: 'You ignored the negative signs entirely and computed 5 + 8.',
        missingPrerequisiteId: 'math_negative_numbers'
      }
    ]
  },
  // Two step equations question
  {
    id: 'q_two_step_01',
    conceptId: 'math_two_step_equations',
    conceptName: 'Two-Step Equations',
    prompt: 'Solve for y in the equation:',
    latexEquation: '3y - 7 = 11',
    questionType: 'multiple_choice',
    difficulty: 'easy',
    options: ['y = 6', 'y = 4/3', 'y = 1.33', 'y = 54'],
    correctAnswer: 'y = 6',
    explanation: 'Step 1: Add 7 to both sides: 3y = 18. Step 2: Divide both sides by 3: y = 6.',
    prerequisiteId: 'math_one_step_equations',
    hints: [
      'Undo subtraction first: what happens if you add 7 to both sides?',
      '3y = 18. Now divide both sides by 3 to find y.'
    ],
    misconceptionDistractors: [
      {
        optionValue: 'y = 4/3',
        category: 'careless_error',
        diagnosticFeedback: 'You subtracted 7 from 11 instead of adding 7 to undo the subtraction (-7). 11 + 7 = 18, not 4.',
        missingPrerequisiteId: 'math_one_step_equations'
      },
      {
        optionValue: 'y = 54',
        category: 'wrong_strategy',
        diagnosticFeedback: 'You multiplied 18 by 3 instead of dividing 18 by 3.',
        missingPrerequisiteId: 'math_one_step_equations'
      }
    ]
  },
  // Physics Newton's second law
  {
    id: 'q_phys_01',
    conceptId: 'phys_newtons_laws',
    conceptName: 'Newton’s Second Law (F = ma)',
    prompt: 'A box of mass 4 kg is pushed with a net force of 20 N on a frictionless surface. What is its acceleration?',
    latexEquation: 'F_{net} = m \\cdot a',
    questionType: 'multiple_choice',
    difficulty: 'easy',
    options: ['5 m/s²', '80 m/s²', '16 m/s²', '0.2 m/s²'],
    correctAnswer: '5 m/s²',
    explanation: 'Using F = m * a, rearrange to solve for acceleration: a = F / m = 20 N / 4 kg = 5 m/s².',
    hints: [
      'Recall Newton’s second law formula: F = m * a.',
      'To find acceleration, divide the net force by the mass.'
    ],
    misconceptionDistractors: [
      {
        optionValue: '80 m/s²',
        category: 'wrong_formula',
        diagnosticFeedback: 'You multiplied force by mass (20 * 4) instead of dividing force by mass (F/m).',
        missingPrerequisiteId: 'phys_velocity_acceleration'
      },
      {
        optionValue: '0.2 m/s²',
        category: 'calculation_error',
        diagnosticFeedback: 'You divided mass by force (4 / 20) instead of force by mass (20 / 4).',
        missingPrerequisiteId: 'phys_velocity_acceleration'
      }
    ]
  },
  // CS Conditionals
  {
    id: 'q_cs_01',
    conceptId: 'cs_conditionals',
    conceptName: 'Conditional Logic (if/else)',
    prompt: 'What will the following code output?',
    latexEquation: '\\text{score} = 85; \\quad \\mathbf{if} \\; (\\text{score} > 80) \\; \\text{print}(\\text{"Pass"})',
    questionType: 'multiple_choice',
    difficulty: 'easy',
    options: ['Pass', 'False', 'Nothing', 'Error'],
    correctAnswer: 'Pass',
    explanation: 'Since 85 is greater than 80, the condition evaluates to True, and "Pass" is printed.',
    hints: [
      'Check whether 85 > 80 is True or False.',
      'Since it is True, the code inside the block executes.'
    ]
  }
];

// Helper to find a node by ID
export function getConceptById(id: string): ConceptNode | undefined {
  return KNOWLEDGE_GRAPH_NODES.find(n => n.id === id);
}

// Prerequisite tree resolver
export function getPrerequisiteChain(conceptId: string): ConceptNode[] {
  const chain: ConceptNode[] = [];
  const visited = new Set<string>();

  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = getConceptById(id);
    if (!node) return;
    for (const prereqId of node.prerequisites) {
      traverse(prereqId);
    }
    chain.push(node);
  }

  traverse(conceptId);
  return chain;
}
