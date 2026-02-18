/**
 * LoadingManager - Handles loading screen and progress
 */

export class LoadingManager {
  constructor() {
    this.screen = document.getElementById('loading-screen');
    this.progressBar = document.getElementById('loading-progress');
    this.text = document.getElementById('loading-text');

    this.completeCallbacks = [];
    this.isComplete = false;
  }

  updateProgress(percent, message) {
    this.progressBar.style.width = `${percent}%`;
    if (message) {
      this.text.textContent = message;
    }

    if (percent >= 100 && !this.isComplete) {
      this.complete();
    }
  }

  complete() {
    this.isComplete = true;

    setTimeout(() => {
      this.screen.classList.add('fade-out');

      setTimeout(() => {
        this.screen.classList.add('hidden');
        this.completeCallbacks.forEach(cb => cb());
      }, 500);
    }, 300);
  }

  onComplete(callback) {
    if (this.isComplete) {
      callback();
    } else {
      this.completeCallbacks.push(callback);
    }
  }

  showError(message) {
    this.text.textContent = message;
    this.text.style.color = '#ff6b6b';
  }
}
