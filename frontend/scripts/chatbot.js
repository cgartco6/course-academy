// AI Chatbot - Bronwyn
class BronwynChatbot {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.userProfile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserProfile();
        this.setupTypingIndicator();
    }

    setupEventListeners() {
        // Toggle chatbot
        document.getElementById('chatbotToggle').addEventListener('click', () => {
            this.toggleChatbot();
        });

        // Close chatbot
        document.getElementById('closeChatbot').addEventListener('click', () => {
            this.closeChatbot();
        });

        // Send message on button click
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        document.getElementById('chatbotInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Handle focus for better UX
        document.getElementById('chatbotInput').addEventListener('focus', () => {
            this.ensureChatbotOpen();
        });
    }

    toggleChatbot() {
        this.isOpen = !this.isOpen;
        const window = document.getElementById('chatbotWindow');
        window.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            this.focusInput();
            this.loadConversationHistory();
        }
    }

    closeChatbot() {
        this.isOpen = false;
        document.getElementById('chatbotWindow').style.display = 'none';
    }

    ensureChatbotOpen() {
        if (!this.isOpen) {
            this.toggleChatbot();
        }
    }

    focusInput() {
        document.getElementById('chatbotInput').focus();
    }

    async sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to UI
        this.addMessageToUI(message, 'user');
        
        // Clear input
        input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend for processing
            const response = await this.processMessage(message);
            this.hideTypingIndicator();
            this.addMessageToUI(response, 'bot');
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addMessageToUI("I'm having trouble connecting right now. Please try again in a moment.", 'bot');
        }
    }

    async processMessage(message) {
        // In production, this would call your backend AI service
        // For now, we'll use a simulated response system
        
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        const response = this.generateResponse(message);
        this.conversationHistory.push({ role: 'assistant', content: response });
        
        // Save conversation history
        this.saveConversationHistory();
        
        return response;
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Course-related queries
        if (lowerMessage.includes('course') || lowerMessage.includes('learn') || lowerMessage.includes('study')) {
            return this.handleCourseQuery(lowerMessage);
        }
        
        // Payment-related queries
        if (lowerMessage.includes('pay') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return this.handlePaymentQuery(lowerMessage);
        }
        
        // Technical support
        if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
            return this.handleSupportQuery(lowerMessage);
        }
        
        // Platform features
        if (lowerMessage.includes('feature') || lowerMessage.includes('how does') || lowerMessage.includes('work')) {
            return this.handleFeatureQuery(lowerMessage);
        }
        
        // General questions
        return this.handleGeneralQuery(lowerMessage);
    }

    handleCourseQuery(message) {
        const responses = [
            "We offer AI-powered courses on strategic intelligence, deep agents, synthetic intelligence, and AI-powered marketing. Which specific area interests you?",
            "Our courses are designed for rapid skill acquisition with AI-curated content. We focus on cutting-edge topics that traditional platforms don't cover.",
            "I can help you find the perfect course! Are you interested in AI development, content creation, or strategic intelligence?",
            "All our courses include instant download, lifetime access, and regular AI-driven updates. What specific skill would you like to master?"
        ];
        
        if (message.includes('strategic') || message.includes('intelligence')) {
            return "Our Strategic Intelligence & Deep Agents course teaches you to create AI systems that can strategize and execute complex tasks autonomously. It's perfect for developers and business leaders alike.";
        }
        
        if (message.includes('ai helper') || message.includes('assistant')) {
            return "The 'Creating AI Helpers for Complex Tasks' course shows you how to build AI assistants that handle multi-step processes and real-world decision-making.";
        }
        
        if (message.includes('content') || message.includes('marketing')) {
            return "Our AI-Powered Marketing Materials course teaches you to create viral content using AI tools and automation systems. Great for marketers and content creators!";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    handlePaymentQuery(message) {
        if (message.includes('crypto') || message.includes('bitcoin') || message.includes('ethereum')) {
            return "We accept Bitcoin, Ethereum, and USDT! Crypto payments are processed instantly and come with a 5% discount. The current exchange rates are updated daily.";
        }
        
        if (message.includes('south africa') || message.includes('sa') || message.includes('zar')) {
            return "For South African customers, we accept EFT, FNB transfers, PayFast, and PayShap. All payments are secure and processed in ZAR.";
        }
        
        if (message.includes('international') || message.includes('usd') || message.includes('euro')) {
            return "International payments are handled through Stripe. We accept all major credit cards and process payments in your local currency with real-time exchange rates.";
        }
        
        if (message.includes('refund') || message.includes('money back')) {
            return "We offer a 7-day satisfaction guarantee! If you're not happy with your course, just contact me and I'll process a full refund immediately.";
        }
        
        return "We accept multiple payment methods: South African EFT, FNB, PayFast, PayShap, Stripe for international, and cryptocurrencies (BTC, ETH, USDT). All payments are secure and encrypted.";
    }

    handleSupportQuery(message) {
        if (message.includes('download') || message.includes('access')) {
            return "After payment, you can download your course instantly from your account dashboard. All courses are available in multiple formats (PDF, video, interactive).";
        }
        
        if (message.includes('technical') || message.includes('issue') || message.includes('problem')) {
            return "I'm here to help! Please describe the technical issue you're experiencing, and I'll either solve it or connect you with our technical team.";
        }
        
        if (message.includes('account') || message.includes('login')) {
            return "Having account issues? Try resetting your password or clearing your browser cache. If the problem persists, I can help reset your account access.";
        }
        
        return "I'm Bronwyn, your AI support assistant! I can help with course selection, payment issues, technical problems, or any other questions about our platform.";
    }

    handleFeatureQuery(message) {
        if (message.includes('ai') || message.includes('artificial')) {
            return "Our platform is 90-95% AI-driven! We use AI for content curation, personalized learning paths, automated marketing, and customer support (that's me!).";
        }
        
        if (message.includes('security') || message.includes('safe') || message.includes('secure')) {
            return "We use military-grade security with end-to-end encryption, regular security audits, and compliance with international data protection standards.";
        }
        
        if (message.includes('mobile') || message.includes('phone')) {
            return "Our platform is fully responsive and works perfectly on all devices - desktop, tablet, and mobile. You can learn anywhere, anytime!";
        }
        
        return "Our key features include: AI-curated content, instant downloads, multiple payment options, military security, 24/7 AI support, and regular content updates based on trending topics.";
    }

    handleGeneralQuery(message) {
        const generalResponses = [
            "I'm Bronwyn, your AI learning assistant! I can help you choose courses, answer payment questions, provide technical support, or just chat about AI education.",
            "That's an interesting question! As an AI, I'm constantly learning and evolving to provide better assistance. How can I help you today?",
            "I'm here to make your learning journey smooth and enjoyable. Whether you have questions about courses, payments, or platform features, I've got you covered!",
            "Great question! Our platform is designed to make learning addictive and effective through AI-powered content and engaging formats."
        ];
        
        // Personalization based on user profile
        if (this.userProfile && this.userProfile.interests) {
            const interest = this.userProfile.interests[0];
            return `Since you're interested in ${interest}, I'd recommend checking out our related courses! Would you like me to show you some options?`;
        }
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    addMessageToUI(message, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message`;
        messageElement.textContent = message;
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbotMessages');
        const typingElement = document.createElement('div');
        typingElement.id = 'typing-indicator';
        typingElement.className = 'message bot-message typing';
        typingElement.innerHTML = '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';
        
        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    setupTypingIndicator() {
        // Add CSS for typing animation
        const style = document.createElement('style');
        style.textContent = `
            .typing-dots span {
                animation: typing 1.4s infinite;
            }
            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            @keyframes typing {
                0%, 60%, 100% { opacity: 0.3; }
                30% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    loadUserProfile() {
        // In production, this would load from backend
        const savedProfile = localStorage.getItem('bronwyn_user_profile');
        if (savedProfile) {
            this.userProfile = JSON.parse(savedProfile);
        } else {
            this.userProfile = {
                interests: [],
                previousCourses: [],
                conversationCount: 0
            };
        }
        
        this.userProfile.conversationCount++;
        this.saveUserProfile();
    }

    saveUserProfile() {
        localStorage.setItem('bronwyn_user_profile', JSON.stringify(this.userProfile));
    }

    loadConversationHistory() {
        const saved = localStorage.getItem('bronwyn_conversation');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            // Display last few messages
            this.displayRecentHistory();
        }
    }

    saveConversationHistory() {
        // Keep only last 50 messages to prevent storage bloat
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        localStorage.setItem('bronwyn_conversation', JSON.stringify(this.conversationHistory));
    }

    displayRecentHistory() {
        const messagesContainer = document.getElementById('chatbotMessages');
        // Clear existing messages except the first welcome message
        while (messagesContainer.children.length > 1) {
            messagesContainer.removeChild(messagesContainer.lastChild);
        }
        
        // Add recent messages (last 10)
        const recentMessages = this.conversationHistory.slice(-10);
        recentMessages.forEach(msg => {
            this.addMessageToUI(msg.content, msg.role === 'user' ? 'user' : 'bot');
        });
    }

    // Method to update user interests based on conversation
    updateUserInterests(message) {
        const interests = ['ai', 'programming', 'marketing', 'business', 'design', 'technology'];
        const detectedInterests = interests.filter(interest => 
            message.toLowerCase().includes(interest)
        );
        
        if (detectedInterests.length > 0 && !this.userProfile.interests.includes(detectedInterests[0])) {
            this.userProfile.interests.push(detectedInterests[0]);
            this.saveUserProfile();
        }
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bronwyn = new BronwynChatbot();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BronwynChatbot };
}
