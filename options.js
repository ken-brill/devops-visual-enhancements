// Default settings
const DEFAULT_SETTINGS = {
  showAlerts: false,
  highlightColor: '#b3d9ff',
  jiraRegex: '[A-Z]+[A-Z0-9]*-\\d+',
  jiraUrl: 'https://sangoma.atlassian.net/browse/',
  highlightRemove: true
};

// Load saved settings from Chrome storage
function loadSettings() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
    document.getElementById('showAlerts').checked = items.showAlerts;
    document.getElementById('highlightRemove').checked = items.highlightRemove;
    document.getElementById('highlightColor').value = items.highlightColor;
    document.getElementById('jiraRegex').value = items.jiraRegex;
    document.getElementById('jiraUrl').value = items.jiraUrl;
    updateColorPreview(items.highlightColor);
  });
}

// Update color preview swatch
function updateColorPreview(color) {
  document.getElementById('colorPreview').style.backgroundColor = color;
}

// Show success message
function showSuccess(message) {
  const status = document.getElementById('status');
  status.textContent = '✓ ' + message;
  status.className = 'status success';
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}

// Show error message
function showError(message) {
  const status = document.getElementById('status');
  status.textContent = '❌ ' + message;
  status.className = 'status error';
  status.style.display = 'block';
  status.style.backgroundColor = '#f8d7da';
  status.style.color = '#721c24';
  status.style.border = '1px solid #f5c6cb';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 5000);
}

// Validate regex pattern
function validateRegex(pattern) {
  try {
    new RegExp(pattern);
    return true;
  } catch (e) {
    return false;
  }
}

// Validate URL
function validateUrl(url) {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
}

// Save settings to Chrome storage with validation
function saveSettings() {
  const jiraRegex = document.getElementById('jiraRegex').value.trim();
  const jiraUrl = document.getElementById('jiraUrl').value.trim();
  const highlightColor = document.getElementById('highlightColor').value;
  
  // Validate regex
  if (!jiraRegex) {
    showError('JIRA regex pattern cannot be empty.');
    return;
  }
  
  if (!validateRegex(jiraRegex)) {
    showError('Invalid regex pattern. Please check your JIRA pattern syntax.');
    return;
  }
  
  // Validate URL
  if (!jiraUrl) {
    showError('JIRA URL cannot be empty.');
    return;
  }
  
  if (!validateUrl(jiraUrl)) {
    showError('Invalid JIRA URL. Please enter a valid URL starting with http:// or https://');
    return;
  }
  
  // Validate color
  if (!CSS.supports('color', highlightColor)) {
    showError('Invalid color value.');
    return;
  }
  
  const settings = {
    showAlerts: document.getElementById('showAlerts').checked,
    highlightRemove: document.getElementById('highlightRemove').checked,
    highlightColor: highlightColor,
    jiraRegex: jiraRegex,
    jiraUrl: jiraUrl
  };

  chrome.storage.sync.set(settings, function() {
    if (chrome.runtime.lastError) {
      showError('Failed to save settings: ' + chrome.runtime.lastError.message);
    } else {
      showSuccess('Settings saved successfully!');
    }
  });
}

// Reset to default settings
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to their default values?')) {
    chrome.storage.sync.set(DEFAULT_SETTINGS, function() {
      if (chrome.runtime.lastError) {
        showError('Failed to reset settings: ' + chrome.runtime.lastError.message);
      } else {
        loadSettings();
        showSuccess('Settings reset to defaults!');
      }
    });
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save').addEventListener('click', saveSettings);
document.getElementById('highlightColor').addEventListener('input', function(e) {
  updateColorPreview(e.target.value);
});

// Add keyboard shortcut for saving (Ctrl+S or Cmd+S)
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveSettings();
  }
});