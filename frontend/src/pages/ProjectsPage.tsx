import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { projectTutorials } from '../data/project-tutorials';
import './ProjectsPage.css';

type DiffFilter = 'all' | "boshlang'ich" | "o'rta" | 'murakkab';

export const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<DiffFilter>('all');

  const filtered = filter === 'all'
    ? projectTutorials
    : projectTutorials.filter((p) => p.difficulty === filter);

  const counts = {
    all: projectTutorials.length,
    "boshlang'ich": projectTutorials.filter(p => p.difficulty === "boshlang'ich").length,
    "o'rta": projectTutorials.filter(p => p.difficulty === "o'rta").length,
    murakkab: projectTutorials.filter(p => p.difficulty === 'murakkab').length,
  };

  return (
    <>
      <AppHeader />
      <div className="projects-page">
        {/* Header */}
        <div className="projects-header">
          <h1>Projects</h1>
          <p>Build real electronic projects with step-by-step guidance</p>
        </div>

        {/* Filters */}
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({counts.all})
          </button>
          <button
            className={`filter-btn ${filter === "boshlang'ich" ? 'active' : ''}`}
            onClick={() => setFilter("boshlang'ich")}
          >
            Beginner ({counts["boshlang'ich"]})
          </button>
          <button
            className={`filter-btn ${filter === "o'rta" ? 'active' : ''}`}
            onClick={() => setFilter("o'rta")}
          >
            Intermediate ({counts["o'rta"]})
          </button>
          <button
            className={`filter-btn ${filter === 'murakkab' ? 'active' : ''}`}
            onClick={() => setFilter('murakkab')}
          >
            Advanced ({counts.murakkab})
          </button>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat">
            <div className="stat-num">{projectTutorials.length}</div>
            <div className="stat-label">Projects</div>
          </div>
          <div className="stat">
            <div className="stat-num">AI</div>
            <div className="stat-label">Assistant</div>
          </div>
          <div className="stat">
            <div className="stat-num">∞</div>
            <div className="stat-label">Possibilities</div>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty">No projects found for this level</div>
        ) : (
          <div className="projects-grid">
            {filtered.map((project) => (
              <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                <div className="card-image" style={{ backgroundImage: `url(${project.image})` }} />
                <div className="card-body">
                  <div className="card-header">
                    <span className={`difficulty ${project.difficulty === "boshlang'ich" ? 'beginner' : project.difficulty === "o'rta" ? 'intermediate' : 'advanced'}`}>
                      {project.difficulty}
                    </span>
                    <span className="duration">{project.duration}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="card-footer">
                    <span className="parts">{project.parts.length} components</span>
                    <span className="start">Start →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};