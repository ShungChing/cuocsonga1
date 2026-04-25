// Global variables
let isMusicPlaying = false;
let audioContext;
let mainGain;
let musicOscillator;
let currentImageIndex = 0;
let galleryImages = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollProgress();
    initParallax();
    initScrollReveal();
    initNavbar();
    initMusicToggle();
    initFilterButtons();
    initLightbox();
    initScrollAnimations();
});

// Scroll Progress Bar
function initScrollProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTop / docHeight;
        progressBar.style.width = (scrollPercent * 100) + '%';
    });
}

// Parallax Effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    const handleParallax = () => {
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.parallax);
            const rect = el.getBoundingClientRect();
            const scrolled = window.scrollY;
            const offsetTop = rect.top + scrolled;
            const distance = scrolled - offsetTop + window.innerHeight / 2;

            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.style.transform = `translateY(${distance * speed * 0.1}px)`;
            }
        });
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();
}

// Scroll Reveal Animation
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Reveal story sections
    document.querySelectorAll('.story-section').forEach(el => observer.observe(el));

    // Reveal achievement cards
    document.querySelectorAll('.achievement-card').forEach(el => observer.observe(el));

    // Reveal timeline items
    document.querySelectorAll('.timeline-item').forEach(el => observer.observe(el));

    // Reveal member cards
    document.querySelectorAll('.member-card').forEach(el => observer.observe(el));

    // Reveal gallery items
    document.querySelectorAll('.gallery-item').forEach(el => observer.observe(el));
}

// Navbar Toggle
function initNavbar() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
            });
        });
    }

    // Navbar scrolled effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
}

// Music Toggle
function initMusicToggle() {
    const musicToggle = document.querySelector('.music-toggle');
    if (!musicToggle) return;

    musicToggle.addEventListener('click', async () => {
        isMusicPlaying = !isMusicPlaying;

        if (isMusicPlaying) {
            // Initialize audio context on first play
            if (!audioContext) {
                initAudioContext();
            }

            playMusic();
            musicToggle.classList.add('playing');
        } else {
            stopMusic();
            musicToggle.classList.remove('playing');
        }
    });
}

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    mainGain = audioContext.createGain();
    mainGain.gain.value = 0.1;
    mainGain.connect(audioContext.destination);
}

function playMusic() {
    if (!audioContext) return;

    // Create a gentle ambient sound
    musicOscillator = audioContext.createOscillator();
    musicOscillator.type = 'sine';
    musicOscillator.frequency.setValueAtTime(220, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 1);

    musicOscillator.connect(gainNode);
    gainNode.connect(mainGain);
    musicOscillator.start();
}

function stopMusic() {
    if (musicOscillator) {
        musicOscillator.stop();
        musicOscillator = null;
    }
}

// Filter Buttons
function initFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.achievement-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter cards
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Lightbox
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxNav = document.querySelectorAll('.lightbox-nav');

    if (!lightbox) return;

    // Get all gallery images
    galleryImages = Array.from(document.querySelectorAll('.gallery-item img')).map(img => ({
        src: img.src,
        alt: img.alt
    }));

    // Open lightbox
    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        item.addEventListener('click', () => {
            currentImageIndex = index;
            updateLightboxImage();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Navigation
    document.querySelector('.lightbox-nav.prev').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    });

    document.querySelector('.lightbox-nav.next').addEventListener('click', (e) => {
        e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
                updateLightboxImage();
                break;
            case 'ArrowRight':
                currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
                updateLightboxImage();
                break;
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        if (galleryImages[currentImageIndex]) {
            lightboxImage.src = galleryImages[currentImageIndex].src;
            lightboxImage.alt = galleryImages[currentImageIndex].alt;
        }
    }
}

// Scroll-based animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all elements that should animate on scroll
    document.querySelectorAll('.story-section, .achievement-card, .timeline-item, .member-card, .gallery-item')
        .forEach(el => observer.observe(el));
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});