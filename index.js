import { adjustTargets } from './scripts/adjustTargets.js';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registered: ', registration);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}


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
      lifetimeTotals: savedData.lifetimeTotals || EXERCISES.reduce((acc, { id }) => ({ ...acc, [id]: 0 }), {}),
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
  
      // Update current progress and target
      currentElement.innerText = id === 'day-running' ? currentValue.toFixed(1) : currentValue;
      targetElement.innerText = id === 'day-running' ? `${targetValue.toFixed(1)}km` : targetValue;
  
      // Update progress bar
      const progress = (currentValue / targetValue) * 100;
      progressBarElement.style.width = `${progress}%`;
      progressBarElement.style.background = currentValue >= targetValue ? 'rgb(0, 120, 0)' : 'rgb(0, 0, 190)';
    });
  
    // Update lifetime totals
    d.getElementById('total-pushups').innerText = data.lifetimeTotals['day-pushups'] || 0;
    d.getElementById('total-squats').innerText = data.lifetimeTotals['day-squats'] || 0;
    d.getElementById('total-situps').innerText = data.lifetimeTotals['day-situps'] || 0;
    d.getElementById('total-running').innerText = (data.lifetimeTotals['day-running'] || 0).toFixed(1);
  
    // Update completed days
    const completedDaysElement = d.getElementById('completed-days');
    completedDaysElement.innerText = data.completedDays || '0';
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
    let isProcessing = false; // Flag to prevent overly frequent updates
  
    const startChange = (changeFn) => {
      if (isProcessing) return; // Skip if already processing
      isProcessing = true; // Set processing flag
      changeFn();
      intervalId = setInterval(changeFn, 300); // Slower interval
    };
  
    const stopChange = () => {
      clearInterval(intervalId);
      intervalId = null;
      isProcessing = false; // Reset processing flag
    };
  
    const increase = () => {
      startChange(() => {
        data.progress[id] = id === 'day-running'
          ? (data.progress[id] || 0) + 0.1
          : (data.progress[id] || 0) + 1;
  
        data.lifetimeTotals[id] = id === 'day-running'
          ? (data.lifetimeTotals[id] || 0) + 0.1
          : (data.lifetimeTotals[id] || 0) + 1;
  
        currentElement.innerText = id === 'day-running' ? data.progress[id].toFixed(1) : data.progress[id];
        saveData();
        updateUI();
      });
    };
  
    const decrease = () => {
      startChange(() => {
        const currentValue = data.progress[id] || 0;
  
        if (currentValue > 0) {
          data.progress[id] = id === 'day-running'
            ? currentValue - 0.1
            : currentValue - 1;
  
          data.lifetimeTotals[id] = id === 'day-running'
            ? Math.max((data.lifetimeTotals[id] || 0) - 0.1, 0)
            : Math.max((data.lifetimeTotals[id] || 0) - 1, 0);
  
          currentElement.innerText = id === 'day-running' ? data.progress[id].toFixed(1) : data.progress[id];
          saveData();
          updateUI();
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
