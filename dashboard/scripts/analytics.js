// Analytics and reporting functionality
class Analytics {
    constructor() {
        this.reports = {};
        this.filters = {
            dateRange: 'last_30_days',
            paymentMethod: 'all',
            courseCategory: 'all'
        };
        this.init();
    }

    init() {
        this.setupFilterListeners();
        this.loadAnalyticsData();
        this.setupReportScheduler();
    }

    setupFilterListeners() {
        // Date range filter
        document.getElementById('dateRange')?.addEventListener('change', (e) => {
            this.filters.dateRange = e.target.value;
            this.applyFilters();
        });

        // Payment method filter
        document.getElementById('paymentMethod')?.addEventListener('change', (e) => {
            this.filters.paymentMethod = e.target.value;
            this.applyFilters();
        });

        // Course category filter
        document.getElementById('courseCategory')?.addEventListener('change', (e) => {
            this.filters.courseCategory = e.target.value;
            this.applyFilters();
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportReport(format);
            });
        });
    }

    async loadAnalyticsData() {
        try {
            const [revenue, students, courses, marketing] = await Promise.all([
                this.fetchRevenueData(),
                this.fetchStudentData(),
                this.fetchCourseData(),
                this.fetchMarketingData()
            ]);

            this.reports = { revenue, students, courses, marketing };
            this.renderAnalytics();
        } catch (error) {
            console.error('Failed to load analytics data:', error);
        }
    }

    async fetchRevenueData() {
        const response = await fetch('/api/analytics/revenue?' + new URLSearchParams(this.filters));
        return await response.json();
    }

    async fetchStudentData() {
        const response = await fetch('/api/analytics/students?' + new URLSearchParams(this.filters));
        return await response.json();
    }

    async fetchCourseData() {
        const response = await fetch('/api/analytics/courses?' + new URLSearchParams(this.filters));
        return await response.json();
    }

    async fetchMarketingData() {
        const response = await fetch('/api/analytics/marketing?' + new URLSearchParams(this.filters));
        return await response.json();
    }

    applyFilters() {
        this.loadAnalyticsData();
    }

    renderAnalytics() {
        this.renderRevenueAnalytics();
        this.renderStudentAnalytics();
        this.renderCourseAnalytics();
        this.renderMarketingAnalytics();
    }

    renderRevenueAnalytics() {
        const revenue = this.reports.revenue;
        if (!revenue) return;

        // Update KPI cards
        this.updateKPICards(revenue.kpis);

        // Render revenue trends chart
        this.renderRevenueTrendsChart(revenue.trends);

        // Render payment methods breakdown
        this.renderPaymentMethodsBreakdown(revenue.paymentMethods);
    }

    renderStudentAnalytics() {
        const students = this.reports.students;
        if (!students) return;

        // Render student growth chart
        this.renderStudentGrowthChart(students.growth);

        // Render geographic distribution
        this.renderGeographicDistribution(students.geography);
    }

    renderCourseAnalytics() {
        const courses = this.reports.courses;
        if (!courses) return;

        // Render course performance
        this.renderCoursePerformance(courses.performance);

        // Render category breakdown
        this.renderCategoryBreakdown(courses.categories);
    }

    renderMarketingAnalytics() {
        const marketing = this.reports.marketing;
        if (!marketing) return;

        // Render marketing channels
        this.renderMarketingChannels(marketing.channels);

        // Render conversion rates
        this.renderConversionRates(marketing.conversions);
    }

    updateKPICards(kpis) {
        const kpiGrid = document.getElementById('kpiGrid');
        if (!kpiGrid) return;

        kpiGrid.innerHTML = Object.entries(kpis).map(([key, value]) => `
            <div class="kpi-card">
                <div class="kpi-label">${this.formatKpiLabel(key)}</div>
                <div class="kpi-value">${this.formatKpiValue(key, value.current)}</div>
                <div class="kpi-change ${value.change >= 0 ? 'positive' : 'negative'}">
                    ${value.change >= 0 ? '↑' : '↓'} ${Math.abs(value.change)}%
                </div>
            </div>
        `).join('');
    }

    formatKpiLabel(key) {
        const labels = {
            totalRevenue: 'Total Revenue',
            averageOrder: 'Average Order',
            conversionRate: 'Conversion Rate',
            customerLifetime: 'Customer Lifetime Value'
        };
        return labels[key] || key;
    }

    formatKpiValue(key, value) {
        if (key.includes('Revenue') || key.includes('Order') || key.includes('Value')) {
            return 'R ' + value.toLocaleString();
        }
        if (key.includes('Rate')) {
            return value + '%';
        }
        return value.toLocaleString();
    }

    renderRevenueTrendsChart(trends) {
        const ctx = document.getElementById('revenueTrendsChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: trends.labels,
                datasets: [{
                    label: 'Revenue',
                    data: trends.data,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
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

    renderPaymentMethodsBreakdown(methods) {
        const ctx = document.getElementById('paymentMethodsChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: methods.labels,
                datasets: [{
                    data: methods.data,
                    backgroundColor: [
                        '#4361ee', '#4cc9f0', '#7209b7', '#f8961e', '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderStudentGrowthChart(growth) {
        const ctx = document.getElementById('studentGrowthChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: growth.labels,
                datasets: [{
                    label: 'New Students',
                    data: growth.data,
                    backgroundColor: '#4cc9f0'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderGeographicDistribution(geography) {
        // This would typically use a map library like Leaflet or Google Maps
        console.log('Rendering geographic distribution:', geography);
    }

    renderCoursePerformance(performance) {
        const ctx = document.getElementById('coursePerformanceChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: performance.labels,
                datasets: [{
                    label: 'Sales',
                    data: performance.data,
                    backgroundColor: '#7209b7'
                }]
            },
            options: {
                responsive: true,
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderCategoryBreakdown(categories) {
        const ctx = document.getElementById('categoryBreakdownChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categories.labels,
                datasets: [{
                    data: categories.data,
                    backgroundColor: [
                        '#4361ee', '#4cc9f0', '#7209b7', '#f8961e', '#2ecc71'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderMarketingChannels(channels) {
        const ctx = document.getElementById('marketingChannelsChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: channels.labels,
                datasets: [{
                    label: 'Performance',
                    data: channels.data,
                    backgroundColor: 'rgba(76, 201, 240, 0.2)',
                    borderColor: '#4cc9f0',
                    pointBackgroundColor: '#4cc9f0'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderConversionRates(conversions) {
        const ctx = document.getElementById('conversionRatesChart')?.getContext('2d');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: conversions.labels,
                datasets: [{
                    label: 'Conversion Rate',
                    data: conversions.data,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    async exportReport(format) {
        try {
            const response = await fetch('/api/analytics/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    format,
                    filters: this.filters,
                    reportType: 'comprehensive'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                this.downloadBlob(blob, `analytics_report.${format}`);
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    }

    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    setupReportScheduler() {
        // Schedule automatic report generation
        this.scheduleDailyReport();
        this.scheduleWeeklyReport();
        this.scheduleMonthlyReport();
    }

    scheduleDailyReport() {
        // Send daily report at 8 AM
        const now = new Date();
        const target = new Date();
        target.setHours(8, 0, 0, 0);
        
        if (now > target) {
            target.setDate(target.getDate() + 1);
        }

        const delay = target.getTime() - now.getTime();
        setTimeout(() => {
            this.generateDailyReport();
            // Repeat every 24 hours
            setInterval(() => this.generateDailyReport(), 24 * 60 * 60 * 1000);
        }, delay);
    }

    scheduleWeeklyReport() {
        // Send weekly report on Monday at 9 AM
        const now = new Date();
        const target = new Date();
        target.setDate(target.getDate() + ((1 + 7 - target.getDay()) % 7));
        target.setHours(9, 0, 0, 0);

        const delay = target.getTime() - now.getTime();
        setTimeout(() => {
            this.generateWeeklyReport();
            // Repeat every 7 days
            setInterval(() => this.generateWeeklyReport(), 7 * 24 * 60 * 60 * 1000);
        }, delay);
    }

    scheduleMonthlyReport() {
        // Send monthly report on 1st at 10 AM
        const now = new Date();
        const target = new Date();
        target.setMonth(target.getMonth() + 1, 1);
        target.setHours(10, 0, 0, 0);

        const delay = target.getTime() - now.getTime();
        setTimeout(() => {
            this.generateMonthlyReport();
            // Schedule next month (approximate)
            setInterval(() => this.generateMonthlyReport(), 30 * 24 * 60 * 60 * 1000);
        }, delay);
    }

    async generateDailyReport() {
        try {
            await fetch('/api/analytics/reports/daily', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    date: new Date().toISOString().split('T')[0]
                })
            });
            console.log('Daily report generated');
        } catch (error) {
            console.error('Failed to generate daily report:', error);
        }
    }

    async generateWeeklyReport() {
        try {
            await fetch('/api/analytics/reports/weekly', {
                method: 'POST'
            });
            console.log('Weekly report generated');
        } catch (error) {
            console.error('Failed to generate weekly report:', error);
        }
    }

    async generateMonthlyReport() {
        try {
            await fetch('/api/analytics/reports/monthly', {
                method: 'POST'
            });
            console.log('Monthly report generated');
        } catch (error) {
            console.error('Failed to generate monthly report:', error);
        }
    }

    // Advanced analytics methods
    calculateCustomerLifetimeValue() {
        const revenue = this.reports.revenue;
        const students = this.reports.students;
        
        if (!revenue || !students) return 0;

        const avgRevenuePerStudent = revenue.total / students.total;
        const retentionRate = students.retentionRate / 100;
        
        return avgRevenuePerStudent * (1 / (1 - retentionRate));
    }

    predictFutureRevenue(days = 30) {
        const trends = this.reports.revenue?.trends;
        if (!trends) return 0;

        const recentGrowth = this.calculateGrowthRate(trends.data.slice(-7));
        const currentRevenue = trends.data[trends.data.length - 1];
        
        return currentRevenue * Math.pow(1 + recentGrowth, days);
    }

    calculateGrowthRate(data) {
        if (data.length < 2) return 0;
        
        const first = data[0];
        const last = data[data.length - 1];
        
        return (last - first) / first;
    }

    identifyTrends() {
        const trends = this.reports.revenue?.trends;
        if (!trends) return [];

        const alerts = [];

        // Check for significant changes
        const recentData = trends.data.slice(-7);
        const previousData = trends.data.slice(-14, -7);
        
        const recentAvg = recentData.reduce((a, b) => a + b, 0) / recentData.length;
        const previousAvg = previousData.reduce((a, b) => a + b, 0) / previousData.length;
        
        const change = ((recentAvg - previousAvg) / previousAvg) * 100;
        
        if (Math.abs(change) > 20) {
            alerts.push({
                type: change > 0 ? 'positive' : 'negative',
                message: `Revenue ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to previous week`,
                severity: Math.abs(change) > 50 ? 'high' : 'medium'
            });
        }

        return alerts;
    }
}

// Initialize analytics when dashboard loads
if (window.dashboard) {
    window.dashboard.analytics = new Analytics();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Analytics };
}
