# 🚀 DevOps Center Visual Enhancement

A Chrome extension that enhances the Salesforce DevOps Center experience with visual improvements and workflow automation.

![Version](https://img.shields.io/badge/version-1.67-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

### 🎨 Visual Enhancements
- **Row Highlighting**: Selected rows are highlighted with a customizable background color for easy visual tracking

- **REMOVED Metadata Detection**: Automatically adds red borders to rows containing "REMOVE" operations, helping you avoid problematic deployments

- **File Counter**: Displays a live count of selected files in the header section

### 🤖 Workflow Automation
- **Auto-fill Comments**: Automatically populates the comment textarea with:
  - JIRA ticket link (extracted from page title)
  - List of selected files in format: `FileName [MetadataType]`
- **Smart File Tracking**: Maintains a list of all checked files, automatically adding/removing as you select/deselect

### ⚙️ Configurable Settings
Access settings by right-clicking the extension icon → Options

- **Alert Toggle**: Enable/disable popup alerts when clicking checkboxes
- **Highlight Color**: Choose your preferred color for selected rows
- **JIRA Integration**: 
  - Customize regex pattern to match your ticket ID format
  - Set your JIRA base URL
- **REMOVE Highlighting**: Toggle red border highlighting on/off

## 📦 Installation

### From Source
1. Clone this repository:
   ```bash
   git clone https://github.com/ken-brill/devops-visual-enhancements.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top right)

4. Click **Load unpacked**

5. Select the extension folder

6. The extension is now active! Navigate to your DevOps Center page to see it in action.

## 🎯 Usage

### Basic Workflow
1. Navigate to your Salesforce DevOps Center page: `https://*.lightning.force.com/sf_devops/DevOpsCenter.app`

2. Click checkboxes to select files you want to include in your pull request

3. Selected rows will be highlighted automatically

4. The comment field will auto-populate with:
   ```
   https://your-jira.atlassian.net/browse/TICKET-123
   file1.cls [ApexClass], file2.trigger [ApexTrigger], file3.page [ApexPage]
   ```

5. Review the "X files selected" counter in the header

6. Rows with "REMOVE" operations will have red borders as a visual warning

### Configuration
1. Right-click the extension icon → **Options**

2. Customize settings:
   - Toggle alerts on/off
   - Change highlight color
   - Adjust JIRA regex pattern (default: `[A-Z]+[A-Z0-9]*-\d+`)
   - Update JIRA base URL
   - Enable/disable REMOVE highlighting

3. Click **Save Settings**

## 🛠️ Technical Details

### Files Structure
```
devops-visual-enhancements/
├── manifest.json       # Extension configuration
├── content.js          # Main functionality
├── options.html        # Settings page UI
├── options.js          # Settings page logic
└── README.md          # Documentation
```

### Permissions Required
- `activeTab`: Access to the current active tab
- `storage`: Save user settings
- Host permission: `https://*.lightning.force.com/*`

### Browser Compatibility
- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ✅ Brave
- ❌ Firefox (requires Manifest V2 adaptation)

## 🔧 Development

### Key Functions

#### `highlightRemoveRows()`
Scans the page for table rows containing "REMOVE" and adds red borders.

#### `getFileIdentifier(checkbox)`
Extracts file name and metadata type from adjacent table cells.

#### `updateCommentTextarea()`
Populates the comment field with JIRA link and selected files.

#### `highlightRow(checkbox, isChecked)`
Adds/removes highlight class to selected rows.

## 📝 Default Settings

```javascript
{
  showAlerts: false,
  highlightColor: '#b3d9ff',
  jiraRegex: '[A-Z]+[A-Z0-9]*-\\d+',
  jiraUrl: 'https://sangoma.atlassian.net/browse/',
  highlightRemove: true
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Kenneth Brill**
- Email: kbrill@sangoma.com
- GitHub: [@ken-brill](https://github.com/ken-brill)

## 🙏 Acknowledgments

- Built for streamlining Salesforce DevOps Center workflows
- Designed to reduce manual work and prevent deployment errors

## 📮 Support

For issues, questions, or suggestions, please [open an issue](https://github.com/ken-brill/devops-visual-enhancements/issues) on GitHub.

---

Made with ❤️ for DevOps teams working with Salesforce
