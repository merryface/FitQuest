import { adjustTargets } from './scripts/adjustTargets.js';

((d) => {
  const EXERCISES = [
    { id: 'day-pushups', defaultTarget: 30 },
    { id: 'day-squats', defaultTarget: 30 },
    { id: 'day-situps', defaultTarget: 30 },
    { id: 'day-running', defaultTarget: 1 }, // Start with 1km
  ];

  const LOCAL_STORAGE_KEY = 'questTracker';

  let data = {
    progress: {}, // Tracks current progress for each exercise
    targets: {}, // Tracks current targets for each exercise
    completedDays: 0,
    lastReset: null, // Stores the date of the last completed day
  };

  // Load data from local storage
  const loadData = () => {
    const savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};
    data = {
      progress: savedData.progress || EXERCISES.reduce((acc, { id }) => ({ ...acc, [id]: 0 }), {}),
      targets: savedData.targets || EXERCISES.reduce((acc, { id, defaultTarget }) => ({ ...acc, [id]: defaultTarget }), {}),
      completedDays: savedData.completedDays || 0,
      lastReset: savedData.lastReset || null,
    };
  
    // Adjust targets after loading data
    data.targets = adjustTargets(data.targets, data.completedDays, data.lastReset);
  
    saveData(); // Save adjusted targets to local storage
  };
  

  // Save data to local storage
  const saveData = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  // Update the UI
  const updateUI = () => {
    EXERCISES.forEach(({ id }) => {
      const currentElement = d.getElementById(`${id}-current`);
      const targetElement = d.getElementById(`${id}-target`);
      const progressBarElement = d.getElementById(`${id}-progress-bar`);

      const currentValue = data.progress[id] || 0;
      const targetValue = data.targets[id];

      // Update the progress and target display
      currentElement.innerText = id === 'day-running' ? currentValue.toFixed(1) : currentValue;
      targetElement.innerText = id === 'day-running' ? `${targetValue.toFixed(1)}km` : targetValue;

      // Update progress bar
      const progress = (currentValue / targetValue) * 100;
      progressBarElement.style.width = `${progress}%`;
      progressBarElement.style.background = currentValue >= targetValue ? 'rgb(0, 120, 0)' : 'rgb(0, 0, 190)';
    });

    // Update completed days display
    const completedDaysElement = d.getElementById('completed-days');
    completedDaysElement.innerText = data.completedDays || '0'; // Fallback to '0' if null
  };

  // Check if all tasks are completed
  const checkAllCompleted = () => {
    // Check if all tasks meet or exceed their target
    const allTasksCompleted = EXERCISES.every(({ id }) => data.progress[id] >= data.targets[id]);

    // Get today's date as a string
    const today = new Date().toDateString();

    // If all tasks are completed and today is not the last completed day, mark the day as completed
    if (allTasksCompleted && data.lastReset !== today) {
      data.completedDays = (data.completedDays || 0) + 1; // Increment completed days
      data.lastReset = today; // Update last reset date
    }

    // Save updated data and update the UI
    saveData();
    updateUI();
  };

  // Create handlers for exercise increment/decrement
  const createExerciseHandler = (id, target) => {
    const increaseBtn = d.getElementById(`${id}-increase`);
    const decreaseBtn = d.getElementById(`${id}-decrease`);
    const currentElement = d.getElementById(`${id}-current`);

    let intervalId = null;

    const startChange = (changeFn) => {
      changeFn();
      intervalId = setInterval(changeFn, 150);
    };

    const stopChange = () => {
      clearInterval(intervalId);
      intervalId = null;
    };

    const increase = () => {
      startChange(() => {
        data.progress[id] = id === 'day-running' ? (data.progress[id] || 0) + 0.1 : (data.progress[id] || 0) + 1;
        currentElement.innerText = id === 'day-running' ? data.progress[id].toFixed(1) : data.progress[id];
        checkAllCompleted(); // Recalculate allCompleted status dynamically
      });
    };

    const decrease = () => {
      startChange(() => {
        if (data.progress[id] > 0) {
          data.progress[id] = id === 'day-running' ? (data.progress[id] || 0) - 0.1 : (data.progress[id] || 0) - 1;
          currentElement.innerText = id === 'day-running' ? data.progress[id].toFixed(1) : data.progress[id];
          checkAllCompleted(); // Recalculate allCompleted status dynamically
        }
      });
    };

    ['mousedown', 'touchstart'].forEach((event) => {
      increaseBtn.addEventListener(event, increase);
      decreaseBtn.addEventListener(event, decrease);
    });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((event) => {
      increaseBtn.addEventListener(event, stopChange);
      decreaseBtn.addEventListener(event, stopChange);
    });
  };

  // Initialize the app
  const init = () => {
    loadData(); // Load data from local storage
    updateUI(); // Update the UI with the loaded data

    // Create handlers for each exercise
    EXERCISES.forEach(({ id, defaultTarget }) => {
      createExerciseHandler(id, data.targets[id] || defaultTarget);
    });
  };

  init();
})(document);
