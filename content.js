//DEVOPS Visual Enhancments
// Kenneth Brill kbrill@sangoma.com
// Nov 14, 2025

// Default settings
let settings = {
  showAlerts: false,
  highlightColor: '#b3d9ff',
  jiraRegex: '[A-Z]+[A-Z0-9]*-\\d+',
  jiraUrl: 'https://sangoma.atlassian.net/browse/',
  highlightRemove: true
};

// Load settings from storage
chrome.storage.sync.get(settings, function(items) {
  settings = items;
  initializeExtension();
});

function initializeExtension() {
  // Inject custom CSS to override Salesforce styles for selected rows
  const style = document.createElement('style');
  style.id = 'checkbox-scanner-styles';
  style.textContent = `
    tr.checkbox-selected-row,
    tr.checkbox-selected-row:hover,
    tr.checkbox-selected-row td,
    tr.checkbox-selected-row:hover td,
    tr.checkbox-selected-row th,
    tr.checkbox-selected-row:hover th,
    tr.checkbox-selected-row td *,
    tr.checkbox-selected-row:hover td *,
    tr.checkbox-selected-row [role="gridcell"],
    tr.checkbox-selected-row:hover [role="gridcell"] {
      background-color: ${settings.highlightColor} !important;
    }
  `;
  
  // Remove old style if exists
  const oldStyle = document.getElementById('checkbox-scanner-styles');
  if (oldStyle) {
    oldStyle.remove();
  }
  
  document.head.appendChild(style);
  
  // Initialize REMOVE row highlighting if enabled in Settings
  if (settings.highlightRemove) {
    highlightRemoveRows();
    
    // Watch for dynamic content changes (Salesforce Lightning is a SPA)
    const removeObserver = new MutationObserver(() => {
      highlightRemoveRows();
    });
    
    removeObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Set to track currently checked files
const checkedFiles = new Set();

// Function to highlight rows containing "REMOVE"
// This adds a red border to any table row that contains the text "REMOVE"
// Removed elements in DevOps can present difficulties if they are included in the pull request
//  so we avoid pushing them up. This red border is just a way for us to be able to see that this line.
//  is a remove without having to read the operation column

function highlightRemoveRows() {
  // Find all table cells
  const tdElements = document.querySelectorAll('td');
  
  // Loop through each cell
  tdElements.forEach(td => {
    // Check if the cell contains "REMOVE"
    if (td.textContent.includes('REMOVE')) {
      // Find the parent row (<tr>) element
      const row = td.closest('tr');
      if (row) {
        // Set border on the entire row
        row.style.border = '2px solid red';
        
        // Also set border on all cells in the row for better visibility
        const cells = row.querySelectorAll('td, th');
        cells.forEach(cell => {
          cell.style.borderTop = '2px solid red';
          cell.style.borderBottom = '2px solid red';
        });
        // First and last cell get side borders to complete the box
        if (cells.length > 0) {
          cells[0].style.borderLeft = '2px solid red';
          cells[cells.length - 1].style.borderRight = '2px solid red';
        }
      }
    }
  });
}

// Function to find the comment textarea
// This searches for a textarea that looks like a comment field by checking:
// - The name attribute contains "comment"
// - The placeholder text contains "comment"
// - The aria-label contains "comment"
// - Defaults to the last textarea on the page 
function getCommentTextarea() {
  // Try multiple selectors to find the comment field
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
      // Check if this looks like a comment field by examining labels and attributes
      const label = textarea.closest('label') || 
                   document.querySelector(`label[for="${textarea.id}"]`);
      const labelText = label ? label.textContent.toLowerCase() : '';
      const placeholderText = (textarea.placeholder || '').toLowerCase();
      
      if (labelText.includes('comment') || placeholderText.includes('comment') || 
          textarea.name.toLowerCase().includes('comment')) {
        return textarea;
      }
    }
  }
  
  // If still not found, return the last textarea on the page
  const allTextareas = document.querySelectorAll('textarea');
  return allTextareas[allTextareas.length - 1];
}

// Function to update the comment textarea with JIRA link and selected files
function updateCommentTextarea() {
  const textarea = getCommentTextarea();
  if (textarea) {
    // Extract JIRA ticket ID from page title using regex from settings
    const pageTitle = document.title;
    const regex = new RegExp(settings.jiraRegex);
    const jiraIdMatch = pageTitle.match(regex);
    const jiraId = jiraIdMatch ? jiraIdMatch[0] : 'UNKNOWN';
    const jiraLink = `${settings.jiraUrl}${jiraId}`;
    
    // Join all checked files with commas
    const filesList = Array.from(checkedFiles).join(', ');
    
    // Update textarea: JIRA link on first line, files on second line
    if (filesList) {
      textarea.value = `${jiraLink}\n${filesList}`;
    } else {
      textarea.value = jiraLink;
    }
    
    // Trigger change event in case the form is listening
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  // Update the selected files count in the header section
  updateSelectedFilesCount();
}

// Function to update or create the selected files count display
// Shows "X files selected" in the header section
function updateSelectedFilesCount() {
  const count = checkedFiles.size;
  
  // Find the container with the file counts
  const container = document.querySelector('div[sf_devops-changerequestheader_changerequestheader]');
  
  if (container) {
    // Look for our custom count element
    let countElement = document.getElementById('selected-files-count');
    
    if (!countElement) {
      // Create the element if it doesn't exist
      countElement = document.createElement('div');
      countElement.id = 'selected-files-count';
      countElement.setAttribute('sf_devops-changerequestheader_changerequestheader', '');
      countElement.className = 'text-italic slds-m-bottom_small';
      countElement.style.marginTop = '-12px';
      
      // Insert it at the end of the container
      container.appendChild(countElement);
    }
    
    // Update the content with current count
    countElement.innerHTML = `<span class="text-bold" sf_devops-changerequestheader_changerequestheader="">${count} files selected</span>`;
    
    // Hide the element if count is 0
    if (count === 0) {
      countElement.style.display = 'none';
    } else {
      countElement.style.display = 'block';
    }
  }
}

// Function to get the file identifier from adjacent table cells
// Takes the text from the cell next to the checkbox and the cell after that
// Returns format: "FileName [MetadataType]"
function getFileIdentifier(checkbox) {
  const checkboxCell = checkbox.closest('td, th, div[role="gridcell"]');
  let adjacentCellText = '';
  let nextAdjacentCellText = '';
  
  if (checkboxCell) {
    const nextCell = checkboxCell.nextElementSibling;
    if (nextCell) {
      adjacentCellText = nextCell.textContent.trim();
      
      const nextNextCell = nextCell.nextElementSibling;
      if (nextNextCell) {
        nextAdjacentCellText = nextNextCell.textContent.trim();
      }
    }
  }
  
  if (adjacentCellText && nextAdjacentCellText) {
    return `${adjacentCellText} [${nextAdjacentCellText}]`;
  } else if (adjacentCellText) {
    return adjacentCellText;
  }
  
  return null;
}

// Function to handle checkbox state changes
// Called when a checkbox is clicked - updates tracking and UI
function showCheckboxAlert(checkbox) {
  const label = checkbox.closest('label') || document.querySelector(`label[for="${checkbox.id}"]`);
  const labelText = label ? label.textContent.trim() : checkbox.id || checkbox.name || 'Unknown checkbox';
  
  const fileIdentifier = getFileIdentifier(checkbox);
  
  // Update the checked files set - add if checked, remove if unchecked
  if (checkbox.checked && fileIdentifier) {
    checkedFiles.add(fileIdentifier);
  } else if (!checkbox.checked && fileIdentifier) {
    checkedFiles.delete(fileIdentifier);
  }
  
  // Highlight or unhighlight the row
  highlightRow(checkbox, checkbox.checked);
  
  // Update the comment textarea with current selections
  updateCommentTextarea();
  
  // Show alert only if enabled in settings
  if (settings.showAlerts) {
    alert(`Checkbox ${checkbox.checked ? 'CHECKED' : 'UNCHECKED'}:\n\n` +
          `Label: ${labelText}\n` +
          (fileIdentifier ? `${fileIdentifier}\n` : '') +
          `ID: ${checkbox.id || '(none)'}\n` +
          `Name: ${checkbox.name || '(none)'}\n` +
          `Value: ${checkbox.value || '(empty)'}`);
  }
}

// Function to highlight or unhighlight a table row
// Adds/removes a CSS class that changes the background color
function highlightRow(checkbox, isChecked) {
  // Find the row (tr) containing the checkbox, the grid is different from browser to browser
  // So I look a few different ways.
  let row = checkbox.closest('tr');
  
  // If no tr found, try finding the parent with role="row"
  if (!row) {
    row = checkbox.closest('[role="row"]');
  }
  
  // If still not found, try finding parent gridcell and then its row
  if (!row) {
    const cell = checkbox.closest('td, [role="gridcell"]');
    if (cell) {
      row = cell.parentElement;
    }
  }
  
  if (row) {
    if (isChecked) {
      // Add the custom class which has !important CSS rules becasue SF reimposes WHITE if I dont
      row.classList.add('checkbox-selected-row');
    } else {
      // Remove the custom class
      row.classList.remove('checkbox-selected-row');
    }
  }
}

// Store processed checkboxes to avoid duplicate alerts
const processedCheckboxes = new WeakSet();

// Monitor all clicks on the page
document.addEventListener('click', function(e) {
  // Check if it's an actual checkbox input
  if (e.target.type === 'checkbox') {
    setTimeout(() => {
      showCheckboxAlert(e.target);
    }, 50);
    return;
  }
  
  // Check if click is on Lightning checkbox components (the visual checkbox, not the input)
  if (e.target.classList.contains('slds-checkbox_faux') || 
      e.target.closest('.slds-checkbox')) {
    
    const checkboxContainer = e.target.closest('.slds-checkbox') || 
                             e.target.closest('lightning-primitive-cell-checkbox') ||
                             e.target.parentElement;
    
    const checkbox = checkboxContainer?.querySelector('input[type="checkbox"]');
    
    if (checkbox) {
      setTimeout(() => {
        showCheckboxAlert(checkbox);
      }, 100);
    }
  }
}, true);

// Monitor change events (backup in case click doesn't fire)
document.addEventListener('change', function(e) {
  if (e.target.type === 'checkbox') {
    if (!processedCheckboxes.has(e.target)) {
      processedCheckboxes.add(e.target);
      showCheckboxAlert(e.target);
      setTimeout(() => processedCheckboxes.delete(e.target), 1000);
    }
  }
}, true);