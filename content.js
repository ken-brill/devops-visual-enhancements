//DEVOPS Visual Enhancements
// Kenneth Brill kbrill@sangoma.com
// Nov 16, 2025
// Improved version with performance and reliability enhancements

let settings = {
  showAlerts: false,
  highlightColor: '#b3d9ff',
  jiraRegex: '[A-Z]+[A-Z0-9]*-\\d+',
  jiraUrl: 'https://sangoma.atlassian.net/browse/',
  highlightRemove: true
};

const checkedFiles = new Set();
const processedCheckboxes = new WeakSet();

// Utility: Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Utility: Parse dates flexibly for international support
// I added this to make sure our international teams won't have date formatting issues.
// it tries multiple formats to parse the date string
function parseFlexibleDate(dateString) {
  const formats = [
    () => new Date(dateString),
    () => new Date(dateString.replace(/(\d{1,2})\s+(\w+)\s+(\d{4})/, '$2 $1, $3')),
  ];
  
  for (const parser of formats) {
    try {
      const date = parser();
      if (!isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        return date;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

// Utility: Check if two dates are the same day
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// Cleanup function for memory management
// Disconnect observers and clear data
function cleanup() {
  checkedFiles.clear();
  if (window.devopsRemoveObserver) {
    window.devopsRemoveObserver.disconnect();
    window.devopsRemoveObserver = null;
  }
  if (window.devopsDateObserver) {
    window.devopsDateObserver.disconnect();
    window.devopsDateObserver = null;
  }
}

// Initialize extension
chrome.storage.sync.get(settings, function(items) {
  settings = items;
  
  // Load checked files from local storage
  chrome.storage.local.get(['checkedFiles'], function(result) {
    if (result.checkedFiles && Array.isArray(result.checkedFiles)) {
      result.checkedFiles.forEach(file => checkedFiles.add(file));
    }
    initializeExtension();
  });
});

function initializeExtension() {
  try {
    cleanup(); // Clean up any existing observers
    
    // Inject styles with sanitized color
    const style = document.createElement('style');
    style.id = 'devops-visual-styles';
    const sanitizedColor = CSS.supports('color', settings.highlightColor) 
      ? settings.highlightColor 
      : '#b3d9ff';
    
    style.textContent = `
      tr.checkbox-selected-row,
      tr.checkbox-selected-row td,
      tr.checkbox-selected-row th,
      tr.checkbox-selected-row [role="gridcell"] {
        background-color: ${sanitizedColor} !important;
      }
    `;
    const oldStyle = document.getElementById('devops-visual-styles');
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(style);

    // Setup REMOVE highlighting
    if (settings.highlightRemove) {
      highlightRemoveRows();
      const debouncedHighlightRemoveRows = debounce(highlightRemoveRows, 150);
      const tableContainer = document.querySelector('[role="grid"]') || document.body;
      // as Salesforce is a SPA, we have to watch the Paige to make sure it doesn't update without us knowing
      // also Salesforce seems to fire and update for every row in the table, so I added a de bounce so that I'm not running
      // this code a million times a second
      window.devopsRemoveObserver = new MutationObserver(debouncedHighlightRemoveRows);
      window.devopsRemoveObserver.observe(tableContainer, { 
        childList: true, 
        subtree: true 
      });
    }

    // Setup today's date bolding
    boldTodayRows();
    const debouncedBoldTodayRows = debounce(boldTodayRows, 150);
    const dateTableContainer = document.querySelector('[role="grid"]') || document.body;
    // as Salesforce is a SPA, we have to watch the Paige to make sure it doesn't update without us knowing
    window.devopsDateObserver = new MutationObserver(debouncedBoldTodayRows);
    window.devopsDateObserver.observe(dateTableContainer, { 
      childList: true, 
      subtree: true 
    });
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('DevOps Extension: Initialization error', error);
  }
}

// Function to bold rows with today's date in the 6th column only
function boldTodayRows() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rows = document.querySelectorAll('tr[role="row"]');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 6) {
        const dateCell = cells[5];
        const cellText = dateCell?.textContent.trim();
        
        if (cellText) {
          const cellDate = parseFlexibleDate(cellText);
          if (cellDate && isSameDay(cellDate, today)) {
            cells.forEach(cell => cell.style.fontWeight = 'bold');
          }
        }
      }
    });
  } catch (error) {
    console.error('DevOps Extension: Error bolding today rows', error);
  }
}

// Function to highlight rows with "REMOVE" in the 4th column only
// this function was the whole reason I started this extension. It seems that.
// in Salesforce DevOps when a file is marked for removal, there is no visual clue other 
// than the word REMOVE in the operation column
// and if you mistakenly add this file to your pull request the result, more often than not
// is a failed deployment. So this visual clue is very important to avoid mistakes
function highlightRemoveRows() {
  try {
    const rows = document.querySelectorAll('tr[role="row"]');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      if (cells.length >= 4) {
        const operationCell = cells[3];
        if (operationCell && operationCell.textContent.trim() === 'REMOVE') {
          row.style.border = '2px solid red';
          cells.forEach(cell => {
            cell.style.borderTop = '2px solid red';
            cell.style.borderBottom = '2px solid red';
          });
          cells[0].style.borderLeft = '2px solid red';
          cells[cells.length - 1].style.borderRight = '2px solid red';
        }
      }
    });
  } catch (error) {
    console.error('DevOps Extension: Error highlighting REMOVE rows', error);
  }
}

function getCommentTextarea() {
  // it seems that Salesforce adds this field differently, depending on the browser you're in. In the end.
  // I want to support all browsers so I am trying to keep up with all the different ways it could be added
  const selectors = [
    'textarea[name*="comment" i]',
    'textarea[placeholder*="comment" i]',
    'textarea[aria-label*="comment" i]',
    'textarea.slds-textarea',
    'textarea'
  ];
  for (const selector of selectors) {
    const textareas = document.querySelectorAll(selector);
    for (const textarea of textareas) {
      const label = textarea.closest('label') || document.querySelector(`label[for="${textarea.id}"]`);
      const labelText = label ? label.textContent.toLowerCase() : '';
      const placeholderText = (textarea.placeholder || '').toLowerCase();
      if (labelText.includes('comment') || placeholderText.includes('comment') || textarea.name.toLowerCase().includes('comment')) {
        return textarea;
      }
    }
  }
  const allTextareas = document.querySelectorAll('textarea');
  return allTextareas[allTextareas.length - 1];
}

// Update comment textarea with JIRA link and selected files
// this is very specific to Sangoma and I am not sure it will make it to the release copy in this format
// but I'm not sure what changes to Meich to make it more generic
function updateCommentTextarea() {
  try {
    const textarea = getCommentTextarea();
    if (!textarea) {
      console.warn('DevOps Extension: Comment textarea not found');
      return;
    }
    
    const pageTitle = document.title;
    const regex = new RegExp(settings.jiraRegex);
    const jiraIdMatch = pageTitle.match(regex);
    const jiraId = jiraIdMatch ? jiraIdMatch[0] : 'UNKNOWN';
    const jiraLink = `${settings.jiraUrl}${jiraId}`;
    const filesList = Array.from(checkedFiles).join(', ');
    
    textarea.value = filesList ? `${jiraLink}\n${filesList}` : jiraLink;
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    updateSelectedFilesCount();
  } catch (error) {
    console.error('DevOps Extension: Error updating textarea', error);
  }
}

// Update selected files count display
// I can't believe that this wasn't part of the product to begin with.
function updateSelectedFilesCount() {
  try {
    const count = checkedFiles.size;
    const container = document.querySelector('div[sf_devops-changerequestheader_changerequestheader]');
    if (container) {
      let countElement = document.getElementById('selected-files-count');
      if (!countElement) {
        countElement = document.createElement('div');
        countElement.id = 'selected-files-count';
        countElement.setAttribute('sf_devops-changerequestheader_changerequestheader', '');
        countElement.className = 'text-italic slds-m-bottom_small';
        // adjust margin to align properly or it displays way too low and looks weird
        countElement.style.marginTop = '-12px';
        container.appendChild(countElement);
      }
      countElement.innerHTML = `<span class="text-bold" sf_devops-changerequestheader_changerequestheader="">${count} files selected</span>`;
      countElement.style.display = count === 0 ? 'none' : 'block';
    }
  } catch (error) {
    console.error('DevOps Extension: Error updating file count', error);
  }
}

// Get file identifier from checkbox context
// this is a very kludgy way to get this information but it works. Again Salesforce seems to.
// create these cells different differently on different browsers so I have to cast a very wide net
function getFileIdentifier(checkbox) {
  const checkboxCell = checkbox.closest('td, th, div[role="gridcell"]');
  let adjacentCellText = '', nextAdjacentCellText = '';
  if (checkboxCell) {
    const nextCell = checkboxCell.nextElementSibling;
    if (nextCell) {
      adjacentCellText = nextCell.textContent.trim();
      const nextNextCell = nextCell.nextElementSibling;
      if (nextNextCell) nextAdjacentCellText = nextNextCell.textContent.trim();
    }
  }
  return adjacentCellText && nextAdjacentCellText ? `${adjacentCellText} [${nextAdjacentCellText}]` : adjacentCellText || null;
}

// Debounced persist function
const debouncedPersist = debounce(() => {
  try {
    chrome.storage.local.set({ 
      checkedFiles: Array.from(checkedFiles) 
    });
  } catch (error) {
    console.error('DevOps Extension: Error persisting checked files', error);
  }
}, 500);

// Show alert with checkbox details
// this is a D bug function and will probably be removed later on
function showCheckboxAlert(checkbox) {
  try {
    const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
    const labelText = label ? label.textContent.trim() : checkbox.id || checkbox.name || 'Unknown checkbox';
    const fileIdentifier = getFileIdentifier(checkbox);
    
    if (checkbox.checked && fileIdentifier) {
      checkedFiles.add(fileIdentifier);
    } else if (!checkbox.checked && fileIdentifier) {
      checkedFiles.delete(fileIdentifier);
    }
    
    highlightRow(checkbox, checkbox.checked);
    updateCommentTextarea();
    debouncedPersist();
    
    if (settings.showAlerts) {
      alert(`Checkbox ${checkbox.checked ? 'CHECKED' : 'UNCHECKED'}:\n\nLabel: ${labelText}\n${fileIdentifier ? `${fileIdentifier}\n` : ''}ID: ${checkbox.id || '(none)'}\nName: ${checkbox.name || '(none)'}\nValue: ${checkbox.value || '(empty)'}`);
    }
  } catch (error) {
    console.error('DevOps Extension: Error in showCheckboxAlert', error);
  }
}

// Highlight or unhighlight the entire row based on faux checkbox state
function highlightRow(checkbox, isChecked) {
  try {
    let row = checkbox.closest('tr') || checkbox.closest('[role="row"]');
    if (!row) { 
      const cell = checkbox.closest('td, [role="gridcell"]'); 
      if (cell) row = cell.parentElement; 
    }
    if (row) {
      isChecked ? row.classList.add('checkbox-selected-row') : row.classList.remove('checkbox-selected-row');
    }
  } catch (error) {
    console.error('DevOps Extension: Error highlighting row', error);
  }
}

// Combined checkbox handler with debouncing
const handleCheckboxChange = debounce((checkbox) => {
  if (!checkbox || checkbox.type !== 'checkbox') return;
  
  if (!processedCheckboxes.has(checkbox)) {
    processedCheckboxes.add(checkbox);
    showCheckboxAlert(checkbox);
    setTimeout(() => processedCheckboxes.delete(checkbox), 1000);
  }
}, 50);

function setupEventListeners() {
  // Single click handler with better delegation
  document.addEventListener('click', function(e) {
    try {
      const checkbox = e.target.type === 'checkbox' 
        ? e.target 
        : (e.target.classList.contains('slds-checkbox_faux') || e.target.closest('.slds-checkbox'))
          ? (e.target.closest('.slds-checkbox') || e.target.closest('lightning-primitive-cell-checkbox') || e.target.parentElement)?.querySelector('input[type="checkbox"]')
          : null;
      
      if (checkbox) {
        setTimeout(() => handleCheckboxChange(checkbox), 50);
      }
    } catch (error) {
      console.error('DevOps Extension: Error in click handler', error);
    }
  }, { capture: true, passive: true });

  // Change handler as fallback
  document.addEventListener('change', function(e) {
    try {
      if (e.target.type === 'checkbox') {
        handleCheckboxChange(e.target);
      }
    } catch (error) {
      console.error('DevOps Extension: Error in change handler', error);
    }
  }, { capture: true, passive: true });
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanup);

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    let needsReinit = false;
    for (let key in changes) {
      if (settings.hasOwnProperty(key)) {
        settings[key] = changes[key].newValue;
        needsReinit = true;
      }
    }
    if (needsReinit) {
      initializeExtension();
    }
  }
});