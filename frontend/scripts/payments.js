// Payment processing functionality
class PaymentProcessor {
    constructor() {
        this.availableMethods = [
            'eft', 'fnb', 'payfast', 'payshap', 'stripe', 'bitcoin', 'ethereum', 'usdt'
        ];
        this.exchangeRates = {};
        this.init();
    }

    async init() {
        await this.loadExchangeRates();
        this.setupPaymentListeners();
    }

    async loadExchangeRates() {
        try {
            const response = await fetch('/api/currency-rates');
            this.exchangeRates = await response.json();
        } catch (error) {
            console.error('Failed to load exchange rates:', error);
            // Fallback rates
            this.exchangeRates = {
                USD: 18.5,
                EUR: 20.1,
                GBP: 23.2,
                BTC: 350000,
                ETH: 25000,
                USDT: 18.5
            };
        }
    }

    setupPaymentListeners() {
        // Payment method selection
        document.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget.dataset.method);
            });
        });

        // Payment confirmation
        document.getElementById('confirmPayment')?.addEventListener('click', () => {
            this.processPayment();
        });
    }

    selectPaymentMethod(method) {
        // Update UI
        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.style.background = '';
        });
        document.querySelector(`[data-method="${method}"]`).style.background = '#f8f9fa';

        // Show payment details
        this.showPaymentDetails(method);
    }

    showPaymentDetails(method) {
        const course = window.app?.currentCourse;
        if (!course) return;

        const details = {
            eft: this.getEFTDetails(course),
            fnb: this.getFNBDetails(course),
            payfast: this.getPayFastDetails(course),
            payshap: this.getPayShapDetails(course),
            stripe: this.getStripeDetails(course),
            bitcoin: this.getBitcoinDetails(course),
            ethereum: this.getEthereumDetails(course),
            usdt: this.getUSDTDetails(course)
        };

        document.getElementById('paymentDetails').innerHTML = details[method] || '';
    }

    getEFTDetails(course) {
        const reference = `COURSE-${course.id}-${Date.now()}`;
        return `
            <div class="payment-instructions">
                <h4>📋 EFT Payment Instructions</h4>
                <div class="bank-details">
                    <div class="detail-item">
                        <label>Bank:</label>
                        <span>Standard Bank</span>
                    </div>
                    <div class="detail-item">
                        <label>Account Number:</label>
                        <span>123 456 789</span>
                    </div>
                    <div class="detail-item">
                        <label>Branch Code:</label>
                        <span>051001</span>
                    </div>
                    <div class="detail-item">
                        <label>Reference:</label>
                        <span class="reference">${reference}</span>
                        <button onclick="copyToClipboard('${reference}')" class="copy-btn">Copy</button>
                    </div>
                    <div class="detail-item">
                        <label>Amount:</label>
                        <span class="amount">R ${course.price}</span>
                    </div>
                </div>
                <div class="note">
                    <p>📧 Email proof of payment to: <strong>payments@intellicourse.com</strong></p>
                    <p>⏰ Access will be granted within 1 hour of payment confirmation</p>
                </div>
            </div>
        `;
    }

    getFNBDetails(course) {
        return `
            <div class="payment-instructions">
                <h4>🏦 FNB Payment</h4>
                <p>You will be redirected to FNB Online Banking to complete your payment securely.</p>
                <div class="payment-info">
                    <p><strong>Amount:</strong> R ${course.price}</p>
                    <p><strong>Merchant:</strong> IntelliCourse Academy</p>
                </div>
                <button class="cta-button" onclick="this.redirectToFNB()">Proceed to FNB</button>
            </div>
        `;
    }

    getPayFastDetails(course) {
        return `
            <div class="payment-instructions">
                <h4>🔒 PayFast Payment</h4>
                <p>You will be redirected to PayFast to complete your payment securely.</p>
                <div class="security-badges">
                    <span>🔒 SSL Secured</span>
                    <span>🛡️ PCI Compliant</span>
                </div>
                <button class="cta-button" onclick="this.redirectToPayFast()">Proceed to PayFast</button>
            </div>
        `;
    }

    getPayShapDetails(course) {
        return `
            <div class="payment-instructions">
                <h4>⚡ PayShap Payment</h4>
                <p>Instant payment via PayShap. Complete your payment in seconds.</p>
                <div class="shap-id">
                    <label>Send to ShapID:</label>
                    <span class="shap-id-value">intellicourse#academy</span>
                    <button onclick="copyToClipboard('intellicourse#academy')" class="copy-btn">Copy</button>
                </div>
                <p><strong>Amount:</strong> R ${course.price}</p>
                <p><small>💡 Use the reference number sent to your phone</small></p>
            </div>
        `;
    }

    getStripeDetails(course) {
        const usdAmount = (course.price / this.exchangeRates.USD).toFixed(2);
        return `
            <div class="payment-instructions">
                <h4>🌍 International Payment</h4>
                <p>Secure payment processing via Stripe for international customers.</p>
                <div class="currency-conversion">
                    <p><strong>Amount:</strong> R ${course.price} ≈ $${usdAmount} USD</p>
                    <p><small>Exchange rate: 1 USD = R ${this.exchangeRates.USD}</small></p>
                </div>
                <div id="stripe-card-element" style="margin: 1rem 0;">
                    <!-- Stripe card element will be inserted here -->
                </div>
                <button class="cta-button" onclick="this.processStripePayment()">Pay with Card</button>
            </div>
        `;
    }

    getBitcoinDetails(course) {
        const btcAmount = (course.price / this.exchangeRates.BTC).toFixed(8);
        return `
            <div class="payment-instructions">
                <h4>₿ Bitcoin Payment</h4>
                <p>Send exactly <strong>${btcAmount} BTC</strong> to the address below:</p>
                <div class="crypto-address">
                    <code id="btc-address">1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa</code>
                    <button onclick="copyToClipboard('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')" class="copy-btn">Copy</button>
                </div>
                <div class="qr-code">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=${btcAmount}" 
                         alt="Bitcoin QR Code" style="max-width: 150px; margin: 1rem 0;">
                </div>
                <div class="crypto-note">
                    <p>⚠️ <strong>Send exactly ${btcAmount} BTC</strong></p>
                    <p>⏱️ Confirmation time: 10-30 minutes</p>
                    <p>🔍 <a href="#" onclick="this.checkBitcoinPayment()">Check payment status</a></p>
                </div>
            </div>
        `;
    }

    getEthereumDetails(course) {
        const ethAmount = (course.price / this.exchangeRates.ETH).toFixed(6);
        return `
            <div class="payment-instructions">
                <h4>Ξ Ethereum Payment</h4>
                <p>Send exactly <strong>${ethAmount} ETH</strong> to the address below:</p>
                <div class="crypto-address">
                    <code id="eth-address">0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e</code>
                    <button onclick="copyToClipboard('0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e')" class="copy-btn">Copy</button>
                </div>
                <div class="crypto-note">
                    <p>⚠️ <strong>Send exactly ${ethAmount} ETH</strong></p>
                    <p>⏱️ Confirmation time: 2-5 minutes</p>
                    <p>🔍 <a href="#" onclick="this.checkEthereumPayment()">Check payment status</a></p>
                </div>
            </div>
        `;
    }

    getUSDTDetails(course) {
        const usdtAmount = (course.price / this.exchangeRates.USDT).toFixed(2);
        return `
            <div class="payment-instructions">
                <h4>💵 USDT Payment</h4>
                <p>Send exactly <strong>${usdtAmount} USDT</strong> to the address below:</p>
                <div class="crypto-address">
                    <code id="usdt-address">0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e</code>
                    <button onclick="copyToClipboard('0x742d35Cc6634C0532925a3b8Df6A5b7b6F64aD6e')" class="copy-btn">Copy</button>
                </div>
                <div class="crypto-note">
                    <p>⚠️ <strong>ERC-20 network only</strong></p>
                    <p>⚠️ <strong>Send exactly ${usdtAmount} USDT</strong></p>
                    <p>⏱️ Confirmation time: 2-5 minutes</p>
                </div>
            </div>
        `;
    }

    async processPayment() {
        const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedMethod) {
            this.showError('Please select a payment method');
            return;
        }

        const method = selectedMethod.value;
        const course = window.app?.currentCourse;

        if (!course) {
            this.showError('No course selected');
            return;
        }

        // Show processing state
        this.setProcessingState(true);

        try {
            let result;
            
            switch (method) {
                case 'stripe':
                    result = await this.processStripePayment(course);
                    break;
                case 'payfast':
                    result = await this.processPayFastPayment(course);
                    break;
                case 'fnb':
                    result = await this.processFNBPayment(course);
                    break;
                case 'payshap':
                    result = await this.processPayShapPayment(course);
                    break;
                default:
                    result = await this.processManualPayment(course, method);
            }

            if (result.success) {
                this.showSuccess(result);
            } else {
                this.showError(result.message || 'Payment failed');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showError('Payment processing failed. Please try again.');
        } finally {
            this.setProcessingState(false);
        }
    }

    async processStripePayment(course) {
        // In production, this would integrate with Stripe.js
        // This is a simulation
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    paymentId: 'pi_' + Math.random().toString(36).substr(2, 9),
                    downloadId: 'dl_' + Math.random().toString(36).substr(2, 12)
                });
            }, 2000);
        });
    }

    async processPayFastPayment(course) {
        // Simulate PayFast payment
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    paymentId: 'pf_' + Math.random().toString(36).substr(2, 9),
                    downloadId: 'dl_' + Math.random().toString(36).substr(2, 12)
                });
            }, 1500);
        });
    }

    async processManualPayment(course, method) {
        // For EFT, Crypto, etc. - manual processing
        return {
            success: true,
            paymentId: method + '_' + Math.random().toString(36).substr(2, 9),
            downloadId: 'dl_' + Math.random().toString(36).substr(2, 12),
            instructions: this.getManualInstructions(method, course)
        };
    }

    getManualInstructions(method, course) {
        const instructions = {
            eft: `Please email proof of payment for R ${course.price} to payments@intellicourse.com`,
            bitcoin: `We will notify you when we receive ${this.calculateCryptoAmount(course.price, 'BTC')} BTC`,
            ethereum: `We will notify you when we receive ${this.calculateCryptoAmount(course.price, 'ETH')} ETH`,
            usdt: `We will notify you when we receive ${this.calculateCryptoAmount(course.price, 'USDT')} USDT`
        };
        
        return instructions[method] || 'Payment received. Processing...';
    }

    calculateCryptoAmount(price, crypto) {
        const amount = price / this.exchangeRates[crypto];
        return amount.toFixed(crypto === 'BTC' ? 8 : 6);
    }

    setProcessingState(processing) {
        const button = document.getElementById('confirmPayment');
        if (processing) {
            button.innerHTML = '<span class="spinner"></span> Processing...';
            button.disabled = true;
        } else {
            button.textContent = 'Complete Payment';
            button.disabled = false;
        }
    }

    showError(message) {
        alert('Error: ' + message);
    }

    showSuccess(result) {
        const modal = document.getElementById('paymentModal');
        modal.innerHTML = `
            <div class="modal-content" style="text-align: center;">
                <span class="close" onclick="this.closeModal()">&times;</span>
                <h2>🎉 Payment Successful!</h2>
                <div style="font-size: 4rem; margin: 1rem 0;">✅</div>
                <h3>Welcome to "${window.app.currentCourse.title}"!</h3>
                <p>${result.instructions || 'Your course is now available for download.'}</p>
                <div style="margin: 2rem 0;">
                    <button class="cta-button" onclick="window.location.href='/download/${result.downloadId}'">
                        Download Course Now
                    </button>
                </div>
                <p><small>Payment ID: ${result.paymentId}</small></p>
                <p><small>You can always access your courses from your account dashboard.</small></p>
            </div>
        `;
    }

    closeModal() {
        document.getElementById('paymentModal').style.display = 'none';
        // Refresh the page to update course availability
        setTimeout(() => location.reload(), 1000);
    }
}

// Utility functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show copied feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function redirectToFNB() {
    // In production, this would redirect to FNB's payment gateway
    alert('Redirecting to FNB Online Banking...');
    // window.location.href = 'https://fnb.payment.gateway/...';
}

function redirectToPayFast() {
    // In production, this would redirect to PayFast
    alert('Redirecting to PayFast...');
    // window.location.href = 'https://www.payfast.co.za/eng/process/...';
}

// Initialize payment processor
document.addEventListener('DOMContentLoaded', () => {
    window.paymentProcessor = new PaymentProcessor();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PaymentProcessor, copyToClipboard };
}
