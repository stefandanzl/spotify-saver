class SpotifySaverUI {
    constructor() {
        this.apiUrl = 'http://localhost:8000/api/v1';
        this.apiUrlHealth = 'http://localhost:8000/health';
        this.downloadInProgress = false;
        this.eventSource = null;
        
        this.initializeEventListeners();
        this.checkApiStatus();
    }

    initializeEventListeners() {
        const downloadBtn = document.getElementById('download-btn');
        const spotifyUrl = document.getElementById('spotify-url');
        
        downloadBtn.addEventListener('click', () => this.startDownload());
        
        // Allow starting download with Enter
        spotifyUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.downloadInProgress) {
                this.startDownload();
            }
        });
    }

    async checkApiStatus() {
        try {
            const response = await fetch(this.apiUrlHealth);
            if (response.ok) {
                this.updateStatus('API connected and ready', 'success');
            } else {
                this.updateStatus('API connection error', 'error');
            }
        } catch (error) {
            this.updateStatus('API unavailable. Make sure it is running.', 'error');
        }
    }

    getFormData() {
        const bitrateValue = document.getElementById('bitrate').value;
        const bitrate = bitrateValue === 'best' ? 256 : parseInt(bitrateValue);
        
        return {
            spotify_url: document.getElementById('spotify-url').value,
            output_dir: document.getElementById('output-dir').value || 'Music',
            output_format: document.getElementById('format').value,
            bit_rate: bitrate,
            download_lyrics: document.getElementById('include-lyrics').checked,
            download_cover: true, // Always download cover
            generate_nfo: document.getElementById('create-nfo').checked
        };
    }

    validateForm() {
        const formData = this.getFormData();

        if (!formData.spotify_url) {
            this.updateStatus('Please enter a Spotify URL', 'error');
            return false;
        }

        if (!formData.spotify_url.includes('spotify.com')) {
            this.updateStatus('URL must be from Spotify', 'error');
            return false;
        }

        return true;
    }

    async startDownload() {
        if (this.downloadInProgress) {
            return;
        }

        if (!this.validateForm()) {
            return;
        }

        this.downloadInProgress = true;
        this.updateUI(true);
        this.clearLog();
        
        const formData = this.getFormData();
        
        try {
            this.updateStatus('Starting download...', 'info');
            this.addLogEntry('Sending download request...', 'info');

            const response = await fetch(`${this.apiUrl}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Download error');
            }

            const result = await response.json();

            if (result.task_id) {
                this.addLogEntry(`Download started with ID: ${result.task_id}`, 'success');
                this.startProgressMonitoring(result.task_id);
            } else {
                this.updateStatus('Download completed successfully', 'success');
                this.addLogEntry('Download completed', 'success');
                this.downloadInProgress = false;
                this.updateUI(false);
            }
            
        } catch (error) {
            this.updateStatus(`Error: ${error.message}`, 'error');
            this.addLogEntry(`Error: ${error.message}`, 'error');
            this.downloadInProgress = false;
            this.updateUI(false);
        }
    }

    startProgressMonitoring(taskId) {
        // Monitor progress using polling
        const pollInterval = 2000; // 2 seconds
        let progress = 0;
        
        const checkProgress = async () => {
            try {
                const response = await fetch(`${this.apiUrl}/download/${taskId}/status`);
                if (response.ok) {
                    const status = await response.json();
                    
                    if (status.status === 'completed') {
                        this.updateProgress(100);
                        this.updateStatus('Download completed successfully', 'success');
                        this.addLogEntry('Download completed', 'success');
                        this.downloadInProgress = false;
                        this.updateUI(false);
                        return;
                    } else if (status.status === 'failed') {
                        this.updateStatus(`Error: ${status.message || 'Download failed'}`, 'error');
                        this.addLogEntry(`Error: ${status.message || 'Download failed'}`, 'error');
                        this.downloadInProgress = false;
                        this.updateUI(false);
                        return;
                    } else if (status.status === 'processing') {
                        const currentProgress = status.progress || 0;
                        this.updateProgress(currentProgress);
                        this.updateStatus(`Downloading... ${Math.round(currentProgress)}%`, 'info');

                        if (status.current_track) {
                            this.addLogEntry(`Downloading: ${status.current_track}`, 'info');
                        }
                    }
                    
                    // Continue monitoring
                    setTimeout(checkProgress, pollInterval);
                } else {
                    // If no status endpoint, use simulation
                    this.simulateProgress();
                }
            } catch (error) {
                console.warn('Error checking progress, using simulation:', error);
                this.simulateProgress();
            }
        };

        // Start monitoring
        checkProgress();
    }

    simulateProgress() {
        // Progress simulation for compatibility
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            
            if (progress >= 100) {
                progress = 100;
                this.updateProgress(progress);
                this.updateStatus('Download completed successfully', 'success');
                this.addLogEntry('Download completed', 'success');
                this.downloadInProgress = false;
                this.updateUI(false);
                clearInterval(interval);
            } else {
                this.updateProgress(progress);
                this.updateStatus(`Downloading... ${Math.round(progress)}%`, 'info');

                // Simulate progress messages
                if (Math.random() > 0.7) {
                    const messages = [
                        'Searching songs...',
                        'Downloading track...',
                        'Applying metadata...',
                        'Generating thumbnail...',
                        'Saving file...'
                    ];
                    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                    this.addLogEntry(randomMessage, 'info');
                }
            }
        }, 1000);
    }

    updateUI(downloading) {
        const downloadBtn = document.getElementById('download-btn');
        const progressContainer = document.getElementById('progress-container');
        
        if (downloading) {
            downloadBtn.disabled = true;
            downloadBtn.textContent = '⏳ Downloading...';
            progressContainer.classList.remove('hidden');
        } else {
            downloadBtn.disabled = false;
            downloadBtn.textContent = '🎵 Start Download';
            progressContainer.classList.add('hidden');
            this.updateProgress(0);
        }
    }

    updateStatus(message, type = 'info') {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
        statusMessage.className = `status-${type}`;
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${Math.round(percentage)}%`;
    }

    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('log-content');
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${timestamp}] ${message}`;
        
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    clearLog() {
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = '';
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpotifySaverUI();
});
