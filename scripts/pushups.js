((d) => {
  // Elements
  let dayCurrentValue = 0;
  const dayTargetValue = 30;
  const dayCurrent = d.getElementById('day-pushups-current');
  const dayTarget = d.getElementById('day-pushups-target');
  const dayProgressBar = d.getElementById('day-pushups-progress-bar');
  const increaseBtn = d.getElementById('pushup-increase');
  const decreaseBtn = d.getElementById('pushup-decrease');

  let intervalId = null; // To track the interval for continuous execution

  const updateProgressBar = () => {
    if (dayCurrentValue <= dayTargetValue) {
      dayProgressBar.style.width = `${(dayCurrentValue / dayTargetValue) * 100}%`;
    }
    if (dayCurrentValue >= dayTargetValue) {
      dayProgressBar.style.background = 'rgb(0, 120, 0)';
    } else {
      dayProgressBar.style.background = 'rgb(0, 0, 190)';
    }
  };

  const startChange = (changeFn) => {
    changeFn(); // Execute the change once immediately
    intervalId = setInterval(changeFn, 150); // Execute the change repeatedly every 100ms
  };

  const stopChange = () => {
    clearInterval(intervalId);
    intervalId = null;
  };

  // Increase pushups
  const handleIncrease = () => {
    startChange(() => {
      dayCurrentValue += 1;
      dayCurrent.innerText = dayCurrentValue;
      updateProgressBar();
    });
  };

  // Decrease pushups
  const handleDecrease = () => {
    startChange(() => {
      if (dayCurrentValue > 0) {
        dayCurrentValue -= 1;
        dayCurrent.innerText = dayCurrentValue;
        updateProgressBar();
      }
    });
  };

  // Add listeners for desktop and mobile
  ['mousedown', 'touchstart'].forEach((event) => {
    increaseBtn.addEventListener(event, handleIncrease);
    decreaseBtn.addEventListener(event, handleDecrease);
  });

  // Stop the interval when the button is released or touch ends
  ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach((event) => {
    increaseBtn.addEventListener(event, stopChange);
    decreaseBtn.addEventListener(event, stopChange);
  });
})(document);
