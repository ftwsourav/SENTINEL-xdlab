# SENTINEL
## Tactical AI Intelligence Synthesizer

![Version](https://img.shields.io/badge/version-1.0.0-gold)
![License](https://img.shields.io/badge/license-Proprietary-red)
![Status](https://img.shields.io/badge/status-iDEX_Submission-green)

**Built by xDLab for Indian iDEX Defence Grant**

---

## 🎯 OVERVIEW

SENTINEL is an offline, air-gapped tactical intelligence system that transforms raw field reports from military personnel into structured threat assessments with actionable recommendations. Powered by locally-hosted AI (Ollama), SENTINEL operates entirely without external APIs, ensuring operational security in sensitive environments.

### Key Features

- **🔒 100% Offline Operation** — No cloud dependencies, no external APIs
- **🤖 Local AI Processing** — Ollama-powered threat analysis
- **📊 Intelligent Analysis** — Structured threat assessments with confidence scores
- **📈 Trend Analytics** — Multi-report comparison and threat pattern detection
- **💾 Persistent Storage** — IndexedDB for offline data retention
- **📄 Export Capabilities** — PDF and JSON export for reporting
- **🎨 Tactical UI** — Dark ops aesthetic optimized for field operations
- **⚡ Real-time Processing** — Instant threat assessment generation

---

## 🏗️ ARCHITECTURE

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Pure CSS (no frameworks)
- IndexedDB (data persistence)

**Backend:**
- Node.js + Express
- Native fetch API
- Ollama integration

**AI/LLM:**
- Ollama (local inference)
- Mistral 7B (default model)
- Configurable model selection

### System Requirements

**Minimum:**
- OS: Windows 10/11, Ubuntu 20.04+, macOS 11+
- RAM: 8GB
- Storage: 10GB free
- CPU: 4 cores

**Recommended:**
- RAM: 16GB
- Storage: 20GB SSD
- CPU: 8 cores
- GPU: Optional (faster inference)

---

## 🚀 QUICK START

### Prerequisites

1. **Install Node.js 18+**
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Install Ollama**
   - Windows: Download from https://ollama.ai/download
   - Linux: `curl -fsSL https://ollama.ai/install.sh | sh`
   - macOS: `brew install ollama`

3. **Download AI Model**
   ```bash
   ollama serve  # Start Ollama service
   ollama pull mistral:7b  # Download model (in new terminal)
   ```

### Installation

1. **Clone/Extract Project**
   ```bash
   cd sentinel
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev  # Starts on http://localhost:3001
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev  # Starts on http://localhost:5173
   ```

4. **Access Application**
   - Open browser to http://localhost:5173
   - Verify Ollama connection status in header

---

## 📖 USER GUIDE

### Submitting a Field Report

1. Navigate to **NEW REPORT** (default view)
2. Enter field report in the textarea (10-10,000 characters)
3. Optionally add metadata:
   - Location
   - Reporter ID
   - Priority level
4. Select AI model (default: mistral:7b)
5. Click **ANALYZE THREAT**
6. Wait for assessment (typically 10-30 seconds)

### Understanding Threat Assessments

**Threat Levels:**
- 🔴 **CRITICAL** — Immediate action required
- 🟠 **HIGH** — Urgent attention needed
- 🟡 **MEDIUM** — Monitor closely
- 🔵 **LOW** — Routine awareness

**Assessment Components:**
- **Executive Summary** — 2-3 sentence overview
- **Key Findings** — Bullet-point highlights
- **Identified Threats** — Categorized threat entities
- **Recommendations** — Prioritized action items
- **Intelligence Tags** — Extracted entities, locations, keywords

### Managing Report History

1. Navigate to **HISTORY**
2. Use filters to find reports:
   - Date range
   - Threat level
   - Status
3. Search by keywords
4. Click report card to view details
5. Select multiple reports for comparison

### Comparing Reports

1. In **HISTORY**, select 2-5 reports (checkboxes)
2. Click **COMPARE**
3. View side-by-side analysis:
   - Common threats
   - Geographic overlap
   - Escalation patterns
4. Export comparison report

### Viewing Trends

1. Navigate to **TRENDS**
2. Analyze dashboard widgets:
   - Threat level timeline
   - Threat type distribution
   - Geographic hotspots
   - Recent activity summary
3. Export analytics data

### Exporting Data

**Single Report:**
- View report assessment
- Click **EXPORT PDF** or **EXPORT JSON**
- File downloads automatically

**Batch Export:**
- Navigate to **SETTINGS**
- Click **EXPORT ALL DATA**
- Select format (JSON recommended)

### Configuring Settings

1. Navigate to **SETTINGS**
2. **Ollama Configuration:**
   - View connection status
   - Change active model
   - Test connection
   - Refresh model list
3. **Data Management:**
   - View storage usage
   - Export all data
   - Clear all data (with confirmation)
4. **Export Preferences:**
   - Set default format
   - Configure included fields

---

## 🎨 DESIGN PHILOSOPHY

SENTINEL's interface follows a **dark ops aesthetic** designed for tactical environments:

- **Flat Design** — No gradients, shadows, or blur
- **Monospace Typography** — JetBrains Mono for technical clarity
- **High Contrast** — Optimized for low-light conditions
- **Minimal Animations** — Only functional feedback
- **Uppercase Labels** — Wide letter-spacing for readability
- **Gold Accents** — #b8964a for primary actions and highlights

### Color Palette

```
Background:  #0a0a0a (primary), #0d0d0d (surface), #080808 (cards)
Text:        #e8e4d9 (primary), #555555 (muted), #333333 (hints)
Accent:      #b8964a (gold)
Semantic:    #8b2a2a (danger), #2a6a4a (success), #8a7a3a (warning)
```

---

## 🔧 DEVELOPMENT

### Project Structure

```
sentinel/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express server
│   │   ├── routes/api.js          # API endpoints
│   │   ├── services/
│   │   │   ├── ollama.service.js  # Ollama integration
│   │   │   └── prompt.service.js  # Prompt engineering
│   │   └── middleware/
│   │       ├── errorHandler.js
│   │       └── validator.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── services/              # API, DB, export services
│   │   ├── context/               # State management
│   │   ├── types/                 # TypeScript types
│   │   ├── hooks/                 # Custom hooks
│   │   ├── utils/                 # Utilities
│   │   └── styles/                # CSS files
│   └── package.json
│
├── plans/                         # Architecture documentation
│   ├── SENTINEL_Architecture.md
│   ├── IMPLEMENTATION_GUIDE.md
│   ├── UI_COMPONENT_SPECS.md
│   └── DEPLOYMENT_TESTING.md
│
└── README.md
```

### API Endpoints

**POST /api/assess**
- Process field report
- Returns threat assessment
- Body: `{ report: string, metadata?: object, model?: string }`

**GET /api/models**
- List available Ollama models
- Returns: `{ models: string[], current: string }`

**GET /api/health**
- System health check
- Returns: `{ backend: string, ollama: string, model: string }`

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Backend
cd backend
npm install --production
node src/server.js

# Frontend
cd frontend
npm run build
# Output in dist/ directory
```

---

## 🔐 SECURITY

### Air-Gap Compliance

- ✅ No external API calls
- ✅ No CDN dependencies
- ✅ No telemetry or analytics
- ✅ All assets bundled locally
- ✅ Offline-first architecture

### Data Privacy

- All data stored locally (IndexedDB)
- No cloud synchronization
- User-controlled data deletion
- Export for backup purposes

### Input Sanitization

- HTML/script tag stripping
- Input length validation (10-10,000 chars)
- Metadata field validation
- SQL injection prevention (N/A - no SQL database)

---

## 📊 PERFORMANCE

### Benchmarks

- **Initial Load:** < 3 seconds
- **Assessment Generation:** 10-30 seconds (model-dependent)
- **Report History Load:** < 1 second (1000 reports)
- **Export (JSON):** < 1 second
- **Export (PDF):** 2-5 seconds

### Optimization Features

- Code splitting (lazy loading)
- Virtual scrolling (large lists)
- Debounced search
- IndexedDB batch operations
- Connection pooling (Ollama)

---

## 🐛 TROUBLESHOOTING

### Ollama Connection Failed

**Symptoms:** "Ollama disconnected" in header, assessment fails

**Solutions:**
1. Check if Ollama is running: `ollama list`
2. Start Ollama: `ollama serve`
3. Verify port 11434 is accessible
4. Check firewall settings

### Model Not Found

**Symptoms:** "Model 'mistral:7b' not found" error

**Solutions:**
1. Pull model: `ollama pull mistral:7b`
2. Verify: `ollama list`
3. Check model name spelling in settings

### Assessment Takes Too Long

**Symptoms:** Processing > 60 seconds

**Solutions:**
1. Check system resources (CPU/RAM)
2. Try smaller model (if available)
3. Reduce report length
4. Restart Ollama service

### IndexedDB Quota Exceeded

**Symptoms:** "QuotaExceededError" when saving reports

**Solutions:**
1. Clear old reports from history
2. Export and delete archived reports
3. Request more storage quota (browser settings)

### CORS Errors

**Symptoms:** "Access blocked by CORS policy"

**Solutions:**
1. Verify backend is running on port 3001
2. Check CORS configuration in backend
3. Ensure frontend URL is whitelisted

---

## 📚 DOCUMENTATION

Comprehensive documentation available in [`/plans`](./plans/) directory:

- **[SENTINEL_Architecture.md](./plans/SENTINEL_Architecture.md)** — System architecture and design
- **[IMPLEMENTATION_GUIDE.md](./plans/IMPLEMENTATION_GUIDE.md)** — Step-by-step development guide
- **[UI_COMPONENT_SPECS.md](./plans/UI_COMPONENT_SPECS.md)** — Visual design specifications
- **[DEPLOYMENT_TESTING.md](./plans/DEPLOYMENT_TESTING.md)** — Deployment and testing procedures

---

## 🎯 iDEX SUBMISSION

### Innovation Highlights

1. **Offline AI Processing** — First-of-its-kind tactical intelligence system with local LLM
2. **Air-Gap Security** — Zero external dependencies for sensitive operations
3. **Structured Intelligence** — Transforms unstructured reports into actionable assessments
4. **Trend Analysis** — Multi-report correlation for pattern detection
5. **Tactical UX** — Purpose-built interface for field operations

### Use Cases

- **Border Security** — Analyze patrol reports for threat patterns
- **Counter-Insurgency** — Process field intelligence for tactical planning
- **Disaster Response** — Coordinate emergency response with structured assessments
- **Training Exercises** — Simulate intelligence analysis workflows
- **Command Centers** — Real-time threat assessment for decision support

### Scalability

- **Single User** — Laptop/desktop deployment for field officers
- **Team Deployment** — Local network installation for command posts
- **Enterprise** — Containerized deployment for large-scale operations
- **Mobile** — Future React Native port for tablet/mobile devices

---

## 🤝 SUPPORT

### Contact

- **Organization:** xDLab
- **Project:** SENTINEL
- **Grant:** iDEX Defence Challenge
- **Status:** Submission Ready

### Reporting Issues

For technical issues or feature requests:
1. Document the issue with screenshots
2. Include system information (OS, Node version, Ollama version)
3. Provide steps to reproduce
4. Contact project maintainers

---

## 📜 LICENSE

Proprietary software developed for Indian iDEX Defence Grant submission.  
All rights reserved © 2026 xDLab

---

## 🙏 ACKNOWLEDGMENTS

- **Indian iDEX Programme** — For supporting defence innovation
- **Ollama Team** — For local LLM infrastructure
- **Mistral AI** — For the mistral:7b model
- **Open Source Community** — For React, Vite, and supporting libraries

---

## 🚀 ROADMAP

### Phase 1: MVP (Current)
- ✅ Core threat assessment
- ✅ Report history
- ✅ Multi-report comparison
- ✅ Trend analytics
- ✅ Export functionality

### Phase 2: Enhanced Features
- [ ] Voice input for field reports
- [ ] Offline map integration
- [ ] Custom prompt templates
- [ ] Advanced ML-based trend prediction
- [ ] Multi-language support

### Phase 3: Enterprise
- [ ] Multi-user collaboration
- [ ] Role-based access control
- [ ] Audit logging
- [ ] API for third-party integration
- [ ] Mobile app (React Native)

---

## 📞 QUICK REFERENCE

### Commands

```bash
# Start Ollama
ollama serve

# Pull model
ollama pull mistral:7b

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Build production
cd frontend && npm run build

# Run tests
npm test
```

### URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001
- **Ollama:** http://localhost:11434

### Default Credentials

No authentication required (single-user system)

---

**SENTINEL — Tactical AI Intelligence Synthesizer**  
*Transforming field reports into actionable intelligence*

Built with ❤️ by xDLab for Indian Defence Forces