document.addEventListener('DOMContentLoaded', () => {
    // --- Environment-aware navigation ---
    const ROUTES = {
        portfolioOrigin: 'https://antoniolobo.com',
        blogOrigin: 'https://blog.antoniolobo.com',
        localPortfolioPath: '/index.html',
        localBlogPath: '/blog/'
    };

    const HOME_SECTIONS = new Set([
        'home',
        'focus',
        'systems',
        'experience',
        'projects',
        'publications',
        'education',
        'skills'
    ]);

    const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
    const isLocal = window.location.protocol === 'file:' || LOCAL_HOSTS.has(window.location.hostname);
    const isPortfolioHost = window.location.hostname === 'antoniolobo.com' || window.location.hostname === 'www.antoniolobo.com';
    const isBlogHost = window.location.hostname === 'blog.antoniolobo.com';

    function localPath(path) {
        if (window.location.protocol !== 'file:') {
            return path;
        }

        const currentPath = window.location.pathname;
        let prefix = './';
        if (currentPath.includes('/blog/posts/')) {
            prefix = '../../../';
        } else if (currentPath.includes('/blog/')) {
            prefix = '../';
        }
        return `${prefix}${path.replace(/^\//, '')}`;
    }

    function homeHref(sectionId) {
        if (isLocal) {
            const onHomePage = /\/(?:index\.html)?$/.test(window.location.pathname) && !window.location.pathname.includes('/blog/');
            return onHomePage ? `#${sectionId}` : `${localPath(ROUTES.localPortfolioPath)}#${sectionId}`;
        }

        if (isPortfolioHost && !window.location.pathname.includes('/blog/')) {
            return `#${sectionId}`;
        }

        return `${ROUTES.portfolioOrigin}/#${sectionId}`;
    }

    function blogHref() {
        if (isLocal) {
            return localPath(ROUTES.localBlogPath);
        }

        if (isBlogHost) {
            return '/';
        }

        return `${ROUTES.blogOrigin}/`;
    }

    function blogPostHref(postPath) {
        const normalisedPath = postPath
            .replace(/^\//, '')
            .replace(/^blog\//, '')
            .replace(/\/?$/, '/');

        if (isLocal) {
            return localPath(`${ROUTES.localBlogPath}${normalisedPath}`);
        }

        if (isBlogHost) {
            return `/${normalisedPath}`;
        }

        return `${ROUTES.blogOrigin}/${normalisedPath}`;
    }

    function normaliseNavigationRoutes() {
        document.querySelectorAll('a[href]').forEach(link => {
            const originalHref = link.getAttribute('href');
            if (!originalHref) return;

            if (link.dataset.blogPost) {
                link.href = blogPostHref(link.dataset.blogPost);
                link.removeAttribute('target');
                link.removeAttribute('rel');
                return;
            }

            const sectionMatch = originalHref.match(/(?:^|\/)(?:index\.html)?#([A-Za-z0-9_-]+)$/) || originalHref.match(/^#([A-Za-z0-9_-]+)$/);
            if (sectionMatch && HOME_SECTIONS.has(sectionMatch[1])) {
                link.href = homeHref(sectionMatch[1]);
                return;
            }

            const pointsToBlogHome = originalHref === 'https://blog.antoniolobo.com/' ||
                originalHref === 'https://blog.antoniolobo.com' ||
                originalHref === '/blog/' ||
                originalHref === 'blog/' ||
                originalHref === 'blog/index.html' ||
                originalHref === '../blog/' ||
                originalHref === '../blog/index.html' ||
                originalHref.endsWith('/blog/index.html');

            if (pointsToBlogHome) {
                link.href = blogHref();
                if (isLocal || isBlogHost) {
                    link.removeAttribute('target');
                    link.removeAttribute('rel');
                } else if (link.target === '_blank') {
                    link.rel = 'noopener';
                }
                return;
            }

            if (link.classList.contains('back-link') && link.textContent.toLowerCase().includes('back to blog')) {
                link.href = blogHref();
            }
        });
    }

    normaliseNavigationRoutes();

    function enhanceResponsiveTables() {
        document.querySelectorAll('.blog-content table').forEach(table => {
            if (table.classList.contains('mc-mini-table')) return;

            const headers = Array.from(table.querySelectorAll('thead th'))
                .map(header => header.textContent.trim());

            if (!headers.length) return;

            table.querySelectorAll('tbody tr').forEach(row => {
                Array.from(row.children).forEach((cell, index) => {
                    cell.dataset.label = headers[index] || '';
                });
            });
        });
    }

    enhanceResponsiveTables();

    // --- Theme Toggle (Dark / Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        if (!themeToggle) return;
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
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
    }

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

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');

    if (mobileNav) {
        mobileNav.inert = true;
    }

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            mobileNav.classList.toggle('open', isOpen);
            mobileNav.setAttribute('aria-hidden', !isOpen);
            mobileNav.inert = !isOpen;
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (!hamburger || !mobileNav) return;
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', false);
            mobileNav.classList.remove('open');
            mobileNav.setAttribute('aria-hidden', true);
            mobileNav.inert = true;
            document.body.style.overflow = '';
        });
    });

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        // Change navbar background on scroll
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Show/hide back to top button
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
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
            if (new URL(link.href, window.location.href).hash === `#${current}`) {
                link.classList.add('active');
            }
        });

        // Sync active state for mobile nav links
        mobileNavLinks.forEach(link => {
            link.classList.remove('active');
            if (new URL(link.href, window.location.href).hash === `#${current}`) {
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
