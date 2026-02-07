export const questionBank = {
    react: [
      {
        question: "What is the primary purpose of React's Virtual DOM?",
        options: ["To directly manipulate the browser DOM", "To optimize rendering performance", "To manage database connections", "To handle HTTP requests"],
        correctAnswer: "To optimize rendering performance"
      },
      {
        question: "Which hook is used to manage state in a functional component?",
        options: ["useEffect", "useContext", "useState", "useReducer"],
        correctAnswer: "useState"
      },
      {
        question: "What is JSX?",
        options: ["A database query language", "A syntax extension for JavaScript", "A CSS preprocessor", "A build tool"],
        correctAnswer: "A syntax extension for JavaScript"
      },
      {
        question: "How do you pass data from a parent to a child component?",
        options: ["State", "Props", "Context", "Redux"],
        correctAnswer: "Props"
      },
      {
        question: "What is the useEffect hook used for?",
        options: ["State management", "Routing", "Side effects", "Form validation"],
        correctAnswer: "Side effects"
      }
    ],
    javascript: [
      {
        question: "Which of the following is NOT a primitive type in JavaScript?",
        options: ["String", "Number", "Object", "Boolean"],
        correctAnswer: "Object"
      },
      {
        question: "What is the result of '2' + 2 in JavaScript?",
        options: ["4", "22", "NaN", "Error"],
        correctAnswer: "22"
      },
      {
        question: "Which keyword is used to declare a block-scoped variable?",
        options: ["var", "let", "global", "scope"],
        correctAnswer: "let"
      },
      {
        question: "What does JSON stand for?",
        options: ["JavaScript Object Notation", "Java Syntax On Node", "JavaScript Online Network", "Java Standard Output Node"],
        correctAnswer: "JavaScript Object Notation"
      },
      {
        question: "What is a closure?",
        options: ["A function that throws an error", "A function bundled with its lexical environment", "A method to close a window", "A type of loop"],
        correctAnswer: "A function bundled with its lexical environment"
      }
    ],
    python: [
        {
            question: "What is the correct file extension for Python files?",
            options: [".py", ".pt", ".pyt", ".python"],
            correctAnswer: ".py"
        },
        {
            question: "Which keyword is used to define a function in Python?",
            options: ["func", "def", "function", "define"],
            correctAnswer: "def"
        },
        {
            question: "How do you create a list in Python?",
            options: ["{}", "[]", "()", "<>"],
            correctAnswer: "[]"
        },
        {
            question: "What is a tuple in Python?",
            options: ["A mutable list", "An immutable list", "A dictionary", "A set"],
            correctAnswer: "An immutable list"
        },
        {
            question: "Which library is commonly used for data analysis?",
            options: ["Django", "Flask", "Pandas", "PyGame"],
            correctAnswer: "Pandas"
        }
    ],
    node: [
        {
            question: "What is Node.js?",
            options: ["A frontend framework", "A JavaScript runtime built on Chrome's V8 engine", "A database", "A browser"],
            correctAnswer: "A JavaScript runtime built on Chrome's V8 engine"
        },
        {
            question: "Which module is used to handle file system operations?",
            options: ["fs", "http", "path", "os"],
            correctAnswer: "fs"
        },
        {
            question: "What is npm?",
            options: ["Node Process Manager", "New Project Maker", "Node Package Manager", "Network Protocol Manager"],
            correctAnswer: "Node Package Manager"
        }
    ],
    general: [
      {
        question: "Which data structure uses LIFO (Last In First Out)?",
        options: ["Queue", "Array", "Stack", "Linked List"],
        correctAnswer: "Stack"
      },
      {
        question: "What does HTTP stand for?",
        options: ["HyperText Transfer Protocol", "High Transfer Text Protocol", "HyperText Transmission Process", "Hyperlink Text Technology Protocol"],
        correctAnswer: "HyperText Transfer Protocol"
      },
      {
        question: "What is 1010 in binary equal to in decimal?",
        options: ["8", "10", "12", "5"],
        correctAnswer: "10"
      },
      {
        question: "Which of these is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
        correctAnswer: "MongoDB"
      },
      {
        question: "What is the complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        correctAnswer: "O(log n)"
      }
    ]
  };
  
  export const getAllQuestions = () => {
      // Helper to return flat list if needed
      return Object.values(questionBank).flat();
  };
