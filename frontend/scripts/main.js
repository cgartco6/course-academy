// Main application functionality
class IntelliCourseApp {
    constructor() {
        this.courses = [];
        this.currentUser = null;
        this.currencyRates = {};
        this.init();
    }

    async init() {
        await this.loadCourses();
        await this.loadCurrencyRates();
        this.setupEventListeners();
        this.updateCurrencyNotice();
        
        // Check for user session
        this.checkUserSession();
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/courses');
            this.courses = await response.json();
            this.renderCourses();
        } catch (error) {
            console.error('Failed to load courses:', error);
            this.renderError('Failed to load courses. Please try again later.');
        }
    }

    async loadCurrencyRates() {
        try {
            const response = await fetch('/api/currency-rates');
            this.currencyRates = await response.json();
        } catch (error) {
            console.error('Failed to load currency rates:', error);
            // Fallback rates
            this.currencyRates = {
                USD: 18.5,
                EUR: 20.1,
                GBP: 23.2,
                ZAR: 1
            };
        }
    }

    renderCourses() {
        const grid = document.getElementById('coursesGrid');
        if (!grid) return;

        grid.innerHTML = this.courses.map(course => `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-image" style="background-image: url('${course.imageUrl}')"></div>
                <div class="course-content">
                    <span class="course-category">${course.category}</span>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <div class="course-price">
                            R ${course.price}
                            ${course.originalPrice ? `<span>R ${course.originalPrice}</span>` : ''}
                        </div>
                        <button class="enroll-button" data-course-id="${course.id}">
                            Enroll Now
                        </button>
                    </div>
                    <div class="payment-methods">
                        ${this.renderPaymentMethods(course)}
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to enroll buttons
        document.querySelectorAll('.enroll-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const courseId = e.target.dataset.courseId;
                this.handleEnrollment(courseId);
            });
        });
    }

    renderPaymentMethods(course) {
        const methods = [
            'EFT', 'FNB', 'PayFast', 'PayShap', 'Stripe', 'Bitcoin', 'Ethereum', 'USDT'
        ];
        
        return methods.map(method => 
            `<span class="payment-method">${method}</span>`
        ).join('');
    }

    renderError(message) {
        const grid = document.getElementById('coursesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                    <h3>😔 Unable to Load Courses</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="cta-button">Try Again</button>
                </div>
            `;
        }
    }

    async handleEnrollment(courseId) {
        const course = this.courses.find(c => c.id == courseId);
        if (!course) return;

        if (!this.currentUser) {
            this.showLoginModal(course);
            return;
        }

        this.showPaymentModal(course);
    }

    showLoginModal(course) {
        // Simplified login modal - in production, this would be more sophisticated
        const proceed = confirm(`To enroll in "${course.title}", you need to sign in. Would you like to proceed to login?`);
        if (proceed) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }

    showPaymentModal(course) {
        const modal = document.getElementById('paymentModal');
        const courseInfo = document.getElementById('paymentCourseInfo');
        
        courseInfo.innerHTML = `
            <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <h3>${course.title}</h3>
                <p style="margin: 0.5rem 0;">Price: <strong>R ${course.price}</strong></p>
                <p style="margin: 0; color: #6c757d;">${course.description}</p>
            </div>
        `;

        modal.style.display = 'block';
        
        // Store current course for payment processing
        this.currentCourse = course;
    }

    setupEventListeners() {
        // Mobile menu toggle (would be added in responsive version)
        this.setupMobileMenu();
        
        // Auth buttons
        document.getElementById('loginBtn')?.addEventListener('click', () => this.handleAuth('login'));
        document.getElementById('signupBtn')?.addEventListener('click', () => this.handleAuth('signup'));
        
        // Modal close
        document.querySelector('.close')?.addEventListener('click', () => {
            document.getElementById('paymentModal').style.display = 'none';
        });
        
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const method = e.currentTarget.dataset.method;
                this.showPaymentDetails(method);
            });
        });
        
        // Confirm payment
        document.getElementById('confirmPayment')?.addEventListener('click', () => {
            this.processPayment();
        });
        
        // FAQ toggle
        this.setupFAQ();
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('paymentModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    setupMobileMenu() {
        // Mobile menu implementation would go here
        // This is a simplified version
        const header = document.querySelector('header');
        if (window.innerWidth <= 768) {
            // Add mobile menu toggle button
            if (!document.querySelector('.menu-toggle')) {
                const toggle = document.createElement('button');
                toggle.className = 'menu-toggle';
                toggle.innerHTML = '☰';
                toggle.style.background = 'transparent';
                toggle.style.border = 'none';
                toggle.style.color = 'white';
                toggle.style.fontSize = '1.5rem';
                toggle.style.cursor = 'pointer';
                
                toggle.addEventListener('click', () => {
                    const nav = document.querySelector('nav');
                    nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
                });
                
                document.querySelector('.header-content').prepend(toggle);
            }
        }
    }

    setupFAQ() {
        const faqContainer = document.getElementById('faqContainer');
        if (!faqContainer) return;

        // Load FAQ data
        const faqData = [
            {
                question: "How are your courses different from Udemy?",
                answer: "Our courses are AI-curated for maximum retention, focus on cutting-edge topics like strategic intelligence and AI agents, and use addictive learning formats that traditional platforms don't offer."
            },
            {
                question: "What payment methods do you accept?",
                answer: "We accept South African EFT, FNB accounts, PayFast, PayShap, international payments via Stripe, and cryptocurrencies including Bitcoin, Ethereum, and USDT."
            },
            {
                question: "How does the currency conversion work?",
                answer: "All prices are linked to daily exchange rates. Our system automatically updates prices based on current market rates, which may cause slight fluctuations day to day."
            },
            {
                question: "Can I download courses for offline access?",
                answer: "Yes! All courses are available for instant download after payment. You can access them anytime, anywhere, even without an internet connection."
            },
            {
                question: "Do you offer refunds?",
                answer: "We offer a 7-day satisfaction guarantee. If you're not happy with your course, contact our AI support assistant Bronwyn for a full refund."
            }
        ];

        faqContainer.innerHTML = faqData.map((item, index) => `
            <div class="faq-item ${index === 0 ? 'active' : ''}">
                <div class="faq-question">
                    ${item.question}
                    <span>${index === 0 ? '−' : '+'}</span>
                </div>
                <div class="faq-answer" style="${index === 0 ? 'display: block;' : ''}">
                    ${item.answer}
                </div>
            </div>
        `).join('');

        // Add click handlers
        faqContainer.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                const item = question.parentElement;
                const isActive = item.classList.contains('active');
                
                // Close all items
                faqContainer.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.faq-question span').textContent = '+';
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                    question.querySelector('span').textContent = '−';
                }
            });
        });
    }

    handleAuth(action) {
        // Simplified auth handling - in production, this would use proper auth flow
        if (action === 'login') {
            window.location.href = '/login';
        } else {
            window.location.href = '/signup';
        }
    }

    showPaymentDetails(method) {
        const detailsDiv = document.getElementById('paymentDetails');
        const course = this.currentCourse;
        
        const methodDetails = {
            eft: `
                <div class="payment-instructions">
                    <h4>EFT Payment Instructions</h4>
                    <p>Please use the following details for your EFT payment:</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                        <p><strong>Bank:</strong> Standard Bank</p>
                        <p><strong>Account Number:</strong> 123 456 789</p>
                        <p><strong>Branch Code:</strong> 051001</p>
                        <p><strong>Reference:</strong> COURSE-${course.id}-${Date.now()}</p>
                        <p><strong>Amount:</strong> R ${course.price}</p>
                    </div>
                    <p><small>Please email your proof of payment to payments@intellicourse.com</small></p>
                </div>
            `,
            fnb: `
                <div class="payment-instructions">
                    <h4>FNB Payment</h4>
                    <p>Redirecting to FNB Online Banking...</p>
                </div>
            `,
            payfast: `
                <div class="payment-instructions">
                    <h4>PayFast Payment</h4>
                    <p>You will be redirected to PayFast to complete your payment securely.</p>
                </div>
            `,
            stripe: `
                <div class="payment-instructions">
                    <h4>International Payment</h4>
                    <p>Processing through Stripe for international payments.</p>
                    <p>Approximate amount: $${(course.price / this.currencyRates.USD).toFixed(2)} USD</p>
                </div>
            `,
            bitcoin: `
                <div class="payment-instructions">
                    <h4>Bitcoin Payment</h4>
                    <p>Send exactly <strong>${this.calculateCryptoAmount(course.price, 'BTC')} BTC</strong> to:</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1rem 0; word-break: break-all;">
                        <code>1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</code>
                    </div>
                    <p><small>Transaction may take 10-30 minutes to confirm.</small></p>
                </div>
            `,
            ethereum: `
                <div class="payment-instructions">
                    <h4>Ethereum Payment</h4>
                    <p>Send exactly <strong>${this.calculateCryptoAmount(course.price, 'ETH')} ETH</strong> to:</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1rem 0; word-break: break-all;">
                        <code>0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e</code>
                    </div>
                </div>
            `,
            usdt: `
                <div class="payment-instructions">
                    <h4>USDT Payment</h4>
                    <p>Send exactly <strong>${this.calculateCryptoAmount(course.price, 'USDT')} USDT</strong> to:</p>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 4px; margin: 1rem 0; word-break: break-all;">
                        <code>0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e</code>
                    </div>
                    <p><small>ERC-20 network only</small></p>
                </div>
            `
        };

        detailsDiv.innerHTML = methodDetails[method] || '<p>Select a payment method to continue.</p>';
    }

    calculateCryptoAmount(price, crypto) {
        // Simplified crypto calculation - in production, use real-time rates
        const rates = {
            BTC: 350000, // ZAR per BTC
            ETH: 25000,  // ZAR per ETH
            USDT: 18.5   // ZAR per USDT
        };
        
        const amount = price / rates[crypto];
        return amount.toFixed(8);
    }

    async processPayment() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedMethod) {
            alert('Please select a payment method');
            return;
        }

        const paymentData = {
            courseId: this.currentCourse.id,
            method: selectedMethod.value,
            amount: this.currentCourse.price,
            currency: 'ZAR'
        };

        try {
            const response = await fetch('/api/payments/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (result.success) {
                this.showPaymentSuccess(result);
            } else {
                alert('Payment failed: ' + result.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment processing failed. Please try again.');
        }
    }

    showPaymentSuccess(result) {
        const modal = document.getElementById('paymentModal');
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <h2>🎉 Payment Successful!</h2>
                <div style="font-size: 4rem; margin: 1rem 0;">✅</div>
                <h3>Welcome to "${this.currentCourse.title}"!</h3>
                <p>Your course is now available for download.</p>
                <div style="margin: 2rem 0;">
                    <button class="cta-button" onclick="window.location.href='/download/${result.downloadId}'">
                        Download Course
                    </button>
                </div>
                <p><small>You can always access your courses from your account dashboard.</small></p>
            </div>
        `;
    }

    updateCurrencyNotice() {
        const notice = document.querySelector('.currency-notice');
        if (notice && this.currencyRates.USD) {
            notice.innerHTML = `
                <strong>Live Exchange Rates:</strong> 
                USD/ZAR: ${this.currencyRates.USD.toFixed(2)} | 
                EUR/ZAR: ${this.currencyRates.EUR?.toFixed(2) || 'N/A'} |
                GBP/ZAR: ${this.currencyRates.GBP?.toFixed(2) || 'N/A'}
                - Prices update daily
            `;
        }
    }

    checkUserSession() {
        // Check if user is logged in (simplified)
        const token = localStorage.getItem('authToken');
        if (token) {
            this.currentUser = { name: 'User' }; // Would decode JWT in production
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        if (this.currentUser) {
            document.getElementById('loginBtn').textContent = 'My Account';
            document.getElementById('signupBtn').textContent = 'Logout';
            
            document.getElementById('signupBtn').onclick = () => {
                localStorage.removeItem('authToken');
                location.reload();
            };
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new IntelliCourseApp();
});

// Utility functions
function formatCurrency(amount, currency = 'ZAR') {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IntelliCourseApp, formatCurrency, debounce };
}
