/**
 * KIS Gallery CMS - Admin Interface
 */

class GalleryCMS {
  constructor() {
    this.config = null;
    this.currentPhotoId = null;
    this.hasChanges = false;

    this.init();
  }

  async init() {
    await this.loadConfig();
    this.setupNavigation();
    this.setupPhotoModal();
    this.setupSettings();
    this.setupSaveButton();
    this.renderPhotos();
  }

  // ===================================
  // Data Management
  // ===================================

  async loadConfig() {
    try {
      const response = await fetch('/gallery-config.json');
      this.config = await response.json();
      console.log('Gallery config loaded:', this.config);
    } catch (error) {
      console.error('Failed to load config:', error);
      this.showToast('Failed to load gallery configuration', 'error');
    }
  }

  async saveConfig() {
    try {
      // In a real app, this would POST to a server
      // For now, we'll download the JSON file
      const blob = new Blob([JSON.stringify(this.config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gallery-config.json';
      a.click();
      URL.revokeObjectURL(url);

      this.hasChanges = false;
      this.showToast('Configuration saved! Replace the file in /public/', 'success');
    } catch (error) {
      console.error('Failed to save config:', error);
      this.showToast('Failed to save configuration', 'error');
    }
  }

  markChanged() {
    this.hasChanges = true;
  }

  // ===================================
  // Navigation
  // ===================================

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;

        // Update nav active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Show section
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(`${sectionId}-section`).classList.add('active');
      });
    });
  }

  // ===================================
  // Photos
  // ===================================

  renderPhotos() {
    const grid = document.getElementById('photos-grid');
    grid.innerHTML = '';

    this.config.photos.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <div class="photo-card-image">
          ${photo.src ? `<img src="${photo.src}" alt="${photo.title}">` : '<span class="photo-card-placeholder">🖼️</span>'}
        </div>
        <div class="photo-card-info">
          <div class="photo-card-title">${photo.title || 'Untitled'}</div>
          <div class="photo-card-meta">${photo.position.wall} wall • ${photo.dimensions.width}m × ${photo.dimensions.height}m</div>
        </div>
      `;
      card.addEventListener('click', () => this.openPhotoModal(photo.id));
      grid.appendChild(card);
    });

    // Add photo button
    document.getElementById('add-photo-btn').addEventListener('click', () => this.openPhotoModal(null));
  }

  // ===================================
  // Photo Modal
  // ===================================

  setupPhotoModal() {
    const modal = document.getElementById('photo-modal');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-photo-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const backdrop = modal.querySelector('.modal-backdrop');

    const closeModal = () => {
      modal.classList.add('hidden');
      this.currentPhotoId = null;
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', () => this.savePhoto());
    deleteBtn.addEventListener('click', () => this.deletePhoto());

    // File upload
    this.setupFileUpload();
  }

  setupFileUpload() {
    const fileUpload = document.getElementById('file-upload');
    const fileInput = document.getElementById('photo-file');
    const preview = document.getElementById('photo-preview');
    const placeholder = document.getElementById('upload-placeholder');

    fileUpload.addEventListener('click', () => fileInput.click());

    fileUpload.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUpload.classList.add('dragover');
    });

    fileUpload.addEventListener('dragleave', () => {
      fileUpload.classList.remove('dragover');
    });

    fileUpload.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUpload.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file) this.handleFileSelect(file);
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFileSelect(file);
    });
  }

  handleFileSelect(file) {
    const preview = document.getElementById('photo-preview');
    const placeholder = document.getElementById('upload-placeholder');

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  openPhotoModal(photoId) {
    const modal = document.getElementById('photo-modal');
    const title = document.getElementById('modal-title');
    const deleteBtn = document.getElementById('delete-btn');

    this.currentPhotoId = photoId;

    if (photoId) {
      // Edit existing photo
      const photo = this.config.photos.find(p => p.id === photoId);
      if (!photo) return;

      title.textContent = 'Edit Photo';
      deleteBtn.classList.remove('hidden');

      // Populate form
      document.getElementById('photo-title').value = photo.title || '';
      document.getElementById('photo-description').value = photo.description || '';
      document.getElementById('photo-wall').value = photo.position.wall;
      document.getElementById('photo-room').value = photo.position.room;
      document.getElementById('photo-x').value = photo.position.x;
      document.getElementById('photo-y').value = photo.position.y;
      document.getElementById('photo-width').value = photo.dimensions.width;
      document.getElementById('photo-height').value = photo.dimensions.height;
      document.getElementById('frame-color').value = photo.frame?.color || '#1a1a1a';

      // Preview image
      const preview = document.getElementById('photo-preview');
      const placeholder = document.getElementById('upload-placeholder');
      if (photo.src) {
        preview.src = photo.src;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      } else {
        preview.classList.add('hidden');
        placeholder.classList.remove('hidden');
      }
    } else {
      // New photo
      title.textContent = 'Add Photo';
      deleteBtn.classList.add('hidden');

      // Reset form
      document.getElementById('photo-form').reset();
      document.getElementById('photo-y').value = '1.8';
      document.getElementById('photo-width').value = '1.5';
      document.getElementById('photo-height').value = '1';
      document.getElementById('frame-color').value = '#1a1a1a';

      document.getElementById('photo-preview').classList.add('hidden');
      document.getElementById('upload-placeholder').classList.remove('hidden');
    }

    modal.classList.remove('hidden');
  }

  savePhoto() {
    const formData = {
      title: document.getElementById('photo-title').value,
      description: document.getElementById('photo-description').value,
      position: {
        room: document.getElementById('photo-room').value,
        wall: document.getElementById('photo-wall').value,
        x: parseFloat(document.getElementById('photo-x').value) || 0,
        y: parseFloat(document.getElementById('photo-y').value) || 1.8
      },
      dimensions: {
        width: parseFloat(document.getElementById('photo-width').value) || 1.5,
        height: parseFloat(document.getElementById('photo-height').value) || 1
      },
      frame: {
        style: 'modern',
        color: document.getElementById('frame-color').value,
        width: 0.04
      }
    };

    // Get image source (for demo, we'll use data URL or existing src)
    const preview = document.getElementById('photo-preview');
    if (preview.src && !preview.classList.contains('hidden')) {
      formData.src = preview.src;
    }

    if (this.currentPhotoId) {
      // Update existing photo
      const index = this.config.photos.findIndex(p => p.id === this.currentPhotoId);
      if (index !== -1) {
        this.config.photos[index] = { ...this.config.photos[index], ...formData };
      }
    } else {
      // Add new photo
      const newId = `photo-${Date.now()}`;
      this.config.photos.push({
        id: newId,
        ...formData
      });
    }

    this.markChanged();
    this.renderPhotos();
    document.getElementById('photo-modal').classList.add('hidden');
    this.showToast('Photo saved successfully', 'success');
  }

  deletePhoto() {
    if (!this.currentPhotoId) return;

    if (confirm('Are you sure you want to delete this photo?')) {
      this.config.photos = this.config.photos.filter(p => p.id !== this.currentPhotoId);
      this.markChanged();
      this.renderPhotos();
      document.getElementById('photo-modal').classList.add('hidden');
      this.showToast('Photo deleted', 'success');
    }
  }

  // ===================================
  // Settings
  // ===================================

  setupSettings() {
    // Populate settings
    const settings = this.config.gallery.settings;

    document.getElementById('gallery-name').value = this.config.gallery.name || '';
    document.getElementById('gallery-description').value = this.config.gallery.description || '';
    document.getElementById('wall-color').value = settings.wallColor || '#f5f5f5';
    document.getElementById('floor-color').value = settings.floorColor || '#1a1a1a';
    document.getElementById('ambient-light').value = settings.ambientLight || 0.5;
    document.getElementById('spotlight-intensity').value = settings.spotlightIntensity || 1.2;

    // Update range display values
    this.updateRangeValue('ambient-light');
    this.updateRangeValue('spotlight-intensity');

    // Event listeners for changes
    ['gallery-name', 'gallery-description', 'wall-color', 'floor-color'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        this.updateSettings();
      });
    });

    ['ambient-light', 'spotlight-intensity'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        this.updateRangeValue(id);
        this.updateSettings();
      });
    });
  }

  updateRangeValue(id) {
    const value = document.getElementById(id).value;
    document.getElementById(`${id}-value`).textContent = value;
  }

  updateSettings() {
    this.config.gallery.name = document.getElementById('gallery-name').value;
    this.config.gallery.description = document.getElementById('gallery-description').value;
    this.config.gallery.settings.wallColor = document.getElementById('wall-color').value;
    this.config.gallery.settings.floorColor = document.getElementById('floor-color').value;
    this.config.gallery.settings.ambientLight = parseFloat(document.getElementById('ambient-light').value);
    this.config.gallery.settings.spotlightIntensity = parseFloat(document.getElementById('spotlight-intensity').value);

    this.markChanged();
  }

  // ===================================
  // Save Button
  // ===================================

  setupSaveButton() {
    document.getElementById('save-btn').addEventListener('click', () => this.saveConfig());
    document.getElementById('preview-btn').addEventListener('click', () => {
      window.open('/', '_blank');
    });
  }

  // ===================================
  // Toast Notifications
  // ===================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize CMS
new GalleryCMS();
