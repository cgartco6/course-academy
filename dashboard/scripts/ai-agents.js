// AI Agents Management
class AIAgentsManager {
    constructor() {
        this.agents = {};
        this.agentLogs = {};
        this.init();
    }

    async init() {
        await this.loadAgents();
        this.setupAgentControls();
        this.startAgentMonitoring();
    }

    async loadAgents() {
        try {
            const response = await fetch('/api/ai-agents');
            this.agents = await response.json();
            this.renderAgents();
        } catch (error) {
            console.error('Failed to load AI agents:', error);
        }
    }

    renderAgents() {
        const grid = document.getElementById('agentsGrid');
        if (!grid) return;

        grid.innerHTML = Object.values(this.agents).map(agent => `
            <div class="agent-card" data-agent-id="${agent.id}">
                <div class="agent-header">
                    <div class="agent-title">${agent.name}</div>
                    <div class="agent-status status-${agent.status}">
                        ${agent.status.toUpperCase()}
                    </div>
                </div>
                <div class="agent-description">${agent.description}</div>
                
                <div class="agent-metrics">
                    <div class="metric">
                        <span class="metric-label">Progress:</span>
                        <span class="metric-value">${agent.progress}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Success Rate:</span>
                        <span class="metric-value">${agent.successRate}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Uptime:</span>
                        <span class="metric-value">${this.formatUptime(agent.uptime)}</span>
                    </div>
                </div>

                <div class="agent-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${agent.progress}%"></div>
                    </div>
                    <div class="progress-text">
                        <span>${agent.current}/${agent.target} ${agent.unit}</span>
                        <span>${agent.progress}%</span>
                    </div>
                </div>

                <div class="agent-performance">
                    <div class="performance-metric">
                        <div class="metric-circle" style="--percentage: ${agent.efficiency}">
                            <span>${agent.efficiency}%</span>
                        </div>
                        <label>Efficiency</label>
                    </div>
                    <div class="performance-metric">
                        <div class="metric-circle" style="--percentage: ${agent.accuracy}">
                            <span>${agent.accuracy}%</span>
                        </div>
                        <label>Accuracy</label>
                    </div>
                </div>

                <div class="agent-actions">
                    <button class="btn-small btn-primary" 
                            onclick="aiAgents.startAgent('${agent.id}')"
                            ${agent.status === 'active' ? 'disabled' : ''}>
                        ▶ Start
                    </button>
                    <button class="btn-small btn-warning"
                            onclick="aiAgents.stopAgent('${agent.id}')"
                            ${agent.status !== 'active' ? 'disabled' : ''}>
                        ⏹ Stop
                    </button>
                    <button class="btn-small btn-info"
                            onclick="aiAgents.viewLogs('${agent.id}')">
                        📋 Logs
                    </button>
                    <button class="btn-small btn-danger"
                            onclick="aiAgents.deleteAgent('${agent.id}')">
                        🗑 Delete
                    </button>
                </div>

                <div class="agent-last-run">
                    Last run: ${this.formatDate(agent.lastRun)}
                </div>
            </div>
        `).join('');
    }

    setupAgentControls() {
        // Deploy new agent modal
        this.setupDeployModal();
        
        // Agent configuration
        this.setupAgentConfig();
    }

    setupDeployModal() {
        // Create deploy modal HTML
        const modalHTML = `
            <div id="deployModal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>Deploy New AI Agent</h2>
                    
                    <form id="deployForm">
                        <div class="form-group">
                            <label>Agent Type:</label>
                            <select name="agentType" required>
                                <option value="">Select Agent Type</option>
                                <option value="student_acquisition">Student Acquisition</option>
                                <option value="content_creation">Content Creation</option>
                                <option value="social_posting">Social Media Posting</option>
                                <option value="marketing_analysis">Marketing Analysis</option>
                                <option value="support_chatbot">Support Chatbot</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Agent Name:</label>
                            <input type="text" name="agentName" required 
                                   placeholder="e.g., Student Acquisition Bot v2">
                        </div>

                        <div class="form-group">
                            <label>Target Goal:</label>
                            <input type="number" name="target" required 
                                   placeholder="e.g., 2000">
                        </div>

                        <div class="form-group">
                            <label>Timeframe (days):</label>
                            <input type="number" name="timeframe" required 
                                   value="7" min="1" max="30">
                        </div>

                        <div class="form-group">
                            <label>Configuration:</label>
                            <textarea name="configuration" rows="4" 
                                      placeholder='{"platforms": ["tiktok", "instagram"], "budget": 5000}'></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="this.closeDeployModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Deploy Agent</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Form submission
        document.getElementById('deployForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDeployForm(e.target);
        });
    }

    async handleDeployForm(form) {
        const formData = new FormData(form);
        const data = {
            type: formData.get('agentType'),
            name: formData.get('agentName'),
            target: parseInt(formData.get('target')),
            timeframe: parseInt(formData.get('timeframe')),
            configuration: JSON.parse(formData.get('configuration') || '{}')
        };

        try {
            const response = await fetch('/api/ai-agents/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('AI agent deployed successfully!', 'success');
                this.closeDeployModal();
                this.loadAgents(); // Refresh the list
            } else {
                this.showNotification('Failed to deploy agent: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Deployment failed:', error);
            this.showNotification('Deployment failed', 'error');
        }
    }

    openDeployModal() {
        document.getElementById('deployModal').style.display = 'block';
    }

    closeDeployModal() {
        document.getElementById('deployModal').style.display = 'none';
        document.getElementById('deployForm').reset();
    }

    setupAgentConfig() {
        // Configuration for different agent types
        this.agentConfigs = {
            student_acquisition: {
                description: "Acquires new students through targeted campaigns",
                defaultTarget: 2000,
                defaultTimeframe: 7,
                metrics: ['conversion_rate', 'cost_per_acquisition', 'ROI']
            },
            content_creation: {
                description: "Creates and optimizes marketing content",
                defaultTarget: 50,
                defaultTimeframe: 30,
                metrics: ['content_quality', 'engagement_rate', 'production_speed']
            },
            social_posting: {
                description: "Automates social media posting across platforms",
                defaultTarget: 100,
                defaultTimeframe: 7,
                metrics: ['reach', 'engagement', 'follower_growth']
            },
            marketing_analysis: {
                description: "Analyzes marketing performance and provides insights",
                defaultTarget: 10,
                defaultTimeframe: 1,
                metrics: ['insight_accuracy', 'recommendation_quality', 'analysis_speed']
            }
        };
    }

    async startAgent(agentId) {
        try {
            const response = await fetch(`/api/ai-agents/${agentId}/start`, {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Agent started successfully', 'success');
                this.loadAgents(); // Refresh status
            } else {
                this.showNotification('Failed to start agent: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Failed to start agent:', error);
            this.showNotification('Failed to start agent', 'error');
        }
    }

    async stopAgent(agentId) {
        try {
            const response = await fetch(`/api/ai-agents/${agentId}/stop`, {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('Agent stopped successfully', 'success');
                this.loadAgents(); // Refresh status
            } else {
                this.showNotification('Failed to stop agent: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Failed to stop agent:', error);
            this.showNotification('Failed to stop agent', 'error');
        }
    }

    async viewLogs(agentId) {
        try {
            const response = await fetch(`/api/ai-agents/${agentId}/logs`);
            const logs = await response.json();
            
            this.showLogsModal(agentId, logs);
        } catch (error) {
            console.error('Failed to load logs:', error);
            this.showNotification('Failed to load agent logs', 'error');
        }
    }

    showLogsModal(agentId, logs) {
        const modalHTML = `
            <div id="logsModal" class="modal">
                <div class="modal-content large">
                    <span class="close">&times;</span>
                    <h2>Agent Logs - ${this.agents[agentId]?.name}</h2>
                    
                    <div class="logs-controls">
                        <button onclick="aiAgents.downloadLogs('${agentId}')" class="btn-primary">
                            📥 Download Logs
                        </button>
                        <button onclick="aiAgents.clearLogs('${agentId}')" class="btn-warning">
                            🗑 Clear Logs
                        </button>
                        <select onchange="aiAgents.filterLogs('${agentId}', this.value)">
                            <option value="all">All Levels</option>
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>

                    <div class="logs-container">
                        ${logs.map(log => `
                            <div class="log-entry log-${log.level}">
                                <span class="log-time">${this.formatDate(log.timestamp)}</span>
                                <span class="log-level">${log.level.toUpperCase()}</span>
                                <span class="log-message">${log.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('logsModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('logsModal').style.display = 'block';

        // Add close functionality
        document.querySelector('#logsModal .close').addEventListener('click', () => {
            document.getElementById('logsModal').style.display = 'none';
        });
    }

    async downloadLogs(agentId) {
        try {
            const response = await fetch(`/api/ai-agents/${agentId}/logs/download`);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `agent_${agentId}_logs_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download logs:', error);
            this.showNotification('Failed to download logs', 'error');
        }
    }

    async clearLogs(agentId) {
        if (confirm('Are you sure you want to clear all logs for this agent?')) {
            try {
                await fetch(`/api/ai-agents/${agentId}/logs`, {
                    method: 'DELETE'
                });
                
                this.showNotification('Logs cleared successfully', 'success');
                this.viewLogs(agentId); // Refresh the view
            } catch (error) {
                console.error('Failed to clear logs:', error);
                this.showNotification('Failed to clear logs', 'error');
            }
        }
    }

    filterLogs(agentId, level) {
        const logEntries = document.querySelectorAll('.log-entry');
        logEntries.forEach(entry => {
            if (level === 'all' || entry.classList.contains(`log-${level}`)) {
                entry.style.display = 'flex';
            } else {
                entry.style.display = 'none';
            }
        });
    }

    async deleteAgent(agentId) {
        const agent = this.agents[agentId];
        if (!agent) return;

        if (confirm(`Are you sure you want to delete agent "${agent.name}"? This action cannot be undone.`)) {
            try {
                const response = await fetch(`/api/ai-agents/${agentId}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    this.showNotification('Agent deleted successfully', 'success');
                    this.loadAgents(); // Refresh the list
                } else {
                    this.showNotification('Failed to delete agent: ' + result.message, 'error');
                }
            } catch (error) {
                console.error('Failed to delete agent:', error);
                this.showNotification('Failed to delete agent', 'error');
            }
        }
    }

    startAgentMonitoring() {
        // Monitor agent performance and update UI in real-time
        setInterval(() => {
            this.updateAgentPerformance();
        }, 10000); // Update every 10 seconds
    }

    async updateAgentPerformance() {
        try {
            const response = await fetch('/api/ai-agents/performance');
            const performance = await response.json();
            
            this.updateAgentUI(performance);
        } catch (error) {
            console.error('Failed to update agent performance:', error);
        }
    }

    updateAgentUI(performance) {
        Object.entries(performance).forEach(([agentId, data]) => {
            const agentCard = document.querySelector(`[data-agent-id="${agentId}"]`);
            if (!agentCard) return;

            // Update progress
            const progressFill = agentCard.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = data.progress + '%';
            }

            // Update progress text
            const progressText = agentCard.querySelector('.progress-text span:first-child');
            if (progressText) {
                progressText.textContent = `${data.current}/${data.target} ${data.unit}`;
            }

            // Update metrics
            const metrics = agentCard.querySelectorAll('.metric-value');
            if (metrics[0]) metrics[0].textContent = data.progress + '%';
            if (metrics[1]) metrics[1].textContent = data.successRate + '%';
            if (metrics[2]) metrics[2].textContent = this.formatUptime(data.uptime);

            // Update performance circles
            const efficiencyCircle = agentCard.querySelector('.performance-metric:first-child .metric-circle');
            const accuracyCircle = agentCard.querySelector('.performance-metric:last-child .metric-circle');
            
            if (efficiencyCircle) {
                efficiencyCircle.style.setProperty('--percentage', data.efficiency);
                efficiencyCircle.querySelector('span').textContent = data.efficiency + '%';
            }
            if (accuracyCircle) {
                accuracyCircle.style.setProperty('--percentage', data.accuracy);
                accuracyCircle.querySelector('span').textContent = data.accuracy + '%';
            }
        });
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    showNotification(message, type = 'info') {
        // Reuse the notification system from dashboard.js
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification(message, type);
        } else {
            alert(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Advanced agent analytics
    analyzeAgentPerformance() {
        const analysis = {};
        
        Object.values(this.agents).forEach(agent => {
            analysis[agent.id] = {
                efficiency: this.calculateEfficiency(agent),
                roi: this.calculateROI(agent),
                recommendations: this.generateRecommendations(agent)
            };
        });

        return analysis;
    }

    calculateEfficiency(agent) {
        // Simple efficiency calculation based on progress vs time
        const expectedProgress = (Date.now() - new Date(agent.createdAt).getTime()) / 
                               (agent.timeframe * 24 * 60 * 60 * 1000) * 100;
        
        const actualProgress = agent.progress;
        
        return Math.min(100, (actualProgress / expectedProgress) * 100);
    }

    calculateROI(agent) {
        // Calculate return on investment
        if (!agent.cost) return 0;
        
        const revenue = agent.revenue || 0;
        return ((revenue - agent.cost) / agent.cost) * 100;
    }

    generateRecommendations(agent) {
        const recommendations = [];
        
        if (agent.efficiency < 70) {
            recommendations.push("Consider increasing budget or optimizing targeting parameters");
        }
        
        if (agent.successRate < 80) {
            recommendations.push("Review and improve the agent's decision-making algorithm");
        }
        
        if (agent.uptime < 0.95) {
            recommendations.push("Check for stability issues and implement better error handling");
        }
        
        return recommendations.length > 0 ? recommendations : ["Agent performing well. No changes needed."];
    }
}

// Initialize AI Agents Manager
document.addEventListener('DOMContentLoaded', () => {
    window.aiAgents = new AIAgentsManager();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIAgentsManager };
}
