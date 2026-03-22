/**
 * Prompt Service
 * Handles prompt engineering and response parsing for Ollama
 */

class PromptService {
  /**
   * Build structured prompt for threat assessment
   * @param {string|array} report - Field report text or array of reports
   * @param {object} metadata - Optional metadata
   * @returns {string} - Formatted prompt
   */
  buildPrompt(report, metadata = {}) {
    const isMultiReport = Array.isArray(report);
    
    let reportSection;
    if (isMultiReport) {
      reportSection = report.map((r, idx) => 
        `REPORT ${idx + 1}:\nSource: ${r.source || 'Unknown'}\nTimestamp: ${r.timestamp || 'Unknown'}\nContent: ${r.content}\n`
      ).join('\n');
    } else {
      const metadataStr = Object.keys(metadata).length > 0
        ? `\nMETADATA:\n${JSON.stringify(metadata, null, 2)}\n`
        : '';
      reportSection = `${report}${metadataStr}`;
    }

    const correlationInstruction = isMultiReport 
      ? '\n- CRITICAL: Correlate patterns across all reports\n- Identify common threats, locations, and temporal patterns\n- Highlight escalation indicators\n- Provide correlated indicators section'
      : '';

    return `ROLE: You are SENTINEL, a tactical intelligence analyst for military operations. Your task is to analyze field reports and provide structured threat assessments.

TASK: Analyze the following field report${isMultiReport ? 's' : ''} and provide a structured threat assessment.

FIELD REPORT${isMultiReport ? 'S' : ''}:
${reportSection}

OUTPUT FORMAT (strict JSON only, no additional text):
{
  "threatLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "confidence": 0-100,
  "executiveSummary": "2-3 sentence executive summary",
  "correlatedIndicators": ["pattern 1", "pattern 2"],
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "threats": [
    {
      "type": "PERSONNEL|EQUIPMENT|LOCATION|ACTIVITY|OTHER",
      "description": "detailed description",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL"
    }
  ],
  "recommendations": [
    {
      "option": "A|B|C",
      "action": "specific action to take",
      "risk": "LOW|MEDIUM|HIGH"
    }
  ],
  "intelligence": {
    "entities": ["entity1", "entity2"],
    "locations": ["location1", "location2"],
    "timeframe": "temporal context",
    "keywords": ["keyword1", "keyword2"]
  },
  "timestamp": "${new Date().toISOString()}"
}

CONSTRAINTS:
- Respond ONLY with valid JSON (no markdown, no code blocks, no explanations)
- Be concise and actionable
- Prioritize operational security
- Flag ambiguous information in findings
- Provide at least 3 key findings
- Provide at least 3 recommendations (options A, B, C)
- Identify at least 1 threat entity${correlationInstruction}

Begin your response with { and end with }`;
  }

  /**
   * Parse and validate LLM response
   * @param {string} rawResponse - Raw text from Ollama
   * @returns {object} - Parsed assessment object
   */
  parseResponse(rawResponse) {
    try {
      // Remove markdown code blocks if present
      let cleaned = rawResponse.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '');
      cleaned = cleaned.replace(/^```\s*/i, '');
      cleaned = cleaned.replace(/\s*```$/i, '');
      cleaned = cleaned.trim();

      // Find JSON object boundaries
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('No JSON object found in response');
      }

      const jsonStr = cleaned.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      this.validateAssessment(parsed);

      return parsed;
    } catch (error) {
      console.error('Parse error:', error.message);
      console.error('Raw response:', rawResponse);
      throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }

  /**
   * Validate assessment structure
   * @param {object} assessment - Parsed assessment
   * @throws {Error} - If validation fails
   */
  validateAssessment(assessment) {
    const required = [
      'threatLevel',
      'confidence',
      'summary',
      'keyFindings',
      'threats',
      'recommendations',
      'intelligence'
    ];

    for (const field of required) {
      if (!(field in assessment)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate threat level
    const validLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validLevels.includes(assessment.threatLevel)) {
      throw new Error(`Invalid threat level: ${assessment.threatLevel}`);
    }

    // Validate confidence
    if (typeof assessment.confidence !== 'number' || 
        assessment.confidence < 0 || 
        assessment.confidence > 100) {
      throw new Error('Confidence must be a number between 0 and 100');
    }

    // Validate arrays
    if (!Array.isArray(assessment.keyFindings) || assessment.keyFindings.length === 0) {
      throw new Error('keyFindings must be a non-empty array');
    }

    if (!Array.isArray(assessment.threats) || assessment.threats.length === 0) {
      throw new Error('threats must be a non-empty array');
    }

    if (!Array.isArray(assessment.recommendations) || assessment.recommendations.length === 0) {
      throw new Error('recommendations must be a non-empty array');
    }

    // Validate threat entities
    const validTypes = ['PERSONNEL', 'EQUIPMENT', 'LOCATION', 'ACTIVITY', 'OTHER'];
    for (const threat of assessment.threats) {
      if (!validTypes.includes(threat.type)) {
        throw new Error(`Invalid threat type: ${threat.type}`);
      }
      if (!validLevels.includes(threat.severity)) {
        throw new Error(`Invalid threat severity: ${threat.severity}`);
      }
    }

    // Validate recommendations
    const validTimeframes = ['IMMEDIATE', 'SHORT_TERM', 'LONG_TERM'];
    for (const rec of assessment.recommendations) {
      if (typeof rec.priority !== 'number' || rec.priority < 1 || rec.priority > 5) {
        throw new Error('Recommendation priority must be between 1 and 5');
      }
      if (!validTimeframes.includes(rec.timeframe)) {
        throw new Error(`Invalid timeframe: ${rec.timeframe}`);
      }
    }

    // Validate intelligence
    if (typeof assessment.intelligence !== 'object') {
      throw new Error('intelligence must be an object');
    }
  }

  /**
   * Create fallback assessment for errors
   * @param {string} report - Original report
   * @param {string} error - Error message
   * @returns {object} - Fallback assessment
   */
  createFallbackAssessment(report, error) {
    return {
      threatLevel: 'MEDIUM',
      confidence: 0,
      summary: 'Unable to generate automated assessment. Manual review required.',
      keyFindings: [
        'Automated analysis failed',
        'Original report requires manual review',
        `Error: ${error}`
      ],
      threats: [
        {
          type: 'OTHER',
          description: 'Unable to identify specific threats automatically',
          severity: 'MEDIUM'
        }
      ],
      recommendations: [
        {
          priority: 1,
          action: 'Conduct manual threat assessment',
          rationale: 'Automated system encountered an error',
          timeframe: 'IMMEDIATE'
        },
        {
          priority: 2,
          action: 'Review system logs and retry analysis',
          rationale: 'Technical issue may be temporary',
          timeframe: 'SHORT_TERM'
        }
      ],
      intelligence: {
        entities: [],
        locations: [],
        timeframe: 'Unknown',
        keywords: []
      },
      error: error
    };
  }
}

module.exports = new PromptService();
