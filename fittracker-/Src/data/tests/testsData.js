export const TESTS_DATA = [
  {
    id: "test_1",
    title: "Foundation Evaluation",
    quizzes: [
      { id: "t1_q1", question: "When you feel unmotivated to complete your daily routine, what is the best immediate response?", options: ["Skip it and rest", "Do a modified, easier version", "Perform the routine perfectly anyway", "Wait until motivation returns"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t1_q2", question: "If all Zords are Fords, and some Fords are Gords, which of the following must be true?", options: ["All Zords are Gords", "Some Zords are Gords", "Some Gords are Fords", "No Zords are Gords"], correctOptionIndex: 2, statType: "iq" },
      { id: "t1_q3", question: "Which of the following exercises primarily targets the posterior chain?", options: ["Bench Press", "Front Squat", "Romanian Deadlift", "Overhead Press"], correctOptionIndex: 2, statType: "strength" },
      { id: "t1_q4", question: "You meet someone new at a gym. How do you appropriately initiate a conversation?", options: ["Critique their form", "Ask to work in and introduce yourself casually", "Stare until they say hi", "Interrupt their heavy set"], correctOptionIndex: 1, statType: "social" },
      { id: "t1_q5", question: "What is 'active listening'?", options: ["Listening while running", "Hearing words but planning your reply", "Fully focusing, understanding, and responding to the speaker", "Interrupting to show engagement"], correctOptionIndex: 2, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_2",
    title: "Habit Dynamics",
    quizzes: [
      { id: "t2_q1", question: "According to habit formation theory, what are the three components of a habit loop?", options: ["Cue, Craving, Reward", "Cue, Routine, Reward", "Thought, Action, Habit", "Start, Process, End"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t2_q2", question: "What comes next in the sequence: 2, 6, 12, 20, 30, ...?", options: ["40", "42", "45", "50"], correctOptionIndex: 1, statType: "iq" },
      { id: "t2_q3", question: "What is progressive overload?", options: ["Doing an exercise very fast", "Gradually increasing weight, frequency, or number of repetitions", "Feeling extremely exhausted after a workout", "Stretching further every day"], correctOptionIndex: 1, statType: "strength" },
      { id: "t2_q4", question: "A friend keeps cancelling plans at the last minute. What is the most constructive approach?", options: ["Block their number", "Post about it online", "Calmly explain how it makes you feel when they cancel", "Stop making plans without saying anything"], correctOptionIndex: 2, statType: "social" },
      { id: "t2_q5", question: "What does the term 'Emotional Intelligence' (EQ) refer to?", options: ["How smart you are at math", "The ability to perceive, control, and evaluate emotions", "Knowing many psychological facts", "Always being happy"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_3",
    title: "System Focus",
    quizzes: [
      { id: "t3_q1", question: "Why are systems considered more effective than goals?", options: ["Goals are too easy", "Systems focus on the daily process rather than just the destination", "Goals don't matter at all", "Systems guarantee winning a lottery"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t3_q2", question: "If a shirt costs $20 after a 20% discount, what was its original price?", options: ["$24", "$16", "$25", "$30"], correctOptionIndex: 2, statType: "iq" },
      { id: "t3_q3", question: "Which macronutrient is primarily responsible for muscle repair and growth?", options: ["Carbohydrates", "Fats", "Protein", "Vitamins"], correctOptionIndex: 2, statType: "strength" },
      { id: "t3_q4", question: "At a networking event, you realize you've been dominating the conversation. What should you do?", options: ["Keep talking", "Leave the group", "Turn the topic to someone else by asking an open-ended question", "Apologize profusely for 5 minutes"], correctOptionIndex: 2, statType: "social" },
      { id: "t3_q5", question: "What is 'mirroring' in social psychology?", options: ["Looking in a mirror while talking", "Subconsciously replicating another person's nonverbal signals", "Wearing identical clothing", "Repeating everything someone says exactly"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_4",
    title: "Resilience & Logic",
    quizzes: [
      { id: "t4_q1", question: "When facing a major setback, what is a disciplined mindset?", options: ["Give up on the project completely", "Assume the universe is against you", "Analyze the failure for lessons and adjust your approach", "Ignore the failure entirely"], correctOptionIndex: 2, statType: "discipline" },
      { id: "t4_q2", question: "Book is to Reading as Fork is to...", options: ["Kitchen", "Eating", "Steak", "Spoon"], correctOptionIndex: 1, statType: "iq" },
      { id: "t4_q3", question: "What is concentric muscle contraction?", options: ["Muscle lengthens under tension", "Muscle shortens under tension", "Muscle stays the same length", "Muscle relaxes completely"], correctOptionIndex: 1, statType: "strength" },
      { id: "t4_q4", question: "You vehemently disagree with a colleague's idea in a meeting. How do you respond?", options: ["Yell that it's a terrible idea", "Acknowledge their points before explaining your alternative respectfully", "Stay quiet and sabotage the idea later", "Laugh mockingly"], correctOptionIndex: 1, statType: "social" },
      { id: "t4_q5", question: "What does maintaining comfortable 'eye contact' generally indicate in Western culture?", options: ["Aggression", "Boredom", "Confidence and attentiveness", "Confusion"], correctOptionIndex: 2, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_5",
    title: "Energy Management",
    quizzes: [
      { id: "t5_q1", question: "Which strategy helps overcome choice paralysis and decision fatigue?", options: ["Making decisions randomly", "Limiting daily trivial choices (like outfits or basic meals)", "Consulting 10 people for every decision", "Waiting until the last minute"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t5_q2", question: "Which number does not belong: 2, 3, 5, 7, 9, 11?", options: ["2", "5", "9", "11"], correctOptionIndex: 2, statType: "iq" },
      { id: "t5_q3", question: "In weightlifting, what does '1RM' stand for?", options: ["One Rest Minute", "One Repetition Maximum", "One Round Minimum", "One Range Motion"], correctOptionIndex: 1, statType: "strength" },
      { id: "t5_q4", question: "Someone gives you harsh but accurate constructive feedback. How do you handle it?", options: ["Get defensive", "Thank them and ask for actionable advice on improving", "Insult them back", "Ignore the feedback entirely"], correctOptionIndex: 1, statType: "social" },
      { id: "t5_q5", question: "What is the 'Halo Effect'?", options: ["A lighting phenomenon", "Assuming someone possesses all positive traits because of one positive trait", "Being extremely heroic", "A type of meditation"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_6",
    title: "Routine Mechanics",
    quizzes: [
      { id: "t6_q1", question: "What is the 'Two-Minute Rule' for building habits?", options: ["Only do tasks that take 2 minutes", "Scale down a new habit so it takes less than 2 minutes to do", "Wait 2 minutes before acting", "Meditate for 2 minutes"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t6_q2", question: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?", options: ["10 cents", "5 cents", "1 cent", "15 cents"], correctOptionIndex: 1, statType: "iq" },
      { id: "t6_q3", question: "Which of these is a compound exercise?", options: ["Bicep Curl", "Tricep Extension", "Squat", "Leg Extension"], correctOptionIndex: 2, statType: "strength" },
      { id: "t6_q4", question: "A friend tells you they had a terrible day. What is an empathetic response?", options: ["At least you didn't break your leg", "That sounds really hard, do you want to talk about it?", "I had a worse day", "Just be positive"], correctOptionIndex: 1, statType: "social" },
      { id: "t6_q5", question: "The bystander effect states that individuals are less likely to offer help to a victim when...", options: ["Other people are present", "They are alone", "It is dark outside", "They know the victim"], correctOptionIndex: 0, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_7",
    title: "Structural Growth",
    quizzes: [
      { id: "t7_q1", question: "When trying to break a bad habit, it is most effective to...", options: ["Rely purely on willpower", "Remove the cue from your environment", "Reward yourself for doing it", "Shame yourself"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t7_q2", question: "Unscramble the word: P A R I S. It is a...", options: ["Animal", "City", "River", "Country"], correctOptionIndex: 1, statType: "iq" },
      { id: "t7_q3", question: "What role does sleep play in muscle building?", options: ["It prevents fat loss", "It's when the body releases growth hormone and repairs muscle fibers", "It breaks down muscle tissue", "It replaces the need for protein"], correctOptionIndex: 1, statType: "strength" },
      { id: "t7_q4", question: "You forgot a close acquaintance's name at a party. The best approach is:", options: ["Avoid them all night", "Call them 'Buddy' or 'Mate'", "Politely apologize and ask for their name again", "Guess random names"], correctOptionIndex: 2, statType: "social" },
      { id: "t7_q5", question: "What is 'groupthink'?", options: ["A very smart group of people", "The practice of thinking or making decisions as a group in a way that discourages creativity or individual responsibility", "Meditation together", "A social network"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_8",
    title: "Mental Fortitude",
    quizzes: [
      { id: "t8_q1", question: "What is 'delayed gratification'?", options: ["Being late to a party", "Choosing to forgo an immediate reward to receive a more valuable reward later", "Getting exactly what you want now", "A type of financial debt"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t8_q2", question: "Some months have 30 days, some have 31. How many have 28?", options: ["1", "2", "6", "12"], correctOptionIndex: 3, statType: "iq" },
      { id: "t8_q3", question: "What is hypertrophy?", options: ["Muscle shrinkage", "High blood pressure", "The enlargement of muscle fibers", "Extreme stretching"], correctOptionIndex: 2, statType: "strength" },
      { id: "t8_q4", question: "In conversation, someone reveals sensitive personal information. You should...", options: ["Tell everyone else", "Change the subject immediately", "Listen quietly and keep the confidence", "Give them unsolicited medical advice"], correctOptionIndex: 2, statType: "social" },
      { id: "t8_q5", question: "What does the 'Pratfall Effect' suggest about human behavior?", options: ["People fall over a lot", "Highly competent people become more likable after making a small mistake", "Perfection is the only way to be liked", "Loudness equals dominance"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_9",
    title: "Optimized Input",
    quizzes: [
      { id: "t9_q1", question: "What does 'Eat the Frog' mean in productivity terms?", options: ["Doing the hardest task first thing in the morning", "A French diet", "Working out twice a day", "Ignoring unpleasant tasks"], correctOptionIndex: 0, statType: "discipline" },
      { id: "t9_q2", question: "If 3 cats catch 3 bunnies in 3 minutes, how long will it take 100 cats to catch 100 bunnies?", options: ["1 minute", "3 minutes", "100 minutes", "300 minutes"], correctOptionIndex: 1, statType: "iq" },
      { id: "t9_q3", question: "Which of the following describes isometric exercise?", options: ["Muscle length does not change significantly during tension", "Jumping rapidly", "Heavy barbell squats", "Running at a steady pace"], correctOptionIndex: 0, statType: "strength" },
      { id: "t9_q4", question: "How do you politely decline an invitation you don't want to attend?", options: ["Say yes but don't show up", "Express appreciation for the invite, but firmly state you're unable to attend", "Write a long excuse about being busy", "Ignore the message"], correctOptionIndex: 1, statType: "social" },
      { id: "t9_q5", question: "Body language accounts for approximately what percentage of communication?", options: ["7%", "25%", "55%", "99%"], correctOptionIndex: 2, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_10",
    title: "Adaptability Check",
    quizzes: [
      { id: "t10_q1", question: "You miss 3 days of your workout routine. The most disciplined response is:", options: ["Wait until next Monday to start again", "Accept that you failed and skip the month", "Resume your routine today as if nothing happened", "Do 3 workouts in one day to catch up"], correctOptionIndex: 2, statType: "discipline" },
      { id: "t10_q2", question: "Divide 30 by half and add 10. What do you get?", options: ["25", "40", "70", "15"], correctOptionIndex: 2, statType: "iq" },
      { id: "t10_q3", question: "What is the primary function of the core muscles?", options: ["To look good at the beach", "Spinal stabilization and force transfer", "To digest food", "To make breathing easier"], correctOptionIndex: 1, statType: "strength" },
      { id: "t10_q4", question: "A coworker takes credit for your work in a meeting. What is a professional response?", options: ["Scream at them", "Clarify your exact contributions politely during the meeting or immediately after", "Do nothing", "Quit your job"], correctOptionIndex: 1, statType: "social" },
      { id: "t10_q5", question: "What is cognitive dissonance?", options: ["Mental discomfort experienced by holding two contradictory beliefs", "A brain injury", "Loss of memory", "Being bad at math"], correctOptionIndex: 0, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_11",
    title: "Strategic Execution",
    quizzes: [
      { id: "t11_q1", question: "What is the Pomodoro Technique?", options: ["A tomato soup recipe", "Working for 25 minutes, then resting for 5", "Sleeping 8 hours straight", "Doing multiple chores at once"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t11_q2", question: "Which word does not belong with the others?", options: ["Apple", "Orange", "Banana", "Carrot"], correctOptionIndex: 3, statType: "iq" },
      { id: "t11_q3", question: "When weight training, 'Volume' refers to:", options: ["How loud the gym music is", "Total sets x reps x weight lifted", "The size of your muscles", "How fast you finish"], correctOptionIndex: 1, statType: "strength" },
      { id: "t11_q4", question: "When someone is giving you a compliment, the best response is:", options: ["Deny it", "Say 'I know'", "Say 'Thank you'", "Point out a flaw in yourself"], correctOptionIndex: 2, statType: "social" },
      { id: "t11_q5", question: "The 'Illusion of Transparency' refers to the tendency to...", options: ["See through glass clearly", "Overestimate how much others know about our internal mental states", "Lie seamlessly", "Believe everyone is watching you"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_12",
    title: "Endurance & Logic",
    quizzes: [
      { id: "t12_q1", question: "To ensure long-term consistency in a new demanding habit, you should focus on:", options: ["Motivation", "Identity change", "Punishment", "Relying on friends"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t12_q2", question: "In a race, you overtake the person in second place. What place are you in now?", options: ["First", "Second", "Third", "Last"], correctOptionIndex: 1, statType: "iq" },
      { id: "t12_q3", question: "DOMS stands for:", options: ["Daily Overload Muscle Strength", "Delayed Onset Muscle Soreness", "Direct Outward Muscle Stretch", "Deadlift Overhead Military Squat"], correctOptionIndex: 1, statType: "strength" },
      { id: "t12_q4", question: "During a dispute, saying 'I feel unheard when...' instead of 'You never listen...' is an example of:", options: ["Using 'I' statements to avoid sounding accusatory", "Being passive aggressive", "Being weak", "Gaslighting"], correctOptionIndex: 0, statType: "social" },
      { id: "t12_q5", question: "What is 'Proximity Principle' in relationships?", options: ["People form relationships with those physically closest to them", "Sitting too close is rude", "Never texting, only meeting", "Standing far away to look cool"], correctOptionIndex: 0, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_13",
    title: "Mastery Assessment",
    quizzes: [
      { id: "t13_q1", question: "How does 'habit stacking' work?", options: ["Doing everything at the exact same time", "Linking a new behavior to an already existing daily habit", "Stacking weights", "Ignoring bad habits"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t13_q2", question: "What has keys but can't open locks?", options: ["A map", "A piano", "A skeleton", "A puzzle"], correctOptionIndex: 1, statType: "iq" },
      { id: "t13_q3", question: "Which energy system primarily fuels a 100-meter sprint?", options: ["Aerobic system", "ATP-PC (Phosphagen) system", "Oxidative system", "Digestive system"], correctOptionIndex: 1, statType: "strength" },
      { id: "t13_q4", question: "To show authentic interest in another person's story, you can...", options: ["Look at your watch", "Interrupt and tell a cooler story", "Ask follow-up questions", "Nod mechanically"], correctOptionIndex: 2, statType: "social" },
      { id: "t13_q5", question: "The concept that people rise to the level of expectations set for them is known as:", options: ["The Peter Principle", "The Pygmalion Effect", "The Dunning-Kruger Effect", "The Placebo Effect"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_14",
    title: "Mind & Body Connection",
    quizzes: [
      { id: "t14_q1", question: "When evaluating a daily routine, 'friction' means:", options: ["Arguing with yourself", "Obstacles or steps making a habit harder to do", "The burn you feel during a workout", "Static electricity"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t14_q2", question: "It is 8:00 AM. In 50 hours, what time will it be?", options: ["8:00 AM", "10:00 AM", "12:00 PM", "8:00 PM"], correctOptionIndex: 1, statType: "iq" },
      { id: "t14_q3", question: "A calorie surplus combined with heavy lifting primarily leads to:", options: ["Weight loss", "Muscle hypertrophy", "Cardio endurance", "Flexibility"], correctOptionIndex: 1, statType: "strength" },
      { id: "t14_q4", question: "Someone invites you to speak first in a group. What is a mark of good etiquette?", options: ["Talk for the next 20 minutes", "Acknowledge them, speak concisely, and then pass the floor", "Refuse to speak entirely", "Whisper"], correctOptionIndex: 1, statType: "social" },
      { id: "t14_q5", question: "The 'Dunning-Kruger Effect' describes a cognitive bias where:", options: ["Experts think they are novices", "People with low ability overestimate their competence", "Smart people can't do sports", "Memory fades over time"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  },
  {
    id: "test_15",
    title: "Ultimate Trial",
    quizzes: [
      { id: "t15_q1", question: "The ultimate rule of discipline is consistency over:", options: ["Sleep", "Intensity", "Time", "Logic"], correctOptionIndex: 1, statType: "discipline" },
      { id: "t15_q2", question: "If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.", options: ["True", "False", "Cannot be determined", "None of the above"], correctOptionIndex: 0, statType: "iq" },
      { id: "t15_q3", question: "Doing eccentric-focused pulling movements is best for increasing strength in which exercise?", options: ["Bench Press", "Squat", "Pull-ups", "Crunches"], correctOptionIndex: 2, statType: "strength" },
      { id: "t15_q4", question: "In conflict resolution, seeking a 'win-win' scenario means:", options: ["You win twice", "Both parties compromise and find mutual benefit", "Neither party gets what they want", "You manipulate them into agreeing"], correctOptionIndex: 1, statType: "social" },
      { id: "t15_q5", question: "What is 'confirmation bias'?", options: ["Paying for a confirmed flight", "The tendency to search for, interpret, favor, and recall information that confirms prior beliefs", "Agreeing with the popular kid", "A legal status"], correctOptionIndex: 1, statType: "socialKnowledge" }
    ]
  }
];
