document.addEventListener('DOMContentLoaded', () => {

    /* --- AUDIO MANAGEMENT --- */
    const audio = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const musicPlayer = document.getElementById('music-player');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const interactionOverlay = document.getElementById('interaction-overlay');
    const overlayHeartTrigger = document.getElementById('overlay-heart-trigger');

    let audioInitialized = false;

    // Initialize audio on click/tap
    function startWebpageExperience() {
        if (!audioInitialized) {
            audio.play().then(() => {
                updateMusicUI(true);
            }).catch(err => {
                console.log('Audio autoplay prevented, user needs to toggle manually:', err);
                updateMusicUI(false);
            });
            audioInitialized = true;
        }
        
        // Hide entry overlay
        interactionOverlay.classList.add('hidden');
        
        // Initial particle burst
        spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 40);
    }

    if(overlayHeartTrigger) overlayHeartTrigger.addEventListener('click', startWebpageExperience);
    if(interactionOverlay) interactionOverlay.addEventListener('click', startWebpageExperience);

    // Toggle Music Play/Pause
    function toggleMusic() {
        if (audio.paused) {
            audio.play().then(() => {
                updateMusicUI(true);
            }).catch(err => console.error("Error playing audio: ", err));
        } else {
            audio.pause();
            updateMusicUI(false);
        }
    }

    function updateMusicUI(isPlaying) {
        if (isPlaying) {
            musicPlayer.classList.add('playing');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            musicPlayer.classList.remove('playing');
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    if(musicToggle) {
        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering page click
            toggleMusic();
        });
    }


    /* --- CANVAS INTERACTIVE PARTICLES --- */
    const canvas = document.getElementById('particle-canvas');
    if(!canvas) return; // Ensure canvas exists
    const ctx = canvas.getContext('2d');

    let particles = [];
    let isDesktop = window.matchMedia("(min-width: 992px)").matches;

    class Particle {
        constructor(x, y, type, color, size, speedX, speedY, life) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.color = color;
            this.size = size;
            this.speedX = speedX;
            this.speedY = speedY;
            this.life = life;
            this.decay = 0.005 + Math.random() * 0.015;
            this.angle = Math.random() * Math.PI * 2;
            this.spinSpeed = (Math.random() - 0.5) * 0.03;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spinSpeed;
            this.life -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;

            if (this.type === 'heart') {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-this.size/1.5, -this.size/1.5, -this.size*1.3, this.size/3, 0, this.size);
                ctx.bezierCurveTo(this.size*1.3, this.size/3, this.size/1.5, -this.size/1.5, 0, 0);
                ctx.closePath();
                ctx.fill();
            } else if (this.type === 'sparkle') {
                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.quadraticCurveTo(0, 0, this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, this.size);
                ctx.quadraticCurveTo(0, 0, -this.size, 0);
                ctx.quadraticCurveTo(0, 0, 0, -this.size);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    const colors = [
        'rgba(224, 122, 155, 0.7)',
        'rgba(255, 182, 193, 0.7)',
        'rgba(182, 143, 219, 0.7)',
        'rgba(223, 178, 86, 0.8)',
        'rgba(255, 230, 235, 0.8)'
    ];

    function spawnParticleBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            const size = 6 + Math.random() * 12;
            const type = Math.random() > 0.4 ? 'heart' : 'sparkle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const speedX = (Math.random() - 0.5) * 6;
            const speedY = (Math.random() - 0.5) * 6 - 1;
            particles.push(new Particle(x, y, type, color, size, speedX, speedY, 1.0));
        }
    }

    function spawnBackgroundFloaters() {
        if (particles.length < 75) {
            const x = Math.random() * canvas.width;
            const y = canvas.height + 20;
            const size = 5 + Math.random() * 10;
            const type = Math.random() > 0.6 ? 'heart' : 'circle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const speedX = (Math.random() - 0.5) * 1.5;
            const speedY = -0.5 - Math.random() * 1.5;
            particles.push(new Particle(x, y, type, color, size, speedX, speedY, 0.6 + Math.random() * 0.4));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        spawnBackgroundFloaters();
        particles = particles.filter(p => {
            p.update();
            if (p.life > 0) {
                p.draw();
                return true;
            }
            return false;
        });
        requestAnimationFrame(animateParticles);
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        isDesktop = window.matchMedia("(min-width: 992px)").matches;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animateParticles();

    window.addEventListener('click', (e) => {
        if (e.target.closest('#music-player') || e.target.closest('button') || e.target.closest('.slide-control') || e.target.closest('.dot') || e.target.closest('#envelope-wrapper') || e.target.closest('.gift-container')) return;
        spawnParticleBurst(e.clientX, e.clientY, 8);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDesktop) return;
        if (Math.random() > 0.4) {
            const size = 3 + Math.random() * 6;
            const color = 'rgba(223, 178, 86, 0.9)';
            const speedX = (Math.random() - 0.5) * 1.5;
            const speedY = (Math.random() - 0.5) * 1.5;
            particles.push(new Particle(e.clientX, e.clientY, 'sparkle', color, size, speedX, speedY, 0.9));
        }
    });

    /* --- NEW HERO BUTTON --- */
    const openHeartBtn = document.getElementById('open-heart-btn');
    const hiddenHeroText = document.getElementById('hidden-hero-text');
    if (openHeartBtn && hiddenHeroText) {
        openHeartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hiddenHeroText.classList.toggle('visible');
            openHeartBtn.style.display = 'none'; // hide button after click
            spawnParticleBurst(e.clientX, e.clientY, 15);
        });
    }

    /* --- ENVELOPE LOVE LETTER --- */
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    if(envelopeWrapper) {
        envelopeWrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            envelopeWrapper.classList.toggle('open');
            const rect = envelopeWrapper.getBoundingClientRect();
            spawnParticleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 12);
        });
    }

    /* --- SECRET GIFT BOX --- */
    const giftBoxTrigger = document.getElementById('gift-box-trigger');
    const giftMessage = document.getElementById('gift-message');
    if(giftBoxTrigger && giftMessage) {
        giftBoxTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            giftBoxTrigger.classList.add('opened');
            giftMessage.classList.add('visible');
            const rect = giftBoxTrigger.getBoundingClientRect();
            spawnParticleBurst(rect.left + rect.width/2, rect.top + rect.height/2, 25);
        });
    }

    /* --- SLIDESHOW / CAROUSEL --- */
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    let currentSlide = 0;
    let slideshowTimer;

    function showSlide(index) {
        if(!slides.length) return;
        slides[currentSlide].classList.remove('active');
        if(dots[currentSlide]) dots[currentSlide].classList.remove('active');
        
        currentSlide = (index + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        if(dots[currentSlide]) dots[currentSlide].classList.add('active');
        
        const gallery = document.getElementById('gallery');
        if(gallery) {
            const rect = gallery.getBoundingClientRect();
            spawnParticleBurst(rect.left + rect.width/2, rect.top + rect.height/2 - 50, 6);
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startSlideshowAuto() {
        clearInterval(slideshowTimer);
        slideshowTimer = setInterval(nextSlide, 5000);
    }

    if(prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(currentSlide - 1);
            startSlideshowAuto();
        });
    }

    if(nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(currentSlide + 1);
            startSlideshowAuto();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            showSlide(idx);
            startSlideshowAuto();
        });
    });

    let touchStartX = 0;
    let touchEndX = 0;
    const slideshowContainer = document.getElementById('slideshow');

    if(slideshowContainer) {
        slideshowContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshowContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const threshold = 50; 
            if (touchEndX < touchStartX - threshold) {
                nextSlide();
                startSlideshowAuto();
            }
            if (touchEndX > touchStartX + threshold) {
                showSlide(currentSlide - 1);
                startSlideshowAuto();
            }
        }, { passive: true });
        startSlideshowAuto();
    }


    /* --- SPECIAL SURPRISE COUNTDOWN --- */
    const surpriseTrigger = document.getElementById('surprise-trigger');
    const countdownOverlay = document.getElementById('countdown-overlay');
    const countdownNumber = document.getElementById('countdown-number');
    const surpriseRevealed = document.getElementById('surprise-revealed');
    const surpriseCloseBtn = document.getElementById('surprise-close');

    if(surpriseTrigger) {
        surpriseTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            countdownOverlay.classList.add('active');
            let counter = 3;
            countdownNumber.textContent = counter;
            spawnParticleBurst(window.innerWidth/2, window.innerHeight/2, 15);

            const countdownInterval = setInterval(() => {
                counter--;
                if (counter > 0) {
                    countdownNumber.textContent = counter;
                    spawnParticleBurst(window.innerWidth/2, window.innerHeight/2, 15);
                } else {
                    clearInterval(countdownInterval);
                    revealSurprise();
                }
            }, 1000);
        });
    }

    function revealSurprise() {
        countdownOverlay.classList.remove('active');
        surpriseRevealed.classList.add('active');
        spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 70);
        setTimeout(() => spawnParticleBurst(window.innerWidth * 0.3, window.innerHeight * 0.4, 25), 300);
        setTimeout(() => spawnParticleBurst(window.innerWidth * 0.7, window.innerHeight * 0.4, 25), 600);
        setTimeout(() => spawnParticleBurst(window.innerWidth / 2, window.innerHeight * 0.5, 40), 900);
    }

    if(surpriseCloseBtn) {
        surpriseCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            surpriseRevealed.classList.remove('active');
            spawnParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 15);
        });
    }


    /* --- FINAL SCENE SEQUENCE --- */
    const finalSceneTrigger = document.getElementById('final-scene-trigger');
    const finalScene = document.getElementById('final-scene');
    const finalSubtitle = document.getElementById('final-subtitle');
    const finalHearts = document.getElementById('final-hearts');

    if (finalSceneTrigger && finalScene) {
        finalSceneTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            finalScene.classList.add('active');

            // Generate floating hearts dynamically
            if(finalHearts) {
                finalHearts.innerHTML = ''; // clear any existing
                for (let i = 0; i < 20; i++) {
                    const h = document.createElement('div');
                    h.className = 'floating-heart';
                    h.textContent = '❤️';
                    h.style.left = Math.random() * 100 + '%';
                    h.style.animationDuration = (8 + Math.random() * 5) + 's';
                    h.style.animationDelay = (Math.random() * 5) + 's';
                    h.style.fontSize = (15 + Math.random() * 20) + 'px';
                    finalHearts.appendChild(h);
                }
            }

            // Fade in subtitle after 3 seconds
            setTimeout(() => {
                if(finalSubtitle) finalSubtitle.classList.add('visible');
            }, 3000);
        });
    }


    /* --- SCROLL ANIMATIONS --- */
    const fadeSections = document.querySelectorAll('.fade-in-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    fadeSections.forEach(section => {
        sectionObserver.observe(section);
    });

});
