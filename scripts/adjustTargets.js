export const adjustTargets = (targets, completedDays, lastReset) => {
  const now = Date.now();
  const DAYS_MISSED = Math.floor((now - lastReset) / (24 * 60 * 60 * 1000)); // Days since the last completed day

  const updatedTargets = { ...targets };

  // Ensure all targets exist
  if (!updatedTargets['day-pushups']) updatedTargets['day-pushups'] = 30;
  if (!updatedTargets['day-squats']) updatedTargets['day-squats'] = 30;
  if (!updatedTargets['day-situps']) updatedTargets['day-situps'] = 30;
  if (!updatedTargets['day-running']) updatedTargets['day-running'] = 1;

  // Calculate milestones
  const completedMilestones = Math.floor(completedDays / 10); // Milestone for 10-day increments
  const runningMilestones = Math.floor(completedDays / 15); // Milestone for 15-day increments

  // Milestone tracker to avoid duplicate increases
  const milestoneTracker = JSON.parse(localStorage.getItem('milestoneTracker')) || {
    'day-pushups': 0,
    'day-squats': 0,
    'day-situps': 0,
    'day-running': 0,
  };

  // Adjust Pushups, Squats, Sit-ups targets
  ['day-pushups', 'day-squats', 'day-situps'].forEach((id) => {
    if (completedMilestones > milestoneTracker[id]) {
      const increase = (completedMilestones - milestoneTracker[id]) * 5; // Calculate total increase
      updatedTargets[id] += increase; // Apply increase
      milestoneTracker[id] = completedMilestones; // Update milestone tracker
    }
  });

  // Adjust Running target
  if (runningMilestones > milestoneTracker['day-running']) {
    const increase = (runningMilestones - milestoneTracker['day-running']) * 0.5; // Calculate total increase
    updatedTargets['day-running'] += increase; // Apply increase
    milestoneTracker['day-running'] = runningMilestones; // Update milestone tracker
  }

  // Save updated milestone tracker
  localStorage.setItem('milestoneTracker', JSON.stringify(milestoneTracker));

  // Handle Decreases (Days Missed)
  if (DAYS_MISSED > 10) {
    ['day-pushups', 'day-squats', 'day-situps'].forEach((id) => {
      updatedTargets[id] = Math.max(updatedTargets[id] - 1, 30); // Minimum 30
    });
  }

  if (DAYS_MISSED > 15) {
    updatedTargets['day-running'] = Math.max(updatedTargets['day-running'] - 0.5, 1); // Minimum 1km
  }

  return updatedTargets;
};
