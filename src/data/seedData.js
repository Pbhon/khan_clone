/**
 * Starter content so the app is usable the moment you run `npm run dev`,
 * instead of opening to a completely empty dashboard. All of this lives in
 * localStorage once seeded — edit or delete any of it from the admin UI,
 * or just clear your browser storage to reset back to this.
 */

// Passwords are plaintext here because this is a local mock, not a real
// auth system. Firebase Auth (see README) handles hashing/security for you
// once you wire it in — nothing here should be treated as production-safe.
//
// MIGRATED TO FIREBASE AND FIRESTORE

// export const SEED_USERS = [
//   {
//     uid: 'user_admin_seed',
//     name: 'Alex (Admin)',
//     email: 'admin@example.com',
//     password: 'admin123',
//     role: 'admin',
//     createdAt: '2026-01-01T00:00:00.000Z',
//   },
//   {
//     uid: 'user_student_seed',
//     name: 'Sam (Student)',
//     email: 'student@example.com',
//     password: 'student123',
//     role: 'student',
//     createdAt: '2026-01-01T00:00:00.000Z',
//   },
// ];

export const SEED_COURSES = [
  {
    id: 'course_algebra',
    title: 'Algebra Foundations',
    description:
      'Start from the very beginning of algebra: what a variable actually is, how to respect order of operations, and how to solve for x with confidence.',
    subject: 'Math',
    status: 'published',
    units: [
      {
        id: 'unit_algebra_1',
        title: 'Getting Started with Variables',
        description: 'The building blocks: variables, expressions, and the order operations happen in.',
        lessons: [
          {
            id: 'lesson_variables',
            title: 'What Is a Variable?',
            quizId: 'quiz_variables',
            sections: [
              {
                heading: 'Why We Use Letters in Math',
                body: "A variable is a letter — usually x, y, or n — that stands in for a number. Sometimes that number is unknown and we're trying to find it. Sometimes it just changes depending on the situation. Either way, the letter is a placeholder, not a mystery to be afraid of.",
              },
              {
                heading: 'Reading a Variable Expression',
                body: 'In the expression 3x + 5, the 3 and 5 are constants (they never change), and x is the variable. "3x" means "3 times whatever x is." If x = 2, then 3x = 6.',
              },
              {
                heading: 'Try It Yourself',
                body: 'If x = 4, what is 2x + 1? Work it out on paper before you take the quiz below: substitute 4 in for x, then follow the order of operations.',
              },
            ],
          },
          {
            id: 'lesson_order_of_ops',
            title: 'Order of Operations',
            quizId: 'quiz_order_of_ops',
            sections: [
              {
                heading: 'Why Order Matters',
                body: "2 + 3 × 4 isn't 20 — it's 14. Multiplication happens before addition. Without an agreed-upon order, the same expression could mean different things to different people, so math uses one consistent order: Parentheses, Exponents, Multiplication/Division, Addition/Subtraction (PEMDAS).",
              },
              {
                heading: 'Working Through an Example',
                body: '(2 + 3) × 4: parentheses first, so 2 + 3 = 5, then 5 × 4 = 20. Change where the parentheses go and the answer changes completely — that\'s the whole point of having a fixed order.',
              },
            ],
          },
        ],
      },
      {
        id: 'unit_algebra_2',
        title: 'Solving Equations',
        description: 'Isolating the variable to find out what it equals.',
        lessons: [
          {
            id: 'lesson_one_step',
            title: 'One-Step Equations',
            quizId: 'quiz_one_step',
            sections: [
              {
                heading: 'The Golden Rule',
                body: 'Whatever you do to one side of an equation, you must do to the other side too. That keeps the equation balanced, like a scale.',
              },
              {
                heading: 'Example: x + 5 = 12',
                body: 'To get x alone, undo the "+ 5" by subtracting 5 from both sides: x + 5 − 5 = 12 − 5, which leaves x = 7.',
              },
            ],
          },
          {
            id: 'lesson_two_step',
            title: 'Two-Step Equations',
            quizId: null,
            sections: [
              {
                heading: 'Undoing Two Operations',
                body: 'Some equations, like 2x + 3 = 11, need two moves to solve. Undo addition/subtraction first, then multiplication/division — the reverse of PEMDAS order.',
              },
              {
                heading: 'Example: 2x + 3 = 11',
                body: 'Step 1: subtract 3 from both sides → 2x = 8. Step 2: divide both sides by 2 → x = 4.',
              },
            ],
          },
        ],
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'course_python',
    title: 'Intro to Python Programming',
    description:
      'Write your first lines of real code. This course covers variables, data types, and the control-flow basics every program is built from.',
    subject: 'Computer Science',
    status: 'published',
    units: [
      {
        id: 'unit_python_1',
        title: 'Getting Started',
        description: 'Meet the language and its basic building blocks.',
        lessons: [
          {
            id: 'lesson_what_is_python',
            title: 'What Is Python?',
            quizId: null,
            sections: [
              {
                heading: 'A Language Built for Readability',
                body: "Python is a programming language known for reading almost like plain English. It's used for everything from websites to data science to automating boring tasks — a great first language because there's very little punctuation getting in the way of the logic.",
              },
              {
                heading: 'Running Your First Line',
                body: "print('Hello, world!') is the traditional first program in any language. It tells the computer: display this text. In Python, that's the entire program — one line.",
              },
            ],
          },
          {
            id: 'lesson_variables_python',
            title: 'Variables and Data Types',
            quizId: 'quiz_python_variables',
            sections: [
              {
                heading: 'Storing Values',
                body: "A variable in Python is created the moment you assign it a value: age = 14. No special keyword needed — Python figures out the type on its own.",
              },
              {
                heading: 'The Basic Types',
                body: 'int for whole numbers (7), float for decimals (3.14), str for text (\'hello\'), and bool for True/False. You can check any variable\'s type with type(variable_name).',
              },
            ],
          },
        ],
      },
      {
        id: 'unit_python_2',
        title: 'Control Flow',
        description: 'Making decisions and repeating actions in code.',
        lessons: [
          {
            id: 'lesson_if_statements',
            title: 'If Statements',
            quizId: 'quiz_if_statements',
            sections: [
              {
                heading: 'Making Decisions',
                body: "if lets your program choose what to do based on a condition. if age >= 13:\n    print('Teenager') runs the print line only when the condition is True.",
              },
              {
                heading: 'elif and else',
                body: "elif checks another condition if the first was False. else catches everything that didn't match any condition above it. Python checks them in order, top to bottom, and stops at the first True one.",
              },
            ],
          },
          {
            id: 'lesson_loops',
            title: 'Loops',
            quizId: null,
            sections: [
              {
                heading: 'Repeating Without Repeating Yourself',
                body: "A for loop runs a block of code once for each item in a sequence: for i in range(5): print(i) prints 0 through 4, without writing print() five separate times.",
              },
              {
                heading: 'while Loops',
                body: 'A while loop keeps running as long as its condition stays True — useful when you don\'t know in advance how many times you\'ll need to repeat something.',
              },
            ],
          },
        ],
      },
    ],
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'course_history_draft',
    title: 'Ancient Civilizations',
    description: 'A survey of the earliest human civilizations and what they left behind.',
    subject: 'History',
    status: 'draft',
    units: [
      {
        id: 'unit_history_1',
        title: 'Mesopotamia',
        description: 'The land between two rivers.',
        lessons: [
          {
            id: 'lesson_fertile_crescent',
            title: 'The Fertile Crescent',
            quizId: null,
            sections: [
              {
                heading: 'Draft — still being written',
                body: 'This lesson is a work in progress. Because this course is still in draft status, students never see it in the catalog — only admins can see and edit it here.',
              },
            ],
          },
        ],
      },
    ],
    createdAt: '2026-01-03T00:00:00.000Z',
    updatedAt: '2026-01-03T00:00:00.000Z',
  },
];

export const SEED_QUIZZES = [
  {
    id: 'quiz_variables',
    lessonId: 'lesson_variables',
    courseId: 'course_algebra',
    title: 'What Is a Variable? — Quiz',
    questionsPerAttempt: 5,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q_var_1',
        prompt: 'What does a variable represent in algebra?',
        choices: [
          'A fixed number that never changes',
          'A symbol that stands for a value that can change or is unknown',
          'A type of equation',
          'The answer to every problem',
        ],
        correctIndex: 1,
        explanation:
          "A variable is a letter (like x, y, or n) that stands in for a number we don't know yet or that can change. It's a placeholder, not a fixed value.",
      },
      {
        id: 'q_var_2',
        prompt: 'In the expression 3x + 5, which part is the variable?',
        choices: ['3', 'x', '5', '+'],
        correctIndex: 1,
        explanation: 'x is the letter representing the unknown value. 3 and 5 are constants — numbers that stay fixed.',
      },
      {
        id: 'q_var_3',
        prompt: 'If x = 4, what is the value of 2x + 1?',
        choices: ['5', '6', '8', '9'],
        correctIndex: 3,
        explanation: 'Substitute 4 for x: 2(4) + 1 = 8 + 1 = 9.',
      },
      {
        id: 'q_var_4',
        prompt: 'What is the coefficient in the term 7y?',
        choices: ['y', '7', '7y', "There isn't one"],
        correctIndex: 1,
        explanation: 'The coefficient is the number multiplying the variable — here, 7 is being multiplied by y.',
      },
      {
        id: 'q_var_5',
        prompt: 'Which of these is a variable expression?',
        choices: ['12 + 8', '5 × 3', 'n − 4', '100 ÷ 10'],
        correctIndex: 2,
        explanation:
          'n − 4 contains the variable n, so its value depends on what n is. The others are all just numbers being combined.',
      },
      {
        id: 'q_var_6',
        prompt: 'If a = 2 and b = 3, what does a + b equal?',
        choices: ['1', '5', '6', '23'],
        correctIndex: 1,
        explanation: 'Substitute the values in: 2 + 3 = 5.',
      },
      {
        id: 'q_var_7',
        prompt: 'What is the term for a symbol like x or y used to represent an unknown number?',
        choices: ['Constant', 'Operator', 'Variable', 'Exponent'],
        correctIndex: 2,
        explanation: 'A variable is any symbol — usually a letter — standing in for a number that isn\'t fixed.',
      },
      {
        id: 'q_var_8',
        prompt: 'In the expression 4x, if x = 5, what is the result?',
        choices: ['9', '20', '45', '1'],
        correctIndex: 1,
        explanation: '4x means 4 multiplied by x. With x = 5, that\'s 4 × 5 = 20.',
      },
    ],
  },
  {
    id: 'quiz_order_of_ops',
    lessonId: 'lesson_order_of_ops',
    courseId: 'course_algebra',
    title: 'Order of Operations — Quiz',
    questionsPerAttempt: 4,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q_ops_1',
        prompt: 'What does PEMDAS stand for (in order)?',
        choices: [
          'Parentheses, Exponents, Multiplication/Division, Addition/Subtraction',
          'Parentheses, Equations, Multiplication, Division, Addition, Subtraction',
          'Product, Exponents, Multiply, Divide, Add, Subtract',
          'Points, Exponents, Multiply, Divide, Add, Subtract',
        ],
        correctIndex: 0,
        explanation:
          'PEMDAS is a memory aid for order: Parentheses first, then Exponents, then Multiplication/Division (left to right), then Addition/Subtraction (left to right).',
      },
      {
        id: 'q_ops_2',
        prompt: 'What is 2 + 3 × 4?',
        choices: ['20', '14', '9', '24'],
        correctIndex: 1,
        explanation: 'Multiplication happens before addition: 3 × 4 = 12, then 2 + 12 = 14.',
      },
      {
        id: 'q_ops_3',
        prompt: 'What is (2 + 3) × 4?',
        choices: ['14', '9', '20', '24'],
        correctIndex: 2,
        explanation: 'Parentheses come first: 2 + 3 = 5, then 5 × 4 = 20.',
      },
      {
        id: 'q_ops_4',
        prompt: 'What is 10 − 2 × 3?',
        choices: ['24', '4', '8', '6'],
        correctIndex: 1,
        explanation: 'Multiply first: 2 × 3 = 6, then 10 − 6 = 4.',
      },
      {
        id: 'q_ops_5',
        prompt: 'What is 8 ÷ 2 + 2?',
        choices: ['2', '6', '4', '1'],
        correctIndex: 1,
        explanation: 'Division happens before addition: 8 ÷ 2 = 4, then 4 + 2 = 6.',
      },
      {
        id: 'q_ops_6',
        prompt: 'What is 3² + 1?',
        choices: ['7', '9', '10', '16'],
        correctIndex: 2,
        explanation: 'Exponents come before addition: 3² = 9, then 9 + 1 = 10.',
      },
    ],
  },
  {
    id: 'quiz_one_step',
    lessonId: 'lesson_one_step',
    courseId: 'course_algebra',
    title: 'One-Step Equations — Quiz',
    questionsPerAttempt: 4,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q_one_1',
        prompt: 'Solve for x: x + 5 = 12',
        choices: ['x = 5', 'x = 7', 'x = 17', 'x = 6'],
        correctIndex: 1,
        explanation: 'Subtract 5 from both sides: x = 12 − 5 = 7.',
      },
      {
        id: 'q_one_2',
        prompt: 'Solve for x: x − 4 = 9',
        choices: ['x = 5', 'x = 13', 'x = 36', 'x = 4'],
        correctIndex: 1,
        explanation: 'Add 4 to both sides: x = 9 + 4 = 13.',
      },
      {
        id: 'q_one_3',
        prompt: 'Solve for x: 3x = 15',
        choices: ['x = 3', 'x = 5', 'x = 12', 'x = 45'],
        correctIndex: 1,
        explanation: 'Divide both sides by 3: x = 15 ÷ 3 = 5.',
      },
      {
        id: 'q_one_4',
        prompt: 'Solve for x: x ÷ 2 = 6',
        choices: ['x = 3', 'x = 4', 'x = 8', 'x = 12'],
        correctIndex: 3,
        explanation: 'Multiply both sides by 2: x = 6 × 2 = 12.',
      },
      {
        id: 'q_one_5',
        prompt: 'Solve for x: x + 10 = 10',
        choices: ['x = 0', 'x = 10', 'x = 20', 'x = 1'],
        correctIndex: 0,
        explanation: 'Subtract 10 from both sides: x = 10 − 10 = 0.',
      },
      {
        id: 'q_one_6',
        prompt: 'Solve for x: 5x = 0',
        choices: ['x = 5', 'x = 1', 'x = 0', 'There is no solution'],
        correctIndex: 2,
        explanation: 'Divide both sides by 5: x = 0 ÷ 5 = 0.',
      },
    ],
  },
  {
    id: 'quiz_python_variables',
    lessonId: 'lesson_variables_python',
    courseId: 'course_python',
    title: 'Variables and Data Types — Quiz',
    questionsPerAttempt: 4,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q_py_var_1',
        prompt: 'Which of these is a valid variable name in Python?',
        choices: ['2cool', 'my-variable', 'my_variable', 'class'],
        correctIndex: 2,
        explanation:
          "Variable names can include letters, numbers, and underscores, but can't start with a number, can't contain hyphens, and can't be a reserved word like 'class'. my_variable follows all the rules.",
      },
      {
        id: 'q_py_var_2',
        prompt: 'What data type is the value 3.14 in Python?',
        choices: ['int', 'float', 'str', 'bool'],
        correctIndex: 1,
        explanation: 'Numbers with a decimal point are floats. Whole numbers without one are ints.',
      },
      {
        id: 'q_py_var_3',
        prompt: "What will type('hello') return in Python?",
        choices: ["<class 'int'>", "<class 'str'>", "<class 'bool'>", "<class 'list'>"],
        correctIndex: 1,
        explanation: 'Text wrapped in quotes is a string, so Python reports its type as str.',
      },
      {
        id: 'q_py_var_4',
        prompt: 'Which line correctly assigns the value 5 to a variable named age?',
        choices: ['age == 5', '5 = age', 'age = 5', 'age := 5;'],
        correctIndex: 2,
        explanation: 'A single equals sign (=) assigns a value. == is used for comparison, not assignment.',
      },
      {
        id: 'q_py_var_5',
        prompt: 'What is the data type of True in Python?',
        choices: ['str', 'int', 'bool', 'float'],
        correctIndex: 2,
        explanation: 'True and False are boolean values, so their type is bool.',
      },
      {
        id: 'q_py_var_6',
        prompt: "x = 7, then print(type(x)) — what prints?",
        choices: ["<class 'str'>", "<class 'float'>", "<class 'int'>", "<class 'bool'>"],
        correctIndex: 2,
        explanation: '7 is a whole number with no decimal point, so Python treats it as an int.',
      },
    ],
  },
  {
    id: 'quiz_if_statements',
    lessonId: 'lesson_if_statements',
    courseId: 'course_python',
    title: 'If Statements — Quiz',
    questionsPerAttempt: 4,
    passingScorePercent: 70,
    questions: [
      {
        id: 'q_if_1',
        prompt: 'Which keyword starts a conditional statement in Python?',
        choices: ['when', 'if', 'check', 'cond'],
        correctIndex: 1,
        explanation: 'Python uses the `if` keyword to begin a conditional statement.',
      },
      {
        id: 'q_if_2',
        prompt: "What does this print?\nif 5 > 3:\n    print('yes')\nelse:\n    print('no')",
        choices: ['yes', 'no', '5', 'Nothing'],
        correctIndex: 0,
        explanation: "5 > 3 is True, so the `if` block runs, printing 'yes'.",
      },
      {
        id: 'q_if_3',
        prompt: 'Which symbol checks if two values are equal in Python?',
        choices: ['=', '==', '!=', '==='],
        correctIndex: 1,
        explanation: 'A single = assigns a value; a double == compares two values for equality.',
      },
      {
        id: 'q_if_4',
        prompt: 'Which keyword lets you check another condition if the first `if` was False?',
        choices: ['elseif', 'elif', 'orif', 'then'],
        correctIndex: 1,
        explanation: "Python uses `elif` (short for 'else if') to check another condition.",
      },
      {
        id: 'q_if_5',
        prompt: 'What does != mean in Python?',
        choices: ['Equal to', 'Not equal to', 'Greater than', 'Divide'],
        correctIndex: 1,
        explanation: '!= checks whether two values are NOT equal to each other.',
      },
      {
        id: 'q_if_6',
        prompt: 'What runs if none of the if/elif conditions are True?',
        choices: ['The elif block', 'Nothing ever runs', 'The else block, if there is one', 'Python throws an error'],
        correctIndex: 2,
        explanation: 'An `else` block, if included, runs only when every earlier condition was False.',
      },
    ],
  },
];

export const SEED_AWARDS_CATALOG = [
  {
    id: 'first_enrollment',
    name: 'First Steps',
    description: 'Enroll in your first course.',
    icon: '🎯',
    criteriaKey: 'first_enrollment',
  },
  {
    id: 'first_lesson_complete',
    name: 'Lesson Learner',
    description: 'Complete your first lesson.',
    icon: '📘',
    criteriaKey: 'first_lesson_complete',
  },
  {
    id: 'first_course_complete',
    name: 'Course Champion',
    description: 'Complete an entire course.',
    icon: '🏆',
    criteriaKey: 'first_course_complete',
  },
  {
    id: 'courses_completed_3',
    name: 'On a Roll',
    description: 'Complete 3 courses.',
    icon: '🔥',
    criteriaKey: 'courses_completed_3',
  },
  {
    id: 'quiz_perfect_score',
    name: 'Quiz Whiz',
    description: 'Score 100% on a quiz.',
    icon: '⭐',
    criteriaKey: 'quiz_perfect_score',
  },
  {
    id: 'lessons_completed_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 lessons.',
    icon: '📚',
    criteriaKey: 'lessons_completed_10',
  },
  {
    id: 'quiz_comeback',
    name: 'Comeback Kid',
    description: 'Improve your score on a quiz retake.',
    icon: '💪',
    criteriaKey: 'quiz_comeback',
  },
];
