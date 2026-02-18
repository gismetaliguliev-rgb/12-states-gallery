/**
 * MobileGallery - 2D swipe carousel for mobile devices
 */

export class MobileGallery {
  constructor(config, photoModal) {
    this.config = config;
    this.photoModal = photoModal;
    this.photos = config.photos.filter(p => p.id !== 'photo-cover');
    this.coverPhoto = config.photos.find(p => p.id === 'photo-cover');
    this.currentIndex = 0;
    this.container = document.getElementById('mobile-gallery');
    this.track = null;
    this.dots = [];

    // Touch state
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.isDragging = false;
    this.animationID = null;

    this.build();
    this.initTouch();
  }

  build() {
    const header = this.container.querySelector('.mobile-gallery-header');
    const galleryName = this.config.gallery.name || 'Gallery';
    const galleryDesc = this.config.gallery.description || '';
    header.querySelector('.mobile-gallery-title').textContent = '';
    header.querySelector('.mobile-gallery-subtitle').textContent = '';

    // Build carousel slides
    this.track = this.container.querySelector('.carousel-track');
    this.track.innerHTML = '';

    // Add cover slide first if it has overlay text
    if (this.coverPhoto && this.coverPhoto.overlay) {
      const coverSlide = document.createElement('div');
      coverSlide.className = 'carousel-slide';
      coverSlide.innerHTML = `
        <div class="carousel-explication-slide">
          <h2 class="carousel-explication-title">${this.coverPhoto.title || ''}</h2>
          <p class="carousel-explication-body">${this.coverPhoto.overlay.text.replace(/\n/g, '<br>')}</p>
        </div>
      `;
      this.track.appendChild(coverSlide);
    }

    // Add photo slides
    this.photos.forEach((photo, index) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `
        <img src="${photo.src}" alt="${photo.title || ''}" loading="lazy">
        <div class="carousel-slide-info">
          <div class="carousel-slide-title">${photo.title || ''}</div>
          <div class="carousel-slide-description">${photo.description || ''}</div>
          <div class="carousel-slide-counter">${index + 1} / ${this.photos.length}</div>
        </div>
      `;

      // Tap on image opens modal
      const img = slide.querySelector('img');
      img.addEventListener('click', (e) => {
        if (!this.isDragging) {
          e.stopPropagation();
          this.photoModal.open(photo);
        }
      });

      this.track.appendChild(slide);
    });

    // Build dots
    const dotsContainer = this.container.querySelector('.carousel-dots');
    dotsContainer.innerHTML = '';
    const totalSlides = this.getTotalSlides();

    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => this.goToSlide(i));
      dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  getTotalSlides() {
    const hasCover = this.coverPhoto && this.coverPhoto.overlay;
    return this.photos.length + (hasCover ? 1 : 0);
  }

  initTouch() {
    const carousel = this.container.querySelector('.mobile-gallery-carousel');

    carousel.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
    carousel.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
    carousel.addEventListener('touchend', () => this.touchEnd());
  }

  touchStart(e) {
    this.startX = e.touches[0].clientX;
    this.isDragging = true;
    this.track.classList.add('dragging');
    this.animationID = requestAnimationFrame(() => this.animation());
  }

  touchMove(e) {
    if (!this.isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - this.startX;
    this.currentTranslate = this.prevTranslate + diff;

    // Prevent vertical scroll while swiping
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  }

  touchEnd() {
    this.isDragging = false;
    this.track.classList.remove('dragging');
    cancelAnimationFrame(this.animationID);

    const movedBy = this.currentTranslate - this.prevTranslate;
    const threshold = window.innerWidth * 0.2;

    if (movedBy < -threshold && this.currentIndex < this.getTotalSlides() - 1) {
      this.currentIndex++;
    } else if (movedBy > threshold && this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.setPositionByIndex();
    this.updateDots();
  }

  animation() {
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    if (this.isDragging) {
      requestAnimationFrame(() => this.animation());
    }
  }

  setPositionByIndex() {
    this.currentTranslate = this.currentIndex * -window.innerWidth;
    this.prevTranslate = this.currentTranslate;
    this.track.style.transform = `translateX(${this.currentTranslate}px)`;
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.setPositionByIndex();
    this.updateDots();
  }

  updateDots() {
    this.dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  show() {
    this.container.classList.remove('hidden');
    // Reset to first slide
    this.currentIndex = 0;
    this.setPositionByIndex();
    this.updateDots();
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
