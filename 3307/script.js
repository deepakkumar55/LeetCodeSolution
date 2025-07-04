class StringGameSolver {
    constructor() {
        this.steps = [];
        this.currentWord = 'a';
        this.animationSpeed = 1;
        this.isAnimating = false;
        this.currentStepIndex = 0;
        this.performanceMetrics = {
            executionTime: 0,
            memoryUsage: 0,
            stringLength: 0
        };
    }

    // Helper function to get next character
    getNextChar(char) {
        return char === 'z' ? 'a' : String.fromCharCode(char.charCodeAt(0) + 1);
    }

    // Transform string for operation 1
    transformString(str) {
        return str.split('').map(char => this.getNextChar(char)).join('');
    }

    // Solve with performance tracking
    solve(k, operations) {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        this.steps = [];
        this.currentWord = 'a';
        
        // Add initial step
        this.steps.push({
            step: 0,
            operation: 'Initial',
            word: this.currentWord,
            length: this.currentWord.length,
            description: 'Starting with word = "a"'
        });

        // Process each operation
        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            let newPart = '';
            let description = '';
            
            if (operation === 0) {
                // Append copy of current word
                newPart = this.currentWord;
                this.currentWord = this.currentWord + newPart;
                description = `Appended copy of "${newPart.length > 50 ? newPart.substring(0, 50) + '...' : newPart}"`;
            } else {
                // Transform and append
                newPart = this.transformString(this.currentWord);
                this.currentWord = this.currentWord + newPart;
                description = `Transformed and appended "${newPart.length > 50 ? newPart.substring(0, 50) + '...' : newPart}"`;
            }

            this.steps.push({
                step: i + 1,
                operation: operation,
                word: this.currentWord.length > 1000 ? 
                      this.currentWord.substring(0, 1000) + '...' : 
                      this.currentWord,
                actualLength: this.currentWord.length,
                length: this.currentWord.length,
                newPart: newPart.length > 100 ? 
                        newPart.substring(0, 100) + '...' : 
                        newPart,
                description: description
            });

            // Optimization: if word is getting too long, use mathematical approach
            if (this.currentWord.length > 100000) {
                const optimizedResult = this.solveOptimized(k, operations);
                this.recordPerformanceMetrics(startTime, startMemory, this.currentWord.length);
                return optimizedResult;
            }
        }

        const result = k <= this.currentWord.length ? this.currentWord[k - 1] : null;
        this.recordPerformanceMetrics(startTime, startMemory, this.currentWord.length);
        return result;
    }

    // Record performance metrics
    recordPerformanceMetrics(startTime, startMemory, finalLength) {
        this.performanceMetrics.executionTime = performance.now() - startTime;
        this.performanceMetrics.memoryUsage = this.getMemoryUsage() - startMemory;
        this.performanceMetrics.stringLength = finalLength;
    }

    // Estimate memory usage
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize;
        }
        return 0; // Fallback if not supported
    }

    // Optimized solution for large k values
    solveOptimized(k, operations) {
        let position = k - 1; // Convert to 0-indexed
        let increment = 0;
        
        // Work backwards through operations
        for (let i = operations.length - 1; i >= 0; i--) {
            const op = operations[i];
            const lengthBefore = Math.pow(2, i + 1);
            
            if (position >= lengthBefore / 2) {
                // Character is in the second half
                position -= lengthBefore / 2;
                if (op === 1) {
                    increment++;
                }
            }
        }
        
        // Calculate final character
        let baseChar = 'a';
        let charCode = baseChar.charCodeAt(0);
        charCode = ((charCode - 97 + increment) % 26) + 97;
        
        return String.fromCharCode(charCode);
    }

    getSteps() {
        return this.steps;
    }

    getPerformanceMetrics() {
        return this.performanceMetrics;
    }
}

// Enhanced UI Controller
class UIController {
    constructor() {
        this.solver = new StringGameSolver();
        this.isAnimating = false;
        this.animationTimer = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auto-solve with debouncing
        const inputs = [
            document.getElementById('k-input'),
            document.getElementById('operations-input')
        ];

        inputs.forEach(input => {
            input.addEventListener('input', this.debounce(() => {
                this.validateAndSolve();
            }, 500));
        });

        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.solver.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = `${e.target.value}x`;
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.solveGame();
            }
        });
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

    validateAndSolve() {
        const kInput = document.getElementById('k-input');
        const operationsInput = document.getElementById('operations-input');
        
        if (kInput.value.trim() && operationsInput.value.trim()) {
            this.solveGame();
        }
    }

    async solveGame() {
        const solveBtn = document.querySelector('.solve-btn');
        const kInput = document.getElementById('k-input');
        const operationsInput = document.getElementById('operations-input');
        
        // Show loading state
        solveBtn.classList.add('loading');
        this.showProgress();

        try {
            const k = parseInt(kInput.value);
            const operationsStr = operationsInput.value.trim();
            
            // Validation
            if (!k || k < 1) {
                throw new Error('Please enter a valid k value (≥ 1)');
            }

            if (!operationsStr) {
                throw new Error('Please enter operations');
            }

            const operations = operationsStr.split(',').map(op => {
                const num = parseInt(op.trim());
                if (num !== 0 && num !== 1) {
                    throw new Error('Operations must be 0 or 1');
                }
                return num;
            });

            // Update header stats
            this.updateHeaderStats(k, operations);

            // Solve with animation
            await this.animatedSolve(k, operations);

            this.showToast('Solution completed successfully!', 'success');

        } catch (error) {
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            solveBtn.classList.remove('loading');
            this.hideProgress();
        }
    }

    async animatedSolve(k, operations) {
        const result = this.solver.solve(k, operations);
        const steps = this.solver.getSteps();
        const metrics = this.solver.getPerformanceMetrics();

        // Update performance metrics
        this.updatePerformanceMetrics(metrics);

        // Display result
        await this.animateResult(result, k, operations);

        // Display steps with animation
        await this.displayStepsAnimated(steps, k);
    }

    updateHeaderStats(k, operations) {
        document.getElementById('complexity-time').textContent = `O(${operations.length})`;
        document.getElementById('complexity-space').textContent = 'O(1)';
        document.getElementById('operations-count').textContent = operations.length;
    }

    updatePerformanceMetrics(metrics) {
        document.getElementById('execution-time').textContent = `${metrics.executionTime.toFixed(2)}ms`;
        document.getElementById('memory-usage').textContent = `${(metrics.memoryUsage / 1024).toFixed(2)}KB`;
        document.getElementById('string-length').textContent = metrics.stringLength.toLocaleString();
    }

    async animateResult(result, k, operations) {
        const resultValue = document.getElementById('result-value');
        const positionValue = document.getElementById('position-value');
        const lengthValue = document.getElementById('length-value');
        const opsValue = document.getElementById('ops-value');

        // Animate result appearance
        resultValue.style.transform = 'scale(0)';
        resultValue.style.opacity = '0';
        
        setTimeout(() => {
            resultValue.textContent = result || 'N/A';
            resultValue.style.transform = 'scale(1)';
            resultValue.style.opacity = '1';
            resultValue.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }, 100);

        // Update details
        positionValue.textContent = k;
        lengthValue.textContent = this.solver.currentWord.length.toLocaleString();
        opsValue.textContent = operations.join(', ');
    }

    async displayStepsAnimated(steps, k) {
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = '';

        for (let i = 0; i < steps.length; i++) {
            await this.createStepElement(steps[i], i);
            await this.delay(200 / this.solver.animationSpeed);
        }

        // Add final result step
        await this.createFinalStep(k);
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
                <div class="step-operation">
                    ${step.operation === 'Initial' ? 'Initial State' : 
                      step.operation === 0 ? 'Operation 0: Append Copy' : 
                      'Operation 1: Transform & Append'}
                </div>
            </div>
        `;

        let contentHtml = '';
        if (step.operation === 'Initial') {
            contentHtml = `
                <div class="step-content">
                    <strong>Description:</strong> ${step.description}
                    <br><strong>Word:</strong> "${step.word}"
                    <br><strong>Length:</strong> ${step.length}
                </div>
            `;
        } else {
            contentHtml = `
                <div class="step-content">
                    <strong>Description:</strong> ${step.description}
                    <br><strong>Word:</strong> "${step.word}"
                    <br><strong>Length:</strong> ${step.length.toLocaleString()}
                    ${step.newPart ? `<br><strong>Added:</strong> "${step.newPart}"` : ''}
                </div>
            `;
        }

        stepElement.innerHTML = headerHtml + contentHtml;
        stepsContainer.appendChild(stepElement);

        // Animate appearance
        await this.delay(50);
        stepElement.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        stepElement.style.opacity = '1';
        stepElement.style.transform = 'translateX(0)';
    }

    async createFinalStep(k) {
        const stepsContainer = document.getElementById('steps-container');
        const finalStep = document.createElement('div');
        finalStep.className = 'step-item';
        finalStep.style.opacity = '0';
        finalStep.style.transform = 'translateX(-30px)';
        
        finalStep.innerHTML = `
            <div class="step-header">
                <div class="step-number">✓</div>
                <div class="step-operation">Final Result</div>
            </div>
            <div class="step-content">
                <strong>Result:</strong> Character at position ${k} is "${document.getElementById('result-value').textContent}"
            </div>
        `;
        
        stepsContainer.appendChild(finalStep);

        await this.delay(50);
        finalStep.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        finalStep.style.opacity = '1';
        finalStep.style.transform = 'translateX(0)';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showProgress() {
        const progressSection = document.getElementById('progress-section');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressSection.classList.add('active');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Processing... ${Math.round(progress)}%`;
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
        const kInput = document.getElementById('k-input');
        const operationsInput = document.getElementById('operations-input');

        if (exampleNumber === 1) {
            kInput.value = '5';
            operationsInput.value = '0,0,0';
        } else if (exampleNumber === 2) {
            kInput.value = '10';
            operationsInput.value = '0,1,0,1';
        }

        // Auto-solve after loading example
        setTimeout(() => this.solveGame(), 100);
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
    // Implementation for play animation
    console.log('Play animation');
}

function pauseAnimation() {
    // Implementation for pause animation
    console.log('Pause animation');
}

function resetAnimation() {
    // Implementation for reset animation
    console.log('Reset animation');
}

// Global functions for backward compatibility
let uiController;

function solveGame() {
    uiController.solveGame();
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
    }, 1000);
});
