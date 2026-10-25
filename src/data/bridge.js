const lesson = (text, link) => ({ text, link })

export const BRIDGE = {
  React: {
    prereq: ['JavaScript', 'HTML', 'CSS'],
    time: '2 to 3 hours',
    learn: lesson('Complete the React beginner tutorial and try each example.', 'https://react.dev/learn'),
    build: 'Build a small job-tracker app where you can add, complete and delete applications.',
    demo: 'Publish the project on GitHub with a README explaining how to run it.',
  },
  TypeScript: {
    prereq: ['JavaScript'],
    time: '2 hours',
    learn: lesson('Read the TypeScript handbook and practise adding types to JavaScript.', 'https://www.typescriptlang.org/docs/'),
    build: 'Convert part of your React job-tracker to TypeScript and type its props and state.',
    demo: 'Push the TypeScript version to GitHub and describe what types you added.',
  },
  GitHub: {
    time: '1 hour',
    learn: lesson('Follow the GitHub Hello World guide to create a repository and make a commit.', 'https://docs.github.com/en/get-started/start-your-journey/hello-world'),
    build: 'Create a repository for a project and make five small commits as you improve it.',
    demo: 'Share the repository link and add a README describing your work.',
  },
  JavaScript: {
    time: '1 hour',
    learn: lesson('Work through the first chapters of the modern JavaScript tutorial.', 'https://javascript.info'),
    build: 'Make a tip calculator that accepts an amount and tip percentage.',
    demo: 'Put it on GitHub and share the repository link.',
  },
  HTML: {
    time: '1 hour',
    learn: lesson('Follow the MDN beginner learning path.', 'https://developer.mozilla.org/en-US/docs/Learn'),
    build: 'Build a one-page website about yourself using semantic HTML.',
    demo: 'Share a screenshot or a link to your published page.',
  },
  CSS: {
    time: '1 hour',
    learn: lesson('Follow the MDN CSS styling basics guide.', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics'),
    build: 'Style your page with a colour scheme and a mobile-friendly layout.',
    demo: 'Share before-and-after screenshots or a link to your page.',
  },
  Excel: {
    time: '30 min',
    build: 'Make a monthly budget sheet with totals and one chart.',
    demo: 'Share the file or a screenshot of the sheet.',
  },
  Communication: {
    time: '20 min',
    build: 'Record a 30-second introduction and practise speaking clearly.',
    demo: 'Ask someone you trust for feedback and note what you would improve.',
  },
  'Computer basics': {
    time: '30 min',
    build: 'Write a one-page document, save it as a PDF and email it to yourself.',
    demo: 'Describe the steps you took or share a screenshot.',
  },
  Teamwork: {
    time: '30 min',
    build: 'Plan a small task with two friends, split the jobs and finish it together.',
    demo: 'Write two sentences about what you contributed and what went well.',
  },
  'Problem solving': {
    time: '30 min',
    build: 'Find a small problem at home or school, list three possible fixes and try one.',
    demo: 'Write what you tried and what happened.',
  },
  'Social media': {
    time: '30 min',
    build: 'Draft three posts for a local business, with one image idea for each.',
    demo: 'Share the drafts or a screenshot.',
  },
  Writing: {
    time: '20 min',
    build: 'Write a 100-word description of something you own.',
    demo: 'Ask someone to proofread it and note one change you made.',
  },
  Creativity: {
    time: '40 min',
    build: 'Design a poster for a local event using a free design tool.',
    demo: 'Share the image or a link.',
  },
  'Customer care': {
    time: '20 min',
    build: 'Write a calm and helpful reply to an unhappy customer message.',
    demo: 'Share your reply and explain what makes it helpful.',
  },
}

export const bridgeFor = (skill) => ({
  time: '30 min',
  learn: lesson('Find a short free beginner lesson, then try the exercise below.'),
  build: `Make one small practical piece of work that uses ${skill}.`,
  demo: 'Show it to a friend, teacher or mentor and note their feedback.',
  ...BRIDGE[skill],
})
