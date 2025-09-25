// Set current year in footer
if (document.getElementById('currentYear')) {
    document.getElementById('currentYear').textContent = new Date().getFullYear();
}

// Mobile menu toggle with improved accessibility
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
let previouslyFocusedElement; // To store focus before menu opens

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-controls', 'mobile-menu');

    const openMenu = () => {
        previouslyFocusedElement = document.activeElement; // Store current focus
        mobileMenuButton.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.remove('hidden');
        document.body.classList.add('mobile-menu-active');
        mobileMenu.addEventListener('keydown', trapFocus);
        // Focus the first focusable element in the menu or the menu itself
        const firstFocusableElement = mobileMenu.querySelector('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        } else {
            mobileMenu.focus(); // Fallback if no focusable elements found
        }
    };

    const closeMenu = () => {
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.add('hidden');
        document.body.classList.remove('mobile-menu-active');
        mobileMenu.removeEventListener('keydown', trapFocus);
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus(); // Restore previous focus
        }
    };

    mobileMenuButton.addEventListener('click', () => {
        const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            if (mobileMenuButton.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            }
        }
    });

    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenuButton.getAttribute('aria-expanded') === 'true') {
            closeMenu();
        }
    });

    const trapFocus = (e) => {
        if (e.key !== 'Tab') {
            return;
        }
        const focusableElements = Array.from(mobileMenu.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
        if (focusableElements.length === 0) return;

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    };
}

// Smooth scroll with improved performance
const smoothScroll = (targetElement) => {
    const header = document.querySelector('header'); // Or your specific header selector
    const headerOffset = header ? header.offsetHeight : 80; // Dynamically get header height, fallback to 80
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
};

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            smoothScroll(targetElement);
        }
    });
});

// Lazy loading images with Intersection Observer
const lazyLoadImages = () => {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100', 'transition-opacity', 'duration-300');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
};

// Scroll animations with Intersection Observer
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    elements.forEach(element => {
        observer.observe(element);
    });
};

// Load Google Translate script
function loadGoogleTranslate() {
    console.log('[GT] Loading Google Translate script...');
    var script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.onload = function() {
        console.log('[GT] Google Translate script loaded');
    };
    script.onerror = function() {
        console.error('[GT] Failed to load Google Translate script');
    };
    document.body.appendChild(script);
}

function googleTranslateElementInit() {
    console.log('[GT] Initializing Google Translate...');
    try {
        // Clear the element first
        const element = document.getElementById('google_translate_element');
        if (element) {
            element.innerHTML = '';
        }
        
        // Simple initialization
        new google.translate.TranslateElement({
            pageLanguage: 'vi',
            includedLanguages: 'en,fr,de,ja,ko,zh-CN,ru',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element');
        console.log('[GT] Google Translate initialized successfully');
        
    } catch (error) {
        console.error('[GT] Error initializing Google Translate:', error);
    }
}

// Initialize all features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    lazyLoadImages();
    animateOnScroll();
    
    // Preload critical resources with cache optimization
    preloadCriticalResources();
    
    // Initialize cache warming for better performance
    initializeCacheWarming();
    
    // Load Google Translate
    loadGoogleTranslate();
    
    // Hide translation loading overlay if it exists
    const loadingOverlay = document.getElementById('translation-loading');
    if (loadingOverlay) {
        // Wait for Google Translate to finish loading
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            loadingOverlay.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
                loadingOverlay.remove();
            }, 300);
        }, 1000);
    }
    
    // Check Google Translate status
    setTimeout(() => {
        const element = document.getElementById('google_translate_element');
        const combo = document.querySelector('.goog-te-combo');
        const instance = window.google && window.google.translate ? 
            window.google.translate.TranslateElement.getInstance() : null;
            
        console.log('[GT] Google Translate status:', {
            google: !!window.google,
            translate: !!(window.google && window.google.translate),
            element: !!element,
            combo: !!combo,
            instance: !!instance,
            elementHTML: element ? element.innerHTML.substring(0, 100) + '...' : 'none'
        });
        
        // If combo exists, log its options
        if (combo) {
            console.log('[GT] Combo options:', Array.from(combo.options).map(opt => ({
                value: opt.value,
                text: opt.text
            })));
        }
        
        // Test if translation is working by checking for translated elements
        const translatedElements = document.querySelectorAll('[data-google-translate]');
        console.log('[GT] Translated elements found:', translatedElements.length);
        
        // Check if page is already translated
        const bodyClass = document.body.className;
        const isTranslated = bodyClass.includes('translated') || 
                           document.querySelector('.goog-te-banner-frame') !== null ||
                           document.querySelector('.skiptranslate') !== null;
        console.log('[GT] Page translation status:', {
            bodyClass: bodyClass,
            isTranslated: isTranslated
        });
        
        // If no combo or instance, try to force create them
        if (!combo && !instance && element) {
            console.log('[GT] No combo/instance found, trying to force create...');
            // Try to trigger Google Translate manually
            if (window.google && window.google.translate) {
                try {
                    // Force create the widget
                    element.innerHTML = '';
                    new google.translate.TranslateElement({
                        pageLanguage: 'vi',
                        includedLanguages: 'en,fr,de,ja,ko,zh-CN,ru',
                        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false
                    }, 'google_translate_element');
                    console.log('[GT] Force creation attempted');
                } catch (error) {
                    console.error('[GT] Force creation failed:', error);
                }
            }
        }
    }, 2000);
    
    // Add click outside listener for language popup
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('languagePopup');
        if (popup && !popup.classList.contains('hidden')) {
            // Kiểm tra nếu click ra ngoài popup
            if (!popup.contains(e.target) && !e.target.closest('.language-selector')) {
                toggleLanguageMenu(); // Đóng popup
            }
        }
    });
});

// Debounce function
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Add scroll to top button
const createScrollTopButton = () => {
    // Skip creating button for map page
    if (window.location.pathname.includes('/map/')) {
        return;
    }

    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-arrow-up"></i>';
    button.className = 'scroll-top-button';
    document.body.appendChild(button);

    const handleScroll = () => {
        if (window.pageYOffset > 300) {
            button.classList.add('is-visible');
        } else {
            button.classList.remove('is-visible');
        }
    };

    // Call handleScroll once on load to set the initial state
    handleScroll();

    window.addEventListener('scroll', debounce(handleScroll, 200));

    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};

createScrollTopButton();

// Preload critical resources for better performance
function preloadCriticalResources() {
    // Preload critical images (dùng đường dẫn tuyệt đối)
    const criticalImages = [
        '/assets/images/background.webp',
        '/assets/images/android-chrome-512x512.png',
        '/assets/images/gallery/placeholder-1-800.webp',
        '/assets/images/gallery/placeholder-2-800.webp',
        '/assets/images/gallery/placeholder-3-800.webp',
        '/assets/images/gallery/placeholder-4-800.webp'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
    
    // CSS/JS are bundled by Vite; no need to preload explicit /styles or /scripts URLs
}

// Initialize cache warming for better performance
function initializeCacheWarming() {
    // Cache warming for frequently accessed data
    if (typeof cacheManager !== 'undefined') {
        // Warm up cache for common API calls
        setTimeout(() => {
            // Prefetch data that might be needed soon
            // Clear old cache entries to free up space
            const cacheInfo = cacheManager.getCacheInfo('all');
            if (cacheInfo && cacheInfo.size > 50) { // If too many cache entries
                cacheManager.clearAllCache();
            }
        }, 2000); // Wait 2 seconds after page load
    }
}


// Language menu functions
function toggleLanguageMenu() {
    const popup = document.getElementById('languagePopup');
    if (popup.classList.contains('hidden')) {
        popup.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        popup.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function translatePage(langCode) {
    console.log('[GT] Attempting translation to:', langCode);
    
    // Close the language popup first
    toggleLanguageMenu();
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'translation-loading';
    loadingIndicator.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease-out;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 16px; height: 16px; border: 2px solid white; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
                <span style="font-weight: 500;">Đang dịch...</span>
            </div>
        </div>
        <style>
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(loadingIndicator);
    
    try {
        // Kiểm tra xem Google Translate đã load chưa
        if (window.google && window.google.translate) {
            console.log('[GT] Using Google Translate API directly...');
            
            // Sử dụng Google Translate API trực tiếp thay vì reload
            const currentLang = getCurrentLanguage();
            console.log('[GT] Current language:', currentLang, 'Target:', langCode);
            
            if (currentLang === langCode) {
                console.log('[GT] Already in target language');
                hideLoadingIndicator();
                return;
            }
            
            // Trigger translation trực tiếp
            if (window.google.translate.TranslateElement) {
                // Tìm combo box và trigger change
                const combo = document.querySelector('.goog-te-combo');
                if (combo) {
                    // Set value và trigger change event
                    combo.value = langCode;
                    combo.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('[GT] Triggered translation via combo box');
                    
                    // Hide loading sau 2 giây
                    setTimeout(() => {
                        hideLoadingIndicator();
                    }, 2000);
                } else {
                    // Fallback: reload page
                    console.log('[GT] Combo not found, using reload fallback');
                    setCookieAndReload(langCode);
                }
            } else {
                // Fallback: reload page
                console.log('[GT] TranslateElement not available, using reload fallback');
                setCookieAndReload(langCode);
            }
        } else {
            // Fallback: reload page
            console.log('[GT] Google Translate not loaded, using reload fallback');
            setCookieAndReload(langCode);
        }
        
    } catch (error) {
        console.error('[GT] Translation failed:', error);
        hideLoadingIndicator();
        showErrorMessage('Không thể dịch trang. Vui lòng thử lại sau.');
    }
}

function setCookieAndReload(langCode) {
    // Set the cookie for Google Translate
    const cookieValue = `/${langCode}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=.${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${cookieValue}; path=/; domain=localhost`;
    
    // Also set in localStorage and sessionStorage for backup
    localStorage.setItem('googtrans', cookieValue);
    sessionStorage.setItem('googtrans', cookieValue);
    
    console.log('[GT] Cookie set successfully:', cookieValue);
    
    // Wait a moment for cookie to be set, then reload
    setTimeout(() => {
        console.log('[GT] Reloading page to apply translation...');
        window.location.reload();
    }, 500);
}

function getCurrentLanguage() {
    // Lấy ngôn ngữ hiện tại từ cookie hoặc combo box
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'googtrans' && value && value !== '/vi') {
            return value.replace('/', '');
        }
    }
    
    // Check combo box value
    const combo = document.querySelector('.goog-te-combo');
    if (combo && combo.value) {
        return combo.value;
    }
    
    return 'vi'; // Default to Vietnamese
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('translation-loading');
    if (loadingIndicator) {
        loadingIndicator.style.opacity = '0';
        loadingIndicator.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            loadingIndicator.remove();
        }, 300);
    }
}

function showErrorMessage(message) {
    const errorMessage = document.createElement('div');
    errorMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 12px 20px; border-radius: 8px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease-out;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 16px;"></i>
                <span style="font-weight: 500;">${message}</span>
            </div>
        </div>
        <style>
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(errorMessage);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        errorMessage.style.opacity = '0';
        errorMessage.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            errorMessage.remove();
        }, 300);
    }, 3000);
}

// Make functions globally available
window.toggleLanguageMenu = toggleLanguageMenu;
window.translatePage = translatePage;