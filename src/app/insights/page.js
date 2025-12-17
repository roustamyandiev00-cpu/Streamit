'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Target, Lightbulb, 
  ArrowLeft, RefreshCw, AlertCircle, CheckCircle,
  Users, Clock, BarChart3, Zap, Star, Calendar
} from 'lucide-react';
import Link from 'next/link';

export default function InsightsPage() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insights');
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00cc88';
      default: return '#666';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#00cc88';
    if (confidence >= 60) return '#ffaa00';
    return '#ff4444';
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <RefreshCw className="animate-spin" size={32} />
        <p>Analyzing your data...</p>
      </div>
    );
  }

  return (
    <div className="insights-page">
      {/* Header */}
      <div className="insights-header">
        <div className="header-left">
          <Link href="/" className="back-button">
            <ArrowLeft size={20} />
            Back to Dashboard
          </Link>
          <div>
            <h1>AI Insights</h1>
            <p>AI-powered recommendations to grow your streaming audience</p>
          </div>
        </div>
        
        <button onClick={loadInsights} className="refresh-btn">
          <RefreshCw size={16} />
          Refresh Insights
        </button>
      </div>

      {insights && (
        <>
          {/* Performance Score */}
          <div className="performance-section">
            <div className="performance-card">
              <div className="performance-header">
                <div className="performance-icon">
                  <Brain size={32} />
                </div>
                <div>
                  <h2>Performance Score</h2>
                  <p>Overall streaming performance analysis</p>
                </div>
              </div>
              
              <div className="performance-score">
                <div className="score-circle">
                  <div className="score-value">{insights.performance.score}</div>
                  <div className="score-label">/ 100</div>
                </div>
                
                <div className="score-details">
                  <div className={`score-trend ${insights.performance.trend}`}>
                    <TrendingUp size={16} />
                    {insights.performance.trend === 'up' ? '+' : ''}{insights.performance.change}% this week
                  </div>
                  
                  <div className="predictions">
                    <h4>Predictions</h4>
                    <div className="prediction-item">
                      <span>Next week viewers:</span>
                      <span className="prediction-value">{insights.performance.predictions.nextWeek.expectedViewers}</span>
                      <span className="confidence">({insights.performance.predictions.nextWeek.confidence}% confidence)</span>
                    </div>
                    <div className="prediction-item">
                      <span>Monthly growth:</span>
                      <span className="prediction-value">+{insights.performance.predictions.nextMonth.expectedGrowth}%</span>
                      <span className="confidence">({insights.performance.predictions.nextMonth.confidence}% confidence)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="recommendations-section">
            <h2>AI Recommendations</h2>
            <div className="recommendations-grid">
              {insights.recommendations.map((rec, index) => (
                <div 
                  key={index} 
                  className={`recommendation-card ${selectedRecommendation === index ? 'selected' : ''}`}
                  onClick={() => setSelectedRecommendation(selectedRecommendation === index ? null : index)}
                >
                  <div className="rec-header">
                    <div className="rec-icon">
                      {rec.type === 'scheduling' && <Calendar size={20} />}
                      {rec.type === 'content' && <BarChart3 size={20} />}
                      {rec.type === 'engagement' && <Users size={20} />}
                      {rec.type === 'technical' && <Zap size={20} />}
                    </div>
                    <div className="rec-priority" style={{ color: getPriorityColor(rec.priority) }}>
                      {rec.priority.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3>{rec.title}</h3>
                  <p>{rec.description}</p>
                  
                  <div className="rec-impact">
                    <Lightbulb size={14} />
                    <span>{rec.impact}</span>
                  </div>
                  
                  <div className="rec-confidence">
                    <div className="confidence-bar">
                      <div 
                        className="confidence-fill" 
                        style={{ 
                          width: `${rec.confidence}%`,
                          backgroundColor: getConfidenceColor(rec.confidence)
                        }}
                      />
                    </div>
                    <span>{rec.confidence}% confidence</span>
                  </div>
                  
                  {selectedRecommendation === index && (
                    <div className="rec-action">
                      <div className="action-steps">
                        <h4>Action Steps:</h4>
                        <p>{rec.action}</p>
                      </div>
                      <button className="implement-btn">
                        <CheckCircle size={16} />
                        Mark as Implemented
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Audience Analysis */}
          <div className="audience-section">
            <h2>Audience Analysis</h2>
            <div className="audience-grid">
              <div className="audience-card">
                <h3>Demographics</h3>
                <div className="demo-stats">
                  <div className="demo-item">
                    <span>Primary Age Group:</span>
                    <span className="demo-value">{insights.audience.demographics.primaryAge}</span>
                  </div>
                  <div className="demo-item">
                    <span>Top Location:</span>
                    <span className="demo-value">{insights.audience.demographics.primaryLocation}</span>
                  </div>
                  <div className="demo-item">
                    <span>Main Device:</span>
                    <span className="demo-value">{insights.audience.demographics.primaryDevice}</span>
                  </div>
                  <div className="demo-item">
                    <span>Peak Time:</span>
                    <span className="demo-value">{insights.audience.demographics.peakTime}</span>
                  </div>
                </div>
              </div>

              <div className="audience-card">
                <h3>Behavior Metrics</h3>
                <div className="behavior-stats">
                  <div className="behavior-item">
                    <div className="behavior-label">Avg Watch Time</div>
                    <div className="behavior-value">{insights.audience.behavior.avgWatchTime}min</div>
                  </div>
                  <div className="behavior-item">
                    <div className="behavior-label">Return Rate</div>
                    <div className="behavior-value">{insights.audience.behavior.returnRate}%</div>
                  </div>
                  <div className="behavior-item">
                    <div className="behavior-label">Engagement Rate</div>
                    <div className="behavior-value">{insights.audience.behavior.engagementRate}%</div>
                  </div>
                  <div className="behavior-item">
                    <div className="behavior-label">Chat Activity</div>
                    <div className="behavior-value">{insights.audience.behavior.chatActivity}</div>
                  </div>
                </div>
              </div>

              <div className="audience-card">
                <h3>Interest Analysis</h3>
                <div className="interests-list">
                  {insights.audience.interests.map((interest, index) => (
                    <div key={index} className="interest-item">
                      <span className="interest-topic">{interest.topic}</span>
                      <div className="interest-bar">
                        <div 
                          className="interest-fill" 
                          style={{ width: `${interest.affinity}%` }}
                        />
                      </div>
                      <span className="interest-score">{interest.affinity}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Growth Trends */}
          <div className="trends-section">
            <h2>Growth Trends</h2>
            <div className="trends-grid">
              <div className="trend-card">
                <div className="trend-header">
                  <Users size={24} />
                  <div>
                    <h3>Viewers</h3>
                    <div className="trend-change positive">
                      +{insights.trends.growth.viewers.change}%
                    </div>
                  </div>
                </div>
                <div className="trend-values">
                  <span>Current: {insights.trends.growth.viewers.current}</span>
                  <span>Previous: {insights.trends.growth.viewers.previous}</span>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-header">
                  <BarChart3 size={24} />
                  <div>
                    <h3>Engagement</h3>
                    <div className="trend-change positive">
                      +{insights.trends.growth.engagement.change}%
                    </div>
                  </div>
                </div>
                <div className="trend-values">
                  <span>Current: {insights.trends.growth.engagement.current}%</span>
                  <span>Previous: {insights.trends.growth.engagement.previous}%</span>
                </div>
              </div>

              <div className="trend-card">
                <div className="trend-header">
                  <Clock size={24} />
                  <div>
                    <h3>Watch Time</h3>
                    <div className="trend-change positive">
                      +{insights.trends.growth.watchTime.change}%
                    </div>
                  </div>
                </div>
                <div className="trend-values">
                  <span>Current: {insights.trends.growth.watchTime.current}min</span>
                  <span>Previous: {insights.trends.growth.watchTime.previous}min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="alerts-section">
            <h2>Smart Alerts</h2>
            <div className="alerts-list">
              {insights.alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === 'opportunity' && <TrendingUp size={20} />}
                    {alert.type === 'warning' && <AlertCircle size={20} />}
                    {alert.type === 'info' && <Lightbulb size={20} />}
                  </div>
                  <div className="alert-content">
                    <p>{alert.message}</p>
                    <span className="alert-action">{alert.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .insights-page {
          min-height: 100vh;
          background: #09090b;
          color: white;
          padding: 2rem;
        }

        .insights-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 1rem;
        }

        .insights-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #2d2e36;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #5c4dff;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s;
          font-weight: 500;
          font-size: 0.9rem;
          background: rgba(92, 77, 255, 0.1);
          border: 1px solid rgba(92, 77, 255, 0.2);
        }

        .back-button:hover {
          color: white;
          background: #5c4dff;
          border-color: #5c4dff;
          transform: translateY(-1px);
        }

        .insights-header h1 {
          margin: 0 0 0.25rem 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .insights-header p {
          margin: 0;
          color: #a1a1aa;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .refresh-btn:hover {
          opacity: 0.9;
        }

        .performance-section {
          margin-bottom: 2rem;
        }

        .performance-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 2rem;
        }

        .performance-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .performance-icon {
          width: 60px;
          height: 60px;
          background: rgba(92, 77, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .performance-header h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .performance-header p {
          margin: 0;
          color: #a1a1aa;
        }

        .performance-score {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border: 4px solid var(--primary);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .score-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary);
        }

        .score-label {
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .score-details {
          flex: 1;
        }

        .score-trend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }

        .score-trend.up {
          color: #00cc88;
        }

        .predictions h4 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .prediction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .prediction-value {
          font-weight: 600;
          color: var(--primary);
        }

        .confidence {
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .recommendations-section {
          margin-bottom: 2rem;
        }

        .recommendations-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .recommendation-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .recommendation-card:hover {
          border-color: var(--primary);
        }

        .recommendation-card.selected {
          border-color: var(--primary);
          background: rgba(92, 77, 255, 0.05);
        }

        .rec-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .rec-icon {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a1a1aa;
        }

        .rec-priority {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        }

        .recommendation-card h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .recommendation-card p {
          margin: 0 0 1rem 0;
          color: #a1a1aa;
          line-height: 1.5;
        }

        .rec-impact {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #00cc88;
        }

        .rec-confidence {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .confidence-bar {
          flex: 1;
          height: 6px;
          background: #2d2e36;
          border-radius: 3px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .rec-confidence span {
          font-size: 0.8rem;
          color: #a1a1aa;
          min-width: 80px;
        }

        .rec-action {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #2d2e36;
        }

        .action-steps h4 {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .action-steps p {
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
          color: #a1a1aa;
        }

        .implement-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #00cc88;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: opacity 0.2s;
        }

        .implement-btn:hover {
          opacity: 0.9;
        }

        .audience-section {
          margin-bottom: 2rem;
        }

        .audience-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .audience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .audience-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .audience-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .demo-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .demo-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .demo-value {
          font-weight: 600;
          color: var(--primary);
        }

        .behavior-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .behavior-item {
          text-align: center;
        }

        .behavior-label {
          font-size: 0.8rem;
          color: #a1a1aa;
          margin-bottom: 0.5rem;
        }

        .behavior-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .interests-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .interest-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .interest-topic {
          min-width: 80px;
          font-size: 0.9rem;
        }

        .interest-bar {
          flex: 1;
          height: 6px;
          background: #2d2e36;
          border-radius: 3px;
          overflow: hidden;
        }

        .interest-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .interest-score {
          font-size: 0.8rem;
          color: #a1a1aa;
          min-width: 35px;
          text-align: right;
        }

        .trends-section {
          margin-bottom: 2rem;
        }

        .trends-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .trends-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .trend-card {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .trend-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .trend-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .trend-change {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .trend-change.positive {
          color: #00cc88;
        }

        .trend-values {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #a1a1aa;
        }

        .alerts-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .alert-item {
          background: #1f2026;
          border: 1px solid #2d2e36;
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .alert-item.opportunity {
          border-left: 4px solid #00cc88;
        }

        .alert-item.warning {
          border-left: 4px solid #ffaa00;
        }

        .alert-item.info {
          border-left: 4px solid var(--primary);
        }

        .alert-icon {
          color: #a1a1aa;
        }

        .alert-content {
          flex: 1;
        }

        .alert-content p {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .alert-action {
          font-size: 0.8rem;
          color: #a1a1aa;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .insights-page {
            padding: 1rem;
          }

          .insights-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .performance-score {
            flex-direction: column;
            text-align: center;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .audience-grid {
            grid-template-columns: 1fr;
          }

          .trends-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}