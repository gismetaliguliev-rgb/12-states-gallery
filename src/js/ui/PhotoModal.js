/**
 * PhotoModal - Full-screen photo viewer
 * Supports swipe down to close on mobile
 */

export class PhotoModal {
  constructor() {
    this.modal = document.getElementById('photo-modal');
    this.backdrop = this.modal.querySelector('.modal-backdrop');
    this.image = document.getElementById('modal-image');
    this.title = document.getElementById('modal-title');
    this.description = document.getElementById('modal-description');
    this.closeBtn = document.getElementById('modal-close');
    this.content = this.modal.querySelector('.modal-content');

    this.isOpen = false;
    this.closeCallbacks = [];

    // Swipe state
    this.touchStartY = 0;
    this.touchCurrentY = 0;
    this.isDragging = false;

    this.init();
  }

  init() {
    // Close button
    this.closeBtn.addEventListener('click', () => this.close());

    // Click backdrop to close
    this.backdrop.addEventListener('click', () => this.close());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Swipe down to close (mobile)
    this.modal.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
      this.isDragging = true;
    }, { passive: true });

    this.modal.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      this.touchCurrentY = e.touches[0].clientY;
      const diffY = this.touchCurrentY - this.touchStartY;

      // Only allow dragging down
      if (diffY > 0) {
        const opacity = Math.max(0, 1 - diffY / 300);
        const translateY = Math.min(diffY * 0.5, 150);
        this.content.style.transform = `translateY(${translateY}px)`;
        this.content.style.opacity = opacity;
      }
    }, { passive: true });

    this.modal.addEventListener('touchend', () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      const diffY = this.touchCurrentY - this.touchStartY;
      if (diffY > 100) {
        // Swipe was far enough — close
        this.close();
      }

      // Reset transform
      this.content.style.transform = '';
      this.content.style.opacity = '';
    });
  }

  open(photoData) {
    // If photo has overlay text — show text panel directly, no photo in modal
    if (photoData.overlay && photoData.overlay.text) {
      this.title.textContent = '';
      this.image.src = '';
      this.image.classList.add('hidden');

      const overlayText = photoData.overlay.text;
      this.description.innerHTML = `
        <div class="modal-explication-panel">
          <h2 class="modal-explication-title">${photoData.title || ''}</h2>
          <p class="modal-explication-body">${overlayText.replace(/\n/g, '<br>')}</p>
        </div>
      `;

    } else {
      this.image.src = photoData.src;
      this.image.alt = photoData.title || 'Photo';
      this.image.classList.remove('hidden');
      this.title.textContent = photoData.title || '';
      this.description.textContent = photoData.description || '';
    }

    this.modal.classList.remove('hidden');
    this.isOpen = true;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    this.isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Clear image and description
    this.image.src = '';
    this.image.classList.remove('hidden');
    this.description.innerHTML = '';

    // Reset swipe transforms
    this.content.style.transform = '';
    this.content.style.opacity = '';

    // Notify callbacks
    this.closeCallbacks.forEach(cb => cb());
  }

  onClose(callback) {
    this.closeCallbacks.push(callback);
  }
}
