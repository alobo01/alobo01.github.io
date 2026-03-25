document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Dark / Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        const icon = themeToggle.querySelector('i');
        if (!icon) return;
        if (theme === 'light') {
            icon.className = 'fa-solid fa-moon';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        } else {
            icon.className = 'fa-solid fa-sun';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        }
    }

    // Load saved theme or fall back to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem('theme', next);
    });

    // --- Typing animation for hero role ---
    const roles = [
        'Research Engineer',
        'Alignment Scientist',
        'RL for LLMs',
        'Post-Training Engineer'
    ];
    const typedEl = document.querySelector('.typed-role');
    let roleIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseEnd = 2200;
    const pauseStart = 600;

    function typeLoop() {
        const current = roles[roleIdx];
        if (!deleting) {
            typedEl.textContent = current.substring(0, charIdx + 1);
            charIdx++;
            if (charIdx === current.length) {
                setTimeout(() => { deleting = true; typeLoop(); }, pauseEnd);
                return;
            }
            setTimeout(typeLoop, typeSpeed);
        } else {
            typedEl.textContent = current.substring(0, charIdx);
            charIdx--;
            if (charIdx < 0) {
                deleting = false;
                charIdx = 0;
                roleIdx = (roleIdx + 1) % roles.length;
                setTimeout(typeLoop, pauseStart);
                return;
            }
            setTimeout(typeLoop, deleteSpeed);
        }
    }
    typeLoop();

    // Reveal Animations using Intersection Observer
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once per element
            }
        });
    };
    
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before the element enters the viewport
    };
    
    const revealObserver = new IntersectionObserver(revealCallback, revealOptions);
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Navbar Scroll Effect and Active Links
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top');

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        mobileNav.classList.toggle('open', isOpen);
        mobileNav.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', true);
            document.body.style.overflow = '';
        });
    });

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        // Change navbar background on scroll
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Show/hide back to top button
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        // Highlight active section link based on scroll position
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Add a small offset to trigger the active state a bit earlier
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Sync active state for mobile nav links
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Add a simple parallax effect to background blobs
    const blobs = document.querySelectorAll('.blob');
    
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.pageX) / speed;
            const yOffset = (window.innerHeight / 2 - e.pageY) / speed;
            
            // Apply subtle transform based on mouse movement
            // Using requestAnimationFrame would be better for performance in a real production app,
            // but for simple blobs, this is generally okay.
            blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });
});
