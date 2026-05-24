import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { projectTutorials } from '../data/project-tutorials';
import { useSimulatorStore } from '../store/useSimulatorStore';
import { useEditorStore } from '../store/useEditorStore';
import './ProjectDetailPage.css';

const diffClass = (d: string) => {
  if (d === "boshlang'ich") return 'badge badge-green';
  if (d === "o'rta") return 'badge badge-yellow';
  return 'badge badge-red';
};

const stripNum = (title: string) =>
  title.replace(/^\d+[-–—]?qa[dt]am:\s*/i, '');

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const project = projectTutorials.find((p) => p.id === projectId);

  if (!project) {
    return (
      <>
        <AppHeader />
        <div className="error-page">
          <h2>Loyiha topilmadi</h2>
          <button onClick={() => navigate('/projects')}>← Loyihalarga qaytish</button>
        </div>
      </>
    );
  }

  const handleStartSimulator = async () => {
    setLoading(true);
    try {
      useSimulatorStore.getState().setComponents([]);
      useSimulatorStore.getState().setWires([]);
      useSimulatorStore.getState().setBoardType('arduino-uno');
      useEditorStore.getState().setCode(
        `// ${project.title}\n// Instruksiyaga qarab bosqichma-bosqich yasang!\n\nvoid setup() {\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  // Kodingizni yozing\n}`
      );
      navigate('/editor');
    } catch {
      setLoading(false);
    }
  };

  const step = project.steps[activeStep];
  const totalSteps = project.steps.length;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  return (
    <>
      <AppHeader />
      <div className="project-detail">
        {/* Header */}
        <div className="project-header">
          <button className="back-btn" onClick={() => navigate('/projects')}>
            ← Back to projects
          </button>
          
          <div className="header-meta">
            <span className={diffClass(project.difficulty)}>{project.difficulty}</span>
            <span className="badge badge-purple">{project.duration}</span>
            <span className="badge badge-blue">{project.parts.length} components</span>
          </div>
          
          <h1>{project.title}</h1>
          <p className="description">{project.description}</p>
          
          <div className="skills">
            {project.skills.map((s, i) => (
              <span key={i} className="skill">{s}</span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="project-main">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-title">Steps</div>
            <div className="step-list">
              {project.steps.map((s, i) => (
                <div
                  key={i}
                  className={`step-item ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'done' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="step-num">{i < activeStep ? '✓' : i + 1}</div>
                  <span className="step-label">{stripNum(s.title)}</span>
                </div>
              ))}
            </div>
            <div className="progress">
              <div className="progress-text">Progress</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="content">
            {/* Parts list */}
            {activeStep === 0 && (
              <div className="parts-section">
                <div className="section-title">📦 Required parts</div>
                <div className="parts-grid">
                  {project.parts.map((part, i) => (
                    <div key={i} className="part-card">
                      <div className="part-qty">{part.quantity}×</div>
                      <div>
                        <div className="part-name">{part.name}</div>
                        <div className="part-desc">{part.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step card */}
            <div className="step-card">
              <div className="step-header">
                <div className="step-num-big">{activeStep + 1}</div>
                <h3>{stripNum(step.title)}</h3>
                <span className="step-counter">{activeStep + 1}/{totalSteps}</span>
              </div>

              <div className="step-body">
                {step.description.split('\n').map((line, i) => {
                  if (line.startsWith('**') && line.endsWith('**'))
                    return <h4 key={i}>{line.slice(2, -2)}</h4>;
                  if (line.startsWith('- ') || line.startsWith('• '))
                    return <li key={i}>{line.slice(2)}</li>;
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i}>{line}</p>;
                })}
              </div>

              {step.code && (
                <div className="code-block">
                  <div className="code-header">
                    <span className="code-lang">Arduino</span>
                  </div>
                  <pre><code>{step.code}</code></pre>
                </div>
              )}

              <div className="step-nav">
                <button
                  className="nav-btn prev"
                  onClick={() => setActiveStep(activeStep - 1)}
                  disabled={activeStep === 0}
                >
                  ← Previous
                </button>
                {activeStep < totalSteps - 1 ? (
                  <button className="nav-btn next" onClick={() => setActiveStep(activeStep + 1)}>
                    Next →
                  </button>
                ) : (
                  <button className="nav-btn start" onClick={handleStartSimulator} disabled={loading}>
                    {loading ? 'Loading...' : 'Start Simulation →'}
                  </button>
                )}
              </div>
            </div>

            {/* AI helper note */}
            <div className="ai-note">
              <div className="ai-note-header">
                <span className="ai-dot" />
                <span>AI Assistant</span>
              </div>
              <div className="ai-note-body">
                AI assistant will guide you through this project step by step in the editor.
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};