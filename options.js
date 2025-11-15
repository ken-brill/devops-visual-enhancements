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

// Save settings to Chrome storage
function saveSettings() {
  const settings = {
    showAlerts: document.getElementById('showAlerts').checked,
    highlightRemove: document.getElementById('highlightRemove').checked,
    highlightColor: document.getElementById('highlightColor').value,
    jiraRegex: document.getElementById('jiraRegex').value,
    jiraUrl: document.getElementById('jiraUrl').value
  };

  chrome.storage.sync.set(settings, function() {
    // Show success message
    const status = document.getElementById('status');
    status.textContent = '✓ Settings saved successfully!';
    status.className = 'status success';
    
    // Hide message after 3 seconds
    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save').addEventListener('click', saveSettings);
document.getElementById('highlightColor').addEventListener('input', function(e) {
  updateColorPreview(e.target.value);
});