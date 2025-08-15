import React, { useState } from 'react';
import { Check, ChevronDown, User, BookOpen, Target, Search } from 'lucide-react';
import { EDUCATION_LEVELS, getExaminationsForEducationLevel, TARGET_EXAMINATIONS } from '../lib/examinations';
import type { EducationLevel, TargetExamination } from '../lib/types';

interface ProfileSetupProps {
  onComplete: (data: {
    educationLevel: EducationLevel;
    targetExaminations: string[];
  }) => Promise<void>;
  loading?: boolean;
}

export default function ProfileSetup({ onComplete, loading = false }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableExams = educationLevel ? getExaminationsForEducationLevel(educationLevel) : [];
  const filteredExams = availableExams.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEducationLevelSelect = (level: EducationLevel) => {
    setEducationLevel(level);
    setSelectedExams([]); // Reset selected exams when education level changes
    setDropdownOpen(false);
    setStep(2);
  };

  const handleExamToggle = (examId: string) => {
    setSelectedExams(prev => 
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleComplete = async () => {
    if (educationLevel) {
      await onComplete({
        educationLevel,
        targetExaminations: selectedExams,
      });
    }
  };

  const canProceed = step === 1 ? educationLevel : educationLevel && selectedExams.length > 0;

  return (
    <div className="profileSetupOverlay">
      <div className="profileSetupModal surface">
        <div className="profileSetupHeader">
          <div className="profileSetupIcon">
            <User size={24} />
          </div>
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your learning experience</p>
        </div>

        <div className="profileSetupSteps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="stepNumber">
              {step > 1 ? <Check size={16} /> : '1'}
            </div>
            <span>Education Level</span>
          </div>
          <div className="stepConnector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="stepNumber">
              {step > 2 ? <Check size={16} /> : '2'}
            </div>
            <span>Target Exams</span>
          </div>
        </div>

        <div className="profileSetupContent">
          {step === 1 && (
            <div className="stepContent">
              <div className="stepIcon">
                <BookOpen size={32} />
              </div>
              <h3>What's your current education level?</h3>
              <p>This helps us recommend relevant content and examinations.</p>
              
              <div className="educationLevelGrid">
                {EDUCATION_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    className={`educationLevelCard ${educationLevel === level.value ? 'selected' : ''}`}
                    onClick={() => handleEducationLevelSelect(level.value)}
                  >
                    <span className="levelLabel">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="stepContent">
              <div className="stepIcon">
                <Target size={32} />
              </div>
              <h3>Select your target examinations</h3>
              <p>Choose the exams you're preparing for or interested in.</p>
              
              {/* Search Bar */}
              <div className="searchContainer">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search examinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="searchInput"
                />
              </div>

              {/* Scrollable Exams List */}
              <div className="examsListContainer">
                <div className="examsList scrollable">
                  {filteredExams.map((exam) => (
                    <label key={exam.id} className="examItem">
                      <input
                        type="checkbox"
                        checked={selectedExams.includes(exam.id)}
                        onChange={() => handleExamToggle(exam.id)}
                      />
                      <div className="examInfo">
                        <span className="examName">{exam.name}</span>
                        <span className="examDescription">{exam.description}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {filteredExams.length === 0 && searchTerm && (
                  <div className="noResultsMessage">
                    <p>No examinations found matching "{searchTerm}"</p>
                  </div>
                )}

                {availableExams.length === 0 && (
                  <div className="noExamsMessage">
                    <p>No specific examinations available for this education level.</p>
                    <p>You can still proceed and explore general content.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profileSetupActions">
          {step === 2 && (
            <button
              className="button button-secondary"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          )}
          
          <button
            className="button button-primary"
            onClick={step === 1 ? () => setStep(2) : handleComplete}
            disabled={!canProceed || loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Setting up...
              </>
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Complete Setup'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
