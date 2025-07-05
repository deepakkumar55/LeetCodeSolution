class LuckyIntegerSolver {
    constructor() {
        this.frequencyMap = new Map();
        this.luckyNumbers = [];
        this.steps = [];
        this.performanceMetrics = {
            executionTime: 0,
            memoryUsage: 0,
            operationsCount: 0
        };
    }

    // Main solution function
    solve(arr) {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        this.reset();
        this.steps = [];
        
        // Step 1: Count frequencies
        this.countFrequencies(arr);
        
        // Step 2: Find lucky numbers
        this.findLuckyNumbers();
        
        // Step 3: Return maximum lucky number
        const result = this.getMaxLuckyNumber();
        
        // Record performance
        this.recordPerformanceMetrics(startTime, startMemory);
        
        return result;
    }

    reset() {
        this.frequencyMap.clear();
        this.luckyNumbers = [];
        this.steps = [];
    }

    countFrequencies(arr) {
        this.steps.push({
            step: 1,
            title: 'Count Frequencies',
            description: 'Counting frequency of each number in the array',
            data: [...arr],
            action: 'initialize'
        });

        for (let i = 0; i < arr.length; i++) {
            const num = arr[i];
            const currentCount = this.frequencyMap.get(num) || 0;
            this.frequencyMap.set(num, currentCount + 1);
            
            this.steps.push({
                step: i + 2,
                title: `Process Element ${i + 1}`,
                description: `Processing number ${num}`,
                data: [...arr],
                currentIndex: i,
                frequency: new Map(this.frequencyMap),
                action: 'count'
            });
        }

        this.steps.push({
            step: arr.length + 2,
            title: 'Frequency Count Complete',
            description: 'All frequencies have been counted',
            frequency: new Map(this.frequencyMap),
            action: 'complete_count'
        });
    }

    findLuckyNumbers() {
        this.steps.push({
            step: this.steps.length + 1,
            title: 'Find Lucky Numbers',
            description: 'Checking each number to see if frequency equals value',
            frequency: new Map(this.frequencyMap),
            action: 'find_lucky_start'
        });

        for (const [num, count] of this.frequencyMap) {
            const isLucky = num === count;
            
            if (isLucky) {
                this.luckyNumbers.push(num);
            }
            
            this.steps.push({
                step: this.steps.length + 1,
                title: `Check Number ${num}`,
                description: `Number ${num} appears ${count} times. ${isLucky ? 'Lucky! 🍀' : 'Not lucky.'}`,
                frequency: new Map(this.frequencyMap),
                currentNumber: num,
                currentCount: count,
                isLucky: isLucky,
                luckyNumbers: [...this.luckyNumbers],
                action: 'check_lucky'
            });
        }

        this.steps.push({
            step: this.steps.length + 1,
            title: 'Lucky Numbers Found',
            description: `Found ${this.luckyNumbers.length} lucky numbers: ${this.luckyNumbers.length ? this.luckyNumbers.join(', ') : 'none'}`,
            luckyNumbers: [...this.luckyNumbers],
            action: 'find_lucky_complete'
        });
    }

    getMaxLuckyNumber() {
        if (this.luckyNumbers.length === 0) {
            this.steps.push({
                step: this.steps.length + 1,
                title: 'Final Result',
                description: 'No lucky numbers found, returning -1',
                result: -1,
                action: 'final_result'
            });
            return -1;
        }

        const maxLucky = Math.max(...this.luckyNumbers);
        this.steps.push({
            step: this.steps.length + 1,
            title: 'Final Result',
            description: `Maximum lucky number is ${maxLucky}`,
            result: maxLucky,
            luckyNumbers: [...this.luckyNumbers],
            action: 'final_result'
        });
        
        return maxLucky;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }

    recordPerformanceMetrics(startTime, startMemory) {
        this.performanceMetrics.executionTime = performance.now() - startTime;
        this.performanceMetrics.memoryUsage = this.getMemoryUsage() - startMemory;
        this.performanceMetrics.operationsCount = this.steps.length;
    }

    getFrequencyMap() {
        return new Map(this.frequencyMap);
    }

    getLuckyNumbers() {
        return [...this.luckyNumbers];
    }

    getSteps() {
        return [...this.steps];
    }

    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
}

// Enhanced UI Controller
class UIController {
    constructor() {
        this.solver = new LuckyIntegerSolver();
        this.isAnimating = false;
        this.currentStepIndex = 0;
        this.animationSpeed = 1;
        this.currentViewMode = 'both';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-solve with debouncing
        const arrayInput = document.getElementById('array-input');
        arrayInput.addEventListener('input', this.debounce(() => {
            this.updateInputPreview();
            this.validateAndSolve();
        }, 300));

        // Initial load
        this.updateInputPreview();
        this.validateAndSolve();
    }

    debounce(func, wait) {
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

    updateInputPreview() {
        const arrayInput = document.getElementById('array-input');
        const inputPreview = document.getElementById('input-preview');
        
        try {
            const arr = this.parseArrayInput(arrayInput.value);
            if (arr.length > 0) {
                inputPreview.innerHTML = `
                    <div class="preview-header">Array Preview:</div>
                    <div class="preview-array">
                        ${arr.map(num => `<span class="preview-item">${num}</span>`).join('')}
                    </div>
                    <div class="preview-stats">
                        Length: ${arr.length} | Unique: ${new Set(arr).size} | Range: ${Math.min(...arr)}-${Math.max(...arr)}
                    </div>
                `;
                inputPreview.classList.add('active');
            } else {
                inputPreview.classList.remove('active');
            }
        } catch (error) {
            inputPreview.classList.remove('active');
        }
    }

    parseArrayInput(input) {
        if (!input.trim()) return [];
        
        const numbers = input.split(',').map(s => {
            const num = parseInt(s.trim());
            if (isNaN(num) || num < 1 || num > 500) {
                throw new Error('Invalid number');
            }
            return num;
        });
        
        if (numbers.length > 500) {
            throw new Error('Array too large');
        }
        
        return numbers;
    }

    validateAndSolve() {
        const arrayInput = document.getElementById('array-input');
        
        if (arrayInput.value.trim()) {
            try {
                const arr = this.parseArrayInput(arrayInput.value);
                if (arr.length > 0) {
                    this.solveLuckyInteger();
                }
            } catch (error) {
                // Invalid input, don't solve
            }
        }
    }

    async solveLuckyInteger() {
        const solveBtn = document.querySelector('.solve-btn');
        const arrayInput = document.getElementById('array-input');
        
        try {
            // Show loading state
            solveBtn.classList.add('loading');
            this.showProgress();

            const arr = this.parseArrayInput(arrayInput.value);
            
            // Solve with animation
            await this.animatedSolve(arr);
            
            this.showToast('Solution completed successfully!', 'success');
            
        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            solveBtn.classList.remove('loading');
            this.hideProgress();
        }
    }

    async animatedSolve(arr) {
        const result = this.solver.solve(arr);
        const steps = this.solver.getSteps();
        const metrics = this.solver.getPerformanceMetrics();
        const frequencyMap = this.solver.getFrequencyMap();
        const luckyNumbers = this.solver.getLuckyNumbers();

        // Update performance metrics
        this.updatePerformanceMetrics(metrics);

        // Update result details
        this.updateResultDetails(arr, frequencyMap, luckyNumbers);

        // Display result with animation
        await this.animateResult(result);

        // Display frequency analysis
        await this.displayFrequencyAnalysis(frequencyMap, luckyNumbers);

        // Display steps with animation
        await this.displayStepsAnimated(steps);
    }

    updatePerformanceMetrics(metrics) {
        document.getElementById('execution-time').textContent = `${metrics.executionTime.toFixed(2)}ms`;
        document.getElementById('memory-usage').textContent = `${(Math.max(metrics.memoryUsage, 0) / 1024).toFixed(2)}KB`;
        document.getElementById('operations-count').textContent = metrics.operationsCount;
    }

    updateResultDetails(arr, frequencyMap, luckyNumbers) {
        document.getElementById('array-length').textContent = arr.length;
        document.getElementById('unique-count').textContent = frequencyMap.size;
        document.getElementById('lucky-count').textContent = luckyNumbers.length;
    }

    async animateResult(result) {
        const resultValue = document.getElementById('result-value');
        
        // Animate result appearance
        resultValue.style.transform = 'scale(0)';
        resultValue.style.opacity = '0';
        
        await this.delay(100);
        
        resultValue.textContent = result;
        resultValue.style.transform = 'scale(1)';
        resultValue.style.opacity = '1';
        resultValue.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }

    async displayFrequencyAnalysis(frequencyMap, luckyNumbers) {
        const frequencyTable = document.getElementById('frequency-table');
        const frequencyChart = document.getElementById('frequency-chart');
        
        // Create frequency table
        this.createFrequencyTable(frequencyTable, frequencyMap, luckyNumbers);
        
        // Create frequency chart
        this.createFrequencyChart(frequencyChart, frequencyMap, luckyNumbers);
    }

    createFrequencyTable(container, frequencyMap, luckyNumbers) {
        const luckySet = new Set(luckyNumbers);
        
        let html = `
            <h3>Frequency Table</h3>
            <div class="table-header">
                <div>Number</div>
                <div>Frequency</div>
                <div>Status</div>
            </div>
        `;
        
        for (const [num, count] of [...frequencyMap].sort((a, b) => a[0] - b[0])) {
            const isLucky = luckySet.has(num);
            html += `
                <div class="table-row ${isLucky ? 'lucky' : ''}">
                    <div>${num}</div>
                    <div>${count}</div>
                    <div>${isLucky ? '🍀 Lucky' : 'Not Lucky'}</div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    createFrequencyChart(container, frequencyMap, luckyNumbers) {
        const luckySet = new Set(luckyNumbers);
        const maxCount = Math.max(...frequencyMap.values());
        
        let html = `
            <h3>Frequency Chart</h3>
            <div class="chart-container">
        `;
        
        for (const [num, count] of [...frequencyMap].sort((a, b) => a[0] - b[0])) {
            const isLucky = luckySet.has(num);
            const height = (count / maxCount) * 200;
            
            html += `
                <div class="chart-bar ${isLucky ? 'lucky' : ''}" style="height: ${height}px;">
                    <div class="bar-value">${count}</div>
                    <div class="bar-label">${num}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        container.innerHTML = html;
    }

    async displayStepsAnimated(steps) {
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = '';

        for (let i = 0; i < steps.length; i++) {
            await this.createStepElement(steps[i], i);
            await this.delay(150);
        }
    }

    async createStepElement(step, index) {
        const stepsContainer = document.getElementById('steps-container');
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        stepElement.style.opacity = '0';
        stepElement.style.transform = 'translateX(-30px)';

        const headerHtml = `
            <div class="step-header">
                <div class="step-number">${step.step}</div>
                <div class="step-title">${step.title}</div>
            </div>
        `;

        let contentHtml = `
            <div class="step-content">
                <div class="step-description">${step.description}</div>
        `;

        // Add specific content based on step action
        if (step.action === 'initialize' || step.action === 'count') {
            if (step.data) {
                contentHtml += `
                    <div class="step-data">
                        <strong>Array:</strong> [${step.data.join(', ')}]
                        ${step.currentIndex !== undefined ? `<br><strong>Current Index:</strong> ${step.currentIndex}` : ''}
                    </div>
                `;
            }
        }

        if (step.frequency) {
            contentHtml += `
                <div class="step-frequency">
                    <strong>Frequency Map:</strong>
                    <div class="frequency-items">
                        ${[...step.frequency].map(([num, count]) => 
                            `<span class="freq-item">${num}:${count}</span>`
                        ).join('')}
                    </div>
                </div>
            `;
        }

        if (step.action === 'check_lucky') {
            contentHtml += `
                <div class="step-check">
                    <strong>Check:</strong> ${step.currentNumber} appears ${step.currentCount} times
                    ${step.isLucky ? ' → <span class="lucky-text">🍀 Lucky!</span>' : ' → Not lucky'}
                </div>
            `;
        }

        if (step.luckyNumbers && step.luckyNumbers.length > 0) {
            contentHtml += `
                <div class="step-lucky">
                    <strong>Lucky Numbers Found:</strong> [${step.luckyNumbers.join(', ')}]
                </div>
            `;
        }

        if (step.result !== undefined) {
            contentHtml += `
                <div class="step-result">
                    <strong>Final Result:</strong> ${step.result}
                </div>
            `;
        }

        contentHtml += `</div>`;

        stepElement.innerHTML = headerHtml + contentHtml;
        stepsContainer.appendChild(stepElement);

        // Animate appearance
        await this.delay(50);
        stepElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        stepElement.style.opacity = '1';
        stepElement.style.transform = 'translateX(0)';
    }

    showProgress() {
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressSection.classList.add('active');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Analyzing... ${Math.round(progress)}%`;
        }, 100);
    }

    hideProgress() {
        const progressSection = document.getElementById('progress-section');
        setTimeout(() => {
            progressSection.classList.remove('active');
        }, 1000);
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    loadExample(exampleNumber) {
        const arrayInput = document.getElementById('array-input');

        switch (exampleNumber) {
            case 1:
                arrayInput.value = '2,2,3,4';
                break;
            case 2:
                arrayInput.value = '1,2,2,3,3,3';
                break;
            case 3:
                arrayInput.value = '2,2,2,3,3';
                break;
            default:
                arrayInput.value = '2,2,3,4';
        }

        this.updateInputPreview();
        setTimeout(() => this.solveLuckyInteger(), 100);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Animation Controls
function playAnimation() {
    console.log('Play animation');
}

function pauseAnimation() {
    console.log('Pause animation');
}

function resetAnimation() {
    console.log('Reset animation');
}

// View Mode Change
function changeViewMode() {
    const viewMode = document.getElementById('view-mode').value;
    const frequencyTable = document.getElementById('frequency-table');
    const frequencyChart = document.getElementById('frequency-chart');
    const analysisContainer = document.querySelector('.analysis-container');
    
    switch (viewMode) {
        case 'frequency':
            analysisContainer.style.gridTemplateColumns = '1fr';
            frequencyTable.style.display = 'block';
            frequencyChart.style.display = 'none';
            break;
        case 'chart':
            analysisContainer.style.gridTemplateColumns = '1fr';
            frequencyTable.style.display = 'none';
            frequencyChart.style.display = 'block';
            break;
        case 'both':
            analysisContainer.style.gridTemplateColumns = '1fr 1fr';
            frequencyTable.style.display = 'block';
            frequencyChart.style.display = 'block';
            break;
    }
}

// Hint Toggle
function toggleHint(hintNumber) {
    const hintCard = event.currentTarget;
    hintCard.classList.toggle('active');
}

// Global functions for backward compatibility
let uiController;

function solveLuckyInteger() {
    uiController.solveLuckyInteger();
}

function loadExample(exampleNumber) {
    uiController.loadExample(exampleNumber);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    uiController = new UIController();
    
    // Load first example by default
    setTimeout(() => {
        uiController.loadExample(1);
    }, 500);
});
