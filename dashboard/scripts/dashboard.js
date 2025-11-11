// Main dashboard functionality
class Dashboard {
    constructor() {
        this.currentPage = 'dashboard';
        this.charts = {};
        this.data = {};
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.setupCharts();
        this.loadAIAgents();
        this.startRealTimeUpdates();
    }

    async loadData() {
        try {
            const responses = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch('/api/dashboard/revenue'),
                fetch('/api/dashboard/students'),
                fetch('/api/dashboard/payments')
            ]);

            this.data = {
                stats: await responses[0].json(),
                revenue: await responses[1].json(),
                students: await responses[2].json(),
                payments: await responses[3].json()
            };

            this.updateUI();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Revenue period selector
        document.getElementById('revenue-period')?.addEventListener('change', (e) => {
            this.updateRevenueChart(e.target.value);
        });

        // Deploy agent button
        document.getElementById('deployAgent')?.addEventListener('click', () => {
            this.deployNewAgent();
        });

        // Real-time updates toggle
        this.setupRealTimeToggle();

        // Export functionality
        this.setupExportButtons();
    }

    navigateToPage(page) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Show/hide pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        this.currentPage = page;
        
        // Load page-specific data
        this.loadPageData(page);
    }

    loadPageData(page) {
        switch (page) {
            case 'revenue':
                this.loadRevenueAnalytics();
                break;
            case 'students':
                this.loadStudentManagement();
                break;
            case 'courses':
                this.loadCourseManagement();
                break;
            case 'ai-agents':
                this.loadAIAgents();
                break;
            case 'marketing':
                this.loadMarketingAnalytics();
                break;
            case 'payouts':
                this.loadPayouts();
                break;
        }
    }

    setupCharts() {
        this.setupRevenueChart();
        this.setupPaymentMethodsChart();
        this.setupStudentGrowthChart();
    }

    setupRevenueChart() {
        const ctx = document.getElementById('revenueChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLast7Days(),
                datasets: [{
                    label: 'Daily Revenue',
                    data: [12500, 13200, 14100, 15800, 14900, 16200, 17800],
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    setupPaymentMethodsChart() {
        const ctx = document.getElementById('paymentMethodsChart')?.getContext('2d');
        if (!ctx) return;

        this.charts.paymentMethods = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['EFT', 'PayFast', 'Crypto', 'Stripe', 'Other'],
                datasets: [{
                    data: [42, 28, 15, 10, 5],
                    backgroundColor: [
                        '#4361ee',
                        '#4cc9f0',
                        '#7209b7',
                        '#f8961e',
                        '#6c757d'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    setupStudentGrowthChart() {
        // This would be used on the students page
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-ZA', { weekday: 'short' }));
        }
        return days;
    }

    updateRevenueChart(period) {
        // In production, this would fetch new data based on the period
        console.log('Updating revenue chart for period:', period);
        
        // Simulate data update
        if (this.charts.revenue) {
            const newData = this.generateRevenueData(period);
            this.charts.revenue.data.datasets[0].data = newData;
            this.charts.revenue.update();
        }
    }

    generateRevenueData(period) {
        const base = period === '7' ? 10000 : period === '30' ? 8000 : 5000;
        const variance = period === '7' ? 5000 : period === '30' ? 15000 : 40000;
        const dataPoints = period === '7' ? 7 : period === '30' ? 30 : 90;
        
        return Array.from({ length: dataPoints }, (_, i) => 
            base + Math.random() * variance + (i * variance / dataPoints)
        );
    }

    async loadAIAgents() {
        try {
            const response = await fetch('/api/ai-agents');
            const agents = await response.json();
            this.renderAIAgents(agents);
        } catch (error) {
            console.error('Failed to load AI agents:', error);
        }
    }

    renderAIAgents(agents) {
        const grid = document.getElementById('agentsGrid');
        if (!grid) return;

        grid.innerHTML = agents.map(agent => `
            <div class="agent-card">
                <div class="agent-header">
                    <div class="agent-title">${agent.name}</div>
                    <div class="agent-status status-${agent.status}">${agent.status.toUpperCase()}</div>
                </div>
                <div class="agent-description">${agent.description}</div>
                <div class="agent-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${agent.progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${agent.current}/${agent.target} ${agent.unit}</span>
                        <span>${agent.progress}%</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="btn-small" onclick="dashboard.controlAgent('${agent.id}', 'start')" 
                            ${agent.status === 'active' ? 'disabled' : ''}>Start</button>
                    <button class="btn-small" onclick="dashboard.controlAgent('${agent.id}', 'stop')"
                            ${agent.status !== 'active' ? 'disabled' : ''}>Stop</button>
                    <button class="btn-small" onclick="dashboard.viewAgentLogs('${agent.id}')">Logs</button>
                </div>
            </div>
        `).join('');
    }

    async deployNewAgent() {
        try {
            const response = await fetch('/api/ai-agents/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'student_acquisition',
                    target: 2000,
                    timeframe: 7
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('New AI agent deployed successfully!', 'success');
                this.loadAIAgents(); // Refresh the list
            } else {
                this.showNotification('Failed to deploy agent: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Failed to deploy agent:', error);
            this.showNotification('Failed to deploy agent', 'error');
        }
    }

    async controlAgent(agentId, action) {
        try {
            const response = await fetch(`/api/ai-agents/${agentId}/control`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification(`Agent ${action}ed successfully`, 'success');
                this.loadAIAgents(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to control agent:', error);
            this.showNotification('Failed to control agent', 'error');
        }
    }

    viewAgentLogs(agentId) {
        // In production, this would open a modal with agent logs
        console.log('Viewing logs for agent:', agentId);
        // window.open(`/api/ai-agents/${agentId}/logs`, '_blank');
    }

    setupRealTimeToggle() {
        // Add real-time updates toggle to the header
        const toggleHTML = `
            <label class="real-time-toggle">
                <input type="checkbox" id="realTimeUpdates" checked>
                <span class="toggle-slider"></span>
                Real-time Updates
            </label>
        `;
        
        document.querySelector('.header').insertAdjacentHTML('beforeend', toggleHTML);
        
        document.getElementById('realTimeUpdates').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.startRealTimeUpdates();
            } else {
                this.stopRealTimeUpdates();
            }
        });
    }

    startRealTimeUpdates() {
        // Simulate real-time updates
        this.updateInterval = setInterval(() => {
            this.updateLiveData();
        }, 5000); // Update every 5 seconds
    }

    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    updateLiveData() {
        // Update stats with small random changes
        this.updateLiveStats();
        
        // Update revenue chart
        if (this.charts.revenue) {
            const currentData = this.charts.revenue.data.datasets[0].data;
            const newValue = currentData[currentData.length - 1] + (Math.random() * 2000 - 1000);
            currentData.push(Math.max(0, newValue));
            currentData.shift();
            this.charts.revenue.update('none');
        }
    }

    updateLiveStats() {
        // Update student count
        const studentElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
        if (studentElement) {
            const current = parseInt(studentElement.textContent.replace(/\D/g, ''));
            const change = Math.floor(Math.random() * 5);
            studentElement.textContent = (current + change).toLocaleString();
        }

        // Update revenue
        const revenueElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
        if (revenueElement) {
            const current = parseInt(revenueElement.textContent.replace(/\D/g, ''));
            const change = Math.floor(Math.random() * 1000);
            revenueElement.textContent = 'R ' + (current + change).toLocaleString();
        }
    }

    setupExportButtons() {
        // Add export buttons to various sections
        const exportHTML = `
            <div class="export-buttons">
                <button class="export-btn" onclick="dashboard.exportData('csv')">
                    📥 CSV
                </button>
                <button class="export-btn" onclick="dashboard.exportData('excel')">
                    📊 Excel
                </button>
                <button class="export-btn" onclick="dashboard.exportData('pdf')">
                    📄 PDF
                </button>
            </div>
        `;

        // Add to relevant sections
        document.querySelectorAll('.chart-card, .payout-section, .ai-agents-section').forEach(section => {
            const header = section.querySelector('.chart-header, .payout-header, .ai-agents-header');
            if (header && !section.querySelector('.export-buttons')) {
                header.insertAdjacentHTML('afterend', exportHTML);
            }
        });
    }

    async exportData(format) {
        try {
            const response = await fetch(`/api/export/${format}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: this.currentPage,
                    dateRange: 'last_30_days'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `intellicourse_${this.currentPage}_${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showNotification(`Exported ${format.toUpperCase()} successfully`, 'success');
            }
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    updateUI() {
        // Update stats cards
        if (this.data.stats) {
            this.updateStatsCards(this.data.stats);
        }

        // Update payout distribution
        this.updatePayoutDistribution();
    }

    updateStatsCards(stats) {
        const elements = {
            revenue: document.querySelector('.stat-card:nth-child(1) .stat-value'),
            students: document.querySelector('.stat-card:nth-child(2) .stat-value'),
            courses: document.querySelector('.stat-card:nth-child(3) .stat-value'),
            target: document.querySelector('.stat-card:nth-child(4) .stat-value')
        };

        if (elements.revenue) elements.revenue.textContent = 'R ' + stats.revenue.toLocaleString();
        if (elements.students) elements.students.textContent = stats.students.toLocaleString();
        if (elements.courses) elements.courses.textContent = stats.coursesSold.toLocaleString();
        if (elements.target) elements.target.textContent = 'R ' + stats.monthlyTarget.toLocaleString();
    }

    updatePayoutDistribution() {
        const total = this.data.stats?.revenue || 248750;
        const weekly = total * 0.25; // 25% of monthly revenue as weekly payout

        document.querySelectorAll('.payout-amount').forEach((element, index) => {
            const percentages = [0.4, 0.1, 0.2, 0.2, 0.1];
            const amount = weekly * percentages[index];
            element.textContent = 'R ' + amount.toLocaleString();
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

        // Add styles
        if (!document.querySelector('.notification-styles')) {
            const styles = document.createElement('style');
            styles.className = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 6px;
                    color: white;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { background: #2ecc71; }
                .notification-error { background: #e74c3c; }
                .notification-info { background: #3498db; }
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});

// Utility functions
function formatCurrency(amount, currency = 'ZAR') {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-ZA').format(number);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Dashboard, formatCurrency, formatNumber };
}
