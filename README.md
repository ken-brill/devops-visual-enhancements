# 🚀 DevOps Center Visual Enhancement

A high-performance Chrome extension that supercharges the Salesforce DevOps Center experience with intelligent visual improvements, workflow automation, and deployment safety features.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-orange)
![Performance](https://img.shields.io/badge/performance-optimized-brightgreen)

## ✨ Features

### 🎨 Visual Enhancements
- **Smart Row Highlighting**: Selected rows illuminate with customizable colors for instant visual tracking
- **REMOVE Operation Alerts**: Automatic red border warnings on dangerous REMOVE operations - your safety net against accidental deletions
- **Today's Changes Indicator**: Files modified today appear in bold, helping you focus on fresh changes
- **Live File Counter**: Real-time display of selected files in the header section
- **Persistent Selections**: Your checked files are remembered even after page refreshes

### 🤖 Workflow Automation
- **Intelligent Comment Auto-fill**: Automatically populates comments with:
  - JIRA ticket link (extracted from page title using your custom regex)
  - Formatted list of selected files: `FileName [MetadataType]`
- **Smart File Tracking**: Maintains a persistent list of all checked files across sessions
- **Zero Manual Entry**: No more copy-pasting file names or ticket URLs

### ⚙️ Fully Configurable
Access settings via right-click on extension icon → Options

- **Alert Toggle**: Enable/disable checkbox detail popups (great for debugging)
- **Custom Highlight Colors**: Choose any color that fits your workflow
- **REMOVE Highlighting**: Toggle safety warnings on/off
- **JIRA Integration**: 
  - Custom regex patterns for any ticket format
  - Configurable JIRA base URL for your organization
- **Keyboard Shortcuts**: Save settings with Ctrl+S (Cmd+S on Mac)

### 🔧 Technical Improvements (v2.0)
- **Performance Optimized**: Debounced observers and efficient DOM monitoring
- **Memory Safe**: Automatic cleanup prevents memory leaks
- **Error Resilient**: Comprehensive error handling with graceful degradation
- **International Ready**: Flexible date parsing supports multiple locales
- **Settings Validation**: Input validation prevents configuration errors

## 📦 Installation

### From Source (Developer Mode)

1. **Clone or download this repository:**
   ```bash
   git clone https://github.com/ken-brill/devops-visual-enhancements.git
   ```

2. **Open Chrome Extensions page:**
   - Navigate to `chrome://extensions/`
   - Or click the puzzle icon → "Manage Extensions"

3. **Enable Developer Mode:**
   - Toggle the switch in the top-right corner

4. **Load the extension:**
   - Click "Load unpacked"
   - Select the extension folder

5. **You're ready!**
   - Navigate to your DevOps Center to see it in action
   - The extension icon will appear in your toolbar

### Updating the Extension

When you pull new updates from the repository:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the extension card
3. Refresh your DevOps Center page

## 🎯 Usage Guide

### Quick Start Workflow

1. **Navigate to DevOps Center:**
   ```
   https://*.lightning.force.com/sf_devops/DevOpsCenter.app
   ```

2. **Select Your Files:**
   - Click checkboxes to select files for deployment
   - Selected rows highlight in your chosen color
   - File counter updates in real-time

3. **Visual Indicators Guide You:**
   - 🔵 **Blue highlight** → Row is selected (customizable)
   - 🔴 **Red border** → REMOVE operation detected (danger!)
   - **Bold text** → Modified today
   - **Counter badge** → Total files selected

4. **Comment Auto-Population:**
   - Comment field automatically fills with:
     ```
     https://your-jira.atlassian.net/browse/TICKET-123
     MyClass.cls [ApexClass], MyTrigger.trigger [ApexTrigger], MyPage.page [ApexPage]
     ```

5. **Your Selections Persist:**
   - Refresh the page? Your checked files remain selected
   - Close the tab? Selections are saved for next time

### Visual Indicators Reference

| Indicator | Meaning | Action |
|-----------|---------|--------|
| 🔵 Blue Background | File is selected | Remove from selection if not needed |
| 🔴 Red Border | REMOVE operation | ⚠️ Review carefully before deploying! |
| **Bold Text** | Modified today | Recent changes - verify before deploy |
| "X files selected" | Selection count | Quick overview of deployment size |

### Configuration Deep Dive

**Access Settings:**
1. Right-click extension icon → "Options"
2. Or click extension icon → "Options" (if popup enabled)

**Setting Descriptions:**

#### Show Alerts
- **Default:** OFF
- **Purpose:** Debugging and validation
- **When ON:** Popup displays full checkbox details
- **Best for:** Troubleshooting or learning the extension

#### Highlight REMOVE Rows
- **Default:** ON
- **Purpose:** Safety feature to prevent accidental deletions
- **Visual:** Red borders around REMOVE operations
- **Recommendation:** Keep enabled for deployment safety

#### Row Highlight Color
- **Default:** `#b3d9ff` (Light Blue)
- **Purpose:** Customize to your preference or team colors
- **Popular choices:**
  - Light Green: `#c3f0c3` (Success theme)
  - Light Yellow: `#fff4b3` (Attention theme)
  - Light Purple: `#e6d9ff` (Creative theme)
  - Light Pink: `#ffd9e6` (Soft theme)

#### JIRA Regex Pattern
- **Default:** `[A-Z]+[A-Z0-9]*-\d+`
- **Matches:** `PROJ-123`, `SF-456`, `SFSUPPORT-78901`
- **Custom Examples:**
  ```regex
  # For tickets like FEATURE-1234
  FEATURE-\d+
  
  # For tickets like BUG_2024_001
  BUG_\d{4}_\d{3}
  
  # For tickets like ISSUE_ABC_123
  ISSUE_[A-Z]+_\d+
  ```

#### JIRA Base URL
- **Default:** `https://sangoma.atlassian.net/browse/`
- **Format:** `https://your-domain.atlassian.net/browse/`
- **Note:** Must include trailing slash and full protocol

**Saving Settings:**
- Click "Save Settings" button
- Or use keyboard shortcut: **Ctrl+S** (Windows/Linux) or **Cmd+S** (Mac)
- Success message confirms save
- Settings sync across all Chrome instances

## 🛠️ Technical Details

### Architecture

```
devops-visual-enhancements/
├── manifest.json       # Extension configuration (v3)
├── content.js          # Main functionality & DOM manipulation
├── options.html        # Settings page UI
├── options.js          # Settings page logic & validation
└── README.md          # This file
```

### How It Works

#### Column Detection Intelligence
The extension automatically identifies table columns:

| Index | Column | Purpose |
|-------|--------|---------|
| 0 | Checkbox | Selection tracking |
| 1 | File Name | File identification |
| 2 | Metadata Type | Type classification |
| 3 | Operation | REMOVE detection |
| 4 | Last Modified By | User tracking |
| 5 | Modified On | Date comparison |

#### Key Functions

**`boldTodayRows()`**
- Scans "Modified On" column (index 5)
- Flexible date parsing for international formats
- Bolds entire row if date matches today
- Debounced for performance (150ms)

**`highlightRemoveRows()`**
- Scans "Operation" column (index 3) only
- Adds 2px red borders to REMOVE operations
- Prevents false positives from other columns
- Optimized with debouncing

**`getFileIdentifier(checkbox)`**
- Extracts file name from adjacent cell
- Gets metadata type from next adjacent cell
- Returns formatted string: `FileName [MetadataType]`
- Handles edge cases gracefully

**`updateCommentTextarea()`**
- Finds comment textarea intelligently
- Extracts JIRA ID from page title using regex
- Formats file list with proper separators
- Triggers native events for compatibility

**`highlightRow(checkbox, isChecked)`**
- Adds/removes `.checkbox-selected-row` class
- Handles multiple row types (tr, [role="row"])
- Persists selection to local storage
- Syncs with checkbox state

#### Performance Optimizations

**Debouncing:**
```javascript
// Prevents excessive function calls
const debouncedFunction = debounce(expensiveFunction, 150);
```
- MutationObservers: 150ms delay
- Storage writes: 500ms delay
- Checkbox handling: 50ms delay

**Efficient DOM Monitoring:**
- Targets `[role="grid"]` instead of entire body
- Uses `WeakSet` for processed checkboxes
- Passive event listeners where possible
- Disconnects observers on cleanup

**Memory Management:**
- Automatic cleanup on page unload
- Observer disconnection prevents leaks
- Set clearing on navigation
- Proper lifecycle management

### Storage Strategy

**Sync Storage** (`chrome.storage.sync`):
- User settings (persist across devices)
- Configuration options
- 100KB limit per item

**Local Storage** (`chrome.storage.local`):
- Checked files list (session-specific)
- Larger storage capacity
- Faster access times
- No sync overhead

### Browser Compatibility

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Full Support | Manifest V3 |
| Edge (Chromium) | ✅ Full Support | Chromium-based |
| Brave | ✅ Full Support | Chrome-compatible |
| Opera | ✅ Full Support | Chrome-compatible |
| Firefox | ⚠️ Requires Adaptation | Needs Manifest V2 |

### Required Permissions

**`storage`**
- Save user settings
- Persist checked files
- Sync across sessions

**Host Permission: `https://*.lightning.force.com/*`**
- Access to Salesforce DevOps Center
- DOM manipulation capabilities
- Content script injection

## 🎨 Customization Examples

### JIRA Ticket Patterns

```javascript
// Standard Atlassian format (default)
'[A-Z]+[A-Z0-9]*-\\d+'
// Matches: PROJ-123, FEATURE-456

// Numeric-only tickets
'TICKET-\\d{4,6}'
// Matches: TICKET-1234, TICKET-123456

// Date-based tickets
'[A-Z]+-\\d{4}-\\d{3}'
// Matches: BUG-2024-001, FEATURE-2024-042

// Multi-part identifiers
'[A-Z]{2,4}_[A-Z]+_\\d+'
// Matches: SF_FEATURE_123, CORE_BUG_42
```

### Color Schemes

**Corporate Themes:**
```
Salesforce Blue:  #1798c1
Success Green:    #2e844a
Warning Yellow:   #ffb75d
Critical Red:     #ea001e
```

**Accessibility-Friendly:**
```
High Contrast:    #000000 (black on white rows)
Color-blind Safe: #0077bb (blue)
Low Vision:       #ffff00 (yellow)
```

**Team Preferences:**
```
Development:      #e3f2fd (light blue)
QA/Testing:       #fff3e0 (light orange)
Production:       #f3e5f5 (light purple)
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/devops-visual-enhancements.git
   cd devops-visual-enhancements
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add error handling
   - Test thoroughly

4. **Test in Chrome**
   - Load unpacked extension
   - Test on real DevOps Center pages
   - Check console for errors

5. **Commit and push**
   ```bash
   git commit -m 'Add some AmazingFeature'
   git push origin feature/AmazingFeature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Link any related issues
   - Wait for review

### Coding Standards

- Use meaningful variable names
- Add comments for complex logic
- Include error handling
- Follow existing patterns
- Test edge cases

## 🐛 Known Issues & Limitations

### Current Limitations

1. **Salesforce-Only:**
   - Extension only works on Salesforce DevOps Center
   - Not compatible with other Salesforce pages
   - Requires specific URL pattern

2. **Table Structure Dependency:**
   - Assumes standard 6-column table layout
   - May break if Salesforce changes table structure
   - Column indices are hardcoded

3. **Date Format:**
   - Primarily supports `en-US` date format
   - International format support improving
   - May need adjustment for some locales

4. **Storage Limits:**
   - Chrome sync storage: 100KB limit
   - Large file lists may hit limits
   - Consider manual clearing if issues arise

### Reporting Issues

Found a bug? Please [open an issue](https://github.com/ken-brill/devops-visual-enhancements/issues) with:

- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)
- Screenshots (if applicable)

## 📚 FAQ

**Q: Why aren't my selections persisting?**
A: Make sure storage permissions are granted. Check `chrome://extensions/` → Extension details → Permissions.

**Q: The extension stopped working after a Salesforce update**
A: Salesforce may have changed their DOM structure. Please report the issue with details about what's not working.

**Q: Can I use this with other Salesforce pages?**
A: Currently, no. The extension is specifically designed for DevOps Center. We may expand in future versions.

**Q: How do I reset all settings?**
A: Currently, you need to manually change settings back to defaults. A reset button will be added in a future version.

**Q: Does this work offline?**
A: The extension works when DevOps Center is accessible. It doesn't require separate internet access beyond Salesforce.

## 📄 License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2025 Kenneth Brill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👤 Author

**Kenneth Brill**
- 📧 Email: kbrill@sangoma.com
- 🐙 GitHub: [@ken-brill](https://github.com/ken-brill)
- 💼 Company: Sangoma Technologies

## 🙏 Acknowledgments

- Built with ❤️ for DevOps teams working with Salesforce
- Designed to streamline workflows and prevent deployment errors
- Special thanks to the Salesforce DevOps community
- More special thanks to claude.ai for writing me this Readme.md
- Inspired by the need to avoid dangerous REMOVE operations

## 🔮 Roadmap

### Planned Features (v2.1+)

- [ ] Settings reset button
- [ ] Export/import configuration
- [ ] Multiple JIRA project support
- [ ] Custom column mapping
- [ ] Deployment history tracking
- [ ] Team collaboration features
- [ ] Dark mode support
- [ ] Extension icons/logo
- [ ] Keyboard shortcuts for common actions

### Under Consideration

- Firefox support (Manifest V2 port)
- Integration with other ticket systems (Linear, Asana, etc.)
- CSV export of selected files
- Deployment templates

## 📊 Changelog

### Version 2.0 (Current)
- ✅ Major performance improvements with debouncing
- ✅ Enhanced memory management and cleanup
- ✅ Flexible date parsing for international support
- ✅ Comprehensive error handling
- ✅ Input validation in settings
- ✅ Persistent checked files across sessions
- ✅ Settings sync with live reload
- ✅ Keyboard shortcuts (Ctrl+S to save)
- ✅ Improved event listener efficiency
- ✅ Better code organization and documentation

### Version 1.86 (Previous)
- ✅ Added bold text for rows modified today
- ✅ Improved REMOVE detection (Operation column only)
- ✅ Enhanced row highlighting with customizable colors
- ✅ Added configurable settings page
- ✅ Auto-fill JIRA links in comments
- ✅ Live file selection counter
- ✅ Support for Lightning Web Components checkboxes

---

## 💡 Tips & Tricks

### Power User Tips

1. **Keyboard Shortcuts:**
   - Save settings: `Ctrl+S` / `Cmd+S`
   - Quick checkbox selection: Use keyboard navigation

2. **Color Coding by Team:**
   - Development team: Blue
   - QA team: Green
   - Production: Red/Pink
   - Each team member uses their own color

3. **JIRA Pattern Testing:**
   - Use [regex101.com](https://regex101.com) to test patterns
   - Set flavor to "JavaScript"
   - Test with actual ticket IDs from your system

4. **Bulk Operations:**
   - Select all files, then deselect unwanted ones
   - Use browser's built-in find (Ctrl+F) to locate specific files
   - Comment field auto-updates as you work

5. **Safety Workflow:**
   - Always review red-bordered REMOVE operations
   - Check bold (today's) changes for recent edits
   - Verify file count matches expectations
   - Double-check JIRA ticket link is correct

### Troubleshooting

**Extension not loading?**
```bash
# Check in Chrome DevTools Console (F12)
# Look for errors starting with "DevOps Extension:"
# Ensure you're on the correct URL pattern
```

**Selections not saving?**
```javascript
// Check Chrome storage in DevTools
chrome.storage.local.get(['checkedFiles'], console.log)
chrome.storage.sync.get(null, console.log)
```

**Performance issues?**
- Reduce number of selected files
- Disable "Show Alerts" option
- Close other browser tabs
- Clear browser cache

---

**Made with ❤️ for Salesforce DevOps teams worldwide**

**Star this repo if it helps your workflow! ⭐**