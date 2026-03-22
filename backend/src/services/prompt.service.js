/**
 * Prompt Service
 * Handles prompt engineering and response parsing for AI providers
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
    
    let reportText;
    if (isMultiReport) {
      reportText = report.map((r, idx) => 
        `REPORT ${idx + 1}: ${r.content}`
      ).join('\n\n');
    } else {
      reportText = report;
    }

    // Simplified prompt for better model compatibility
    return `You are a military threat analyst. Analyze the field report and respond with ONLY a JSON object, no other text before or after.

Use exactly this structure:
{
  "threatLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "confidence": <number 0-100>,
  "executiveSummary": "<2-3 sentences>",
  "keyFindings": ["<finding1>", "<finding2>", "<finding3>"],
  "threats": [
    {"type": "PERSONNEL|EQUIPMENT|LOCATION|ACTIVITY|OTHER", "description": "<desc>", "severity": "LOW|MEDIUM|HIGH|CRITICAL"}
  ],
  "recommendations": [
    {"option": "A", "action": "<action>", "risk": "LOW"},
    {"option": "B", "action": "<action>", "risk": "MEDIUM"},
    {"option": "C", "action": "<action>", "risk": "HIGH"}
  ],
  "intelligence": {
    "entities": ["<entity1>", "<entity2>"],
    "locations": ["<location1>", "<location2>"],
    "timeframe": "<timeframe>",
    "keywords": ["<keyword1>", "<keyword2>"]
  }
}

Field report: ${reportText}

Respond with ONLY the JSON object, starting with { and ending with }`;
  }

  /**
   * Aggressive JSON extraction from LLM response
   * @param {string} rawResponse - Raw text from AI
   * @returns {object} - Parsed assessment object
   */
  parseResponse(rawResponse) {
    try {
      // Method 1: Extract JSON from first { to last }
      const start = rawResponse.indexOf('{');
      const end = rawResponse.lastIndexOf('}');
      
      if (start !== -1 && end !== -1) {
        const jsonStr = rawResponse.slice(start, end + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          this.validateAndNormalize(parsed);
          return parsed;
        } catch (e) {
          console.log('Method 1 failed, trying method 2');
        }
      }

      // Method 2: Strip markdown code blocks
      let stripped = rawResponse.trim();
      stripped = stripped.replace(/```json\n?/gi, '');
      stripped = stripped.replace(/```\n?/g, '');
      stripped = stripped.trim();
      
      const start2 = stripped.indexOf('{');
      const end2 = stripped.lastIndexOf('}');
      
      if (start2 !== -1 && end2 !== -1) {
        const jsonStr = stripped.slice(start2, end2 + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          this.validateAndNormalize(parsed);
          return parsed;
        } catch (e) {
          console.log('Method 2 failed, trying method 3');
        }
      }

      // Method 3: Try to fix common JSON issues
      let fixed = rawResponse;
      fixed = fixed.replace(/```json/gi, '');
      fixed = fixed.replace(/```/g, '');
      fixed = fixed.replace(/\n/g, ' ');
      fixed = fixed.replace(/\s+/g, ' ');
      
      const start3 = fixed.indexOf('{');
      const end3 = fixed.lastIndexOf('}');
      
      if (start3 !== -1 && end3 !== -1) {
        const jsonStr = fixed.slice(start3, end3 + 1);
        try {
          const parsed = JSON.parse(jsonStr);
          this.validateAndNormalize(parsed);
          return parsed;
        } catch (e) {
          console.log('Method 3 failed, returning fallback');
        }
      }

      // Method 4: Return safe fallback with actual text
      console.error('All JSON parsing methods failed');
      return {
        threatLevel: 'MEDIUM',
        confidence: 50,
        executiveSummary: rawResponse.slice(0, 300),
        summary: rawResponse.slice(0, 300),
        keyFindings: [
          'Manual review required — AI response was not structured',
          'Raw output available in assessment details',
          'Consider using a different AI model'
        ],
        threats: [
          {
            type: 'OTHER',
            description: 'Unable to parse structured threat data',
            severity: 'MEDIUM'
          }
        ],
        recommendations: [
          { option: 'A', action: 'Review raw output below', risk: 'LOW' },
          { option: 'B', action: 'Retry analysis with different model', risk: 'LOW' },
          { option: 'C', action: 'Perform manual threat assessment', risk: 'MEDIUM' }
        ],
        intelligence: {
          entities: [],
          locations: [],
          timeframe: 'Unknown',
          keywords: ['UNSTRUCTURED']
        },
        rawResponse: rawResponse
      };

    } catch (error) {
      console.error('Parse error:', error.message);
      return this.createFallbackAssessment(rawResponse, error.message);
    }
  }

  /**
   * Validate and normalize assessment structure
   * @param {object} assessment - Parsed assessment
   */
  validateAndNormalize(assessment) {
    // Normalize threat level
    const validLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validLevels.includes(assessment.threatLevel)) {
      assessment.threatLevel = 'MEDIUM';
    }

    // Ensure confidence is a number
    if (typeof assessment.confidence !== 'number') {
      assessment.confidence = 50;
    }
    assessment.confidence = Math.max(0, Math.min(100, assessment.confidence));

    // Ensure required fields exist
    if (!assessment.executiveSummary && assessment.summary) {
      assessment.executiveSummary = assessment.summary;
    }
    if (!assessment.executiveSummary) {
      assessment.executiveSummary = 'Assessment completed';
    }

    // Ensure arrays exist
    if (!Array.isArray(assessment.keyFindings)) {
      assessment.keyFindings = ['No findings available'];
    }
    if (assessment.keyFindings.length === 0) {
      assessment.keyFindings = ['No specific findings identified'];
    }

    if (!Array.isArray(assessment.threats)) {
      assessment.threats = [];
    }
    if (assessment.threats.length === 0) {
      assessment.threats = [{
        type: 'OTHER',
        description: 'No specific threats identified',
        severity: 'LOW'
      }];
    }

    if (!Array.isArray(assessment.recommendations)) {
      assessment.recommendations = [];
    }
    if (assessment.recommendations.length === 0) {
      assessment.recommendations = [
        { option: 'A', action: 'Continue monitoring', risk: 'LOW' },
        { option: 'B', action: 'Conduct further investigation', risk: 'MEDIUM' },
        { option: 'C', action: 'Escalate to command', risk: 'HIGH' }
      ];
    }

    // Ensure intelligence object exists
    if (!assessment.intelligence || typeof assessment.intelligence !== 'object') {
      assessment.intelligence = {
        entities: [],
        locations: [],
        timeframe: 'Unknown',
        keywords: []
      };
    }

    // Handle legacy intelligenceTags
    if (assessment.intelligenceTags && Array.isArray(assessment.intelligenceTags)) {
      if (!assessment.intelligence.keywords || assessment.intelligence.keywords.length === 0) {
        assessment.intelligence.keywords = assessment.intelligenceTags;
      }
    }

    // Ensure correlatedIndicators exists for multi-report
    if (!assessment.correlatedIndicators) {
      assessment.correlatedIndicators = [];
    }

    // Add timestamp
    if (!assessment.timestamp) {
      assessment.timestamp = new Date().toISOString();
    }

    // Add summary alias for backward compatibility
    if (!assessment.summary) {
      assessment.summary = assessment.executiveSummary;
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
      executiveSummary: 'Unable to generate automated assessment. Manual review required.',
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
          option: 'A',
          action: 'Conduct manual threat assessment',
          risk: 'LOW'
        },
        {
          option: 'B',
          action: 'Review system logs and retry analysis',
          risk: 'LOW'
        },
        {
          option: 'C',
          action: 'Try different AI model or provider',
          risk: 'MEDIUM'
        }
      ],
      intelligence: {
        entities: [],
        locations: [],
        timeframe: 'Unknown',
        keywords: []
      },
      correlatedIndicators: [],
      timestamp: new Date().toISOString(),
      error: error,
      rawResponse: typeof report === 'string' ? report : JSON.stringify(report)
    };
  }
}

module.exports = new PromptService();
