# SENTINEL - Quick Start Guide

## 🚀 NEW FEATURES ADDED

### 1. **Trends Dashboard** 📊
- Navigate to **TRENDS** in sidebar
- View threat analytics with interactive charts
- Export data as CSV
- See threat level timeline, distribution, and recent activity

### 2. **Multi-Report Comparison** 🔄
- Go to **HISTORY**
- Select 2-5 reports using checkboxes
- Click **COMPARE** button
- View correlation analysis and common patterns
- Export comparison as PDF

### 3. **Voice Input** 🎙️
- Click **🎤 VOICE INPUT** button in report form
- Speak your report (hands-free)
- Click **● STOP VOICE** when done
- Works in Chrome, Edge, Safari

### 4. **Report Templates** 📋
- Click **LOAD TEMPLATE** in report form
- Choose from 4 templates:
  - Patrol Report
  - Incident Report
  - Intelligence Report
  - Situation Report (SITREP)

### 5. **Professional PDF Export** 📄
- View any assessment
- Click **EXPORT PDF**
- Get formatted PDF with branding and classification markings

### 6. **Multi-Provider Support** 🤖
- Go to **SETTINGS**
- Select AI Provider:
  - **Ollama** (Local - Recommended)
  - **LM Studio** (Local)
  - **OpenRouter** (Cloud)
  - **Sarvam AI** (Cloud)
- Configure provider-specific settings

### 7. **Dark/Light Theme** 🌓
- Click sun/moon icon in header
- Toggle between dark ops and light mode
- Preference saved automatically

### 8. **Enhanced Metadata** 📝
- New fields in report form:
  - **Location** (e.g., Grid coordinates)
  - **Unit Designation** (e.g., 2nd Battalion)
  - **Classification** (Unclassified to Secret)
  - **Source Tag** (Reporter ID)

### 9. **Keyboard Shortcuts** ⌨️
- **Ctrl+Enter** - Submit report for analysis
- **Esc** - Clear form
- **Tab** - Navigate through fields

### 10. **Better Notifications** 🔔
- Toast notifications for all actions
- Success, error, warning, info messages
- Auto-dismiss after 4 seconds

---

## 🎯 USAGE TIPS

### For Best Results:
1. **Use Voice Input** for quick field reports
2. **Load Templates** to standardize reporting
3. **Compare Reports** to identify patterns
4. **Check Trends** regularly for threat analysis
5. **Export CSV** for external analysis
6. **Use Keyboard Shortcuts** for faster workflow

### Recommended Workflow:
1. Load appropriate template
2. Fill in metadata (source, location, unit)
3. Enter or speak report details
4. Set initial threat assessment
5. Click **ANALYZE THREAT** (or Ctrl+Enter)
6. Review assessment
7. Export as PDF or JSON
8. Check Trends for patterns

---

## 🔧 CONFIGURATION

### AI Provider Setup:

**Ollama (Default):**
```bash
ollama serve
ollama pull phi3:mini
```

**LM Studio:**
1. Download from lmstudio.ai
2. Load a model
3. Start server on port 1234
4. Update URL in Settings

**OpenRouter:**
1. Get API key from openrouter.ai
2. Enter in Settings
3. Select model

**Sarvam AI:**
1. Get API key from sarvam.ai
2. Enter in Settings

---

## 📊 DATA MANAGEMENT

### Export Options:
- **Single Report JSON** - From assessment view
- **Single Report PDF** - From assessment view
- **All Reports CSV** - From Trends view
- **All Data Backup** - From Settings

### Import/Restore:
- Currently manual (copy JSON to IndexedDB)
- Future: Import functionality

---

## 🐛 TROUBLESHOOTING

### Voice Input Not Working:
- Use Chrome, Edge, or Safari (Firefox not supported)
- Allow microphone permissions
- Check browser console for errors

### Charts Not Displaying:
- Ensure you have completed reports
- Check browser console for errors
- Try refreshing the page

### PDF Export Issues:
- Disable browser popup blocker
- Check browser download settings
- Ensure sufficient disk space

### Theme Not Switching:
- Clear browser cache
- Check localStorage permissions
- Refresh page

---

## 🎨 UI CONTROLS

### New Buttons:
- **LOAD TEMPLATE** - Quick-fill report forms
- **🎤 VOICE INPUT** - Start voice recording
- **● STOP VOICE** - Stop voice recording
- **COMPARE (N)** - Compare N selected reports
- **EXPORT CSV** - Export all reports as CSV
- **EXPORT ALL DATA** - Backup everything
- **☀/🌙** - Toggle theme

### New Indicators:
- **● LISTENING...** - Voice input active
- **N SELECTED** - Reports selected for comparison
- **AVG CONFIDENCE** - Average across reports

---

## 📱 BROWSER SUPPORT

### Fully Supported:
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Safari 14+

### Partially Supported:
- ⚠️ Firefox (no voice input)

### Not Supported:
- ❌ Internet Explorer

---

## 🔐 SECURITY NOTES

- All data stored locally (IndexedDB)
- No telemetry or tracking
- Voice data not transmitted
- API keys stored in browser only
- Logs stored locally only

---

## 📞 SUPPORT

For issues or questions:
- Check BUILD_STATUS.md for known issues
- Review console logs
- Contact: ftsourav@gmail.com
- GitHub: https://github.com/ftwsourav/SENTINEL-xdlab

---

**Built by xDLab for iDEX Defence Challenge**
