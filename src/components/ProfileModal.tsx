import React, { useState, useEffect } from 'react';
import { X, User, BookOpen, Target, Save, ChevronDown, Search } from 'lucide-react';
import { EDUCATION_LEVELS, getExaminationsForEducationLevel } from '../lib/examinations';
import type { EducationLevel, UserProfile } from '../lib/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (data: {
    educationLevel: EducationLevel;
    targetExaminations: string[];
  }) => Promise<void>;
  loading?: boolean;
}

export default function ProfileModal({ isOpen, onClose, profile, onSave, loading = false }: ProfileModalProps) {
  const [educationLevel, setEducationLevel] = useState<EducationLevel | null>(profile.educationLevel);
  const [selectedExams, setSelectedExams] = useState<string[]>(profile.targetExaminations);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableExams = educationLevel ? getExaminationsForEducationLevel(educationLevel) : [];
  const filteredExams = availableExams.filter(exam => 
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setEducationLevel(profile.educationLevel);
      setSelectedExams(profile.targetExaminations);
      setSearchTerm('');
      setDropdownOpen(false);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [dropdownOpen]);

  const handleEducationLevelChange = (level: EducationLevel) => {
    setEducationLevel(level);
    // Reset selected exams when education level changes
    setSelectedExams([]);
    setDropdownOpen(false);
  };

  const handleExamToggle = (examId: string) => {
    setSelectedExams(prev => 
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : [...prev, examId]
    );
  };

  const handleSave = async () => {
    if (educationLevel) {
      await onSave({
        educationLevel,
        targetExaminations: selectedExams,
      });
      onClose();
    }
  };

  const hasChanges = educationLevel !== profile.educationLevel || 
    JSON.stringify(selectedExams.sort()) !== JSON.stringify(profile.targetExaminations.sort());

  if (!isOpen) return null;

  // Close dropdown when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setDropdownOpen(false);
      onClose();
    }
  };

  return (
    <div className="modalOverlay" onClick={handleBackdropClick}>
      <div className="modal surface profileModal" onClick={(e) => {
        e.stopPropagation();
        // Close dropdown when clicking elsewhere in modal
        if (!(e.target as Element).closest('.educationDropdown')) {
          setDropdownOpen(false);
        }
      }}>
        <div className="modalHeader">
          <div className="modalTitle">
          </div>
          <button 
            className="button button-ghost focus-ring"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modalContent">
          {/* User Info Section */}
          <div className="profileSection userInfoSection">
            <div className="userInfo">
              <div className="userAvatar">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="" className="avatarImg" />
                ) : (
                  <User size={60} />
                )}
              </div>
              <div className="userDetails">
                <div className="userName">{profile.displayName || profile.email}</div>
                <div className="userEmail">{profile.email}</div>
              </div>
            </div>
          </div>

          {/* Education Level Section */}
          <div className="profileSection educationLevelSection">
            <div className="sectionHeader">
              <BookOpen size={18} className="educationIcon" />
              <h3>Education Level</h3>
            </div>
            <div className="educationDropdown">
              <button
                className={`dropdownButton ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{educationLevel ? EDUCATION_LEVELS.find(l => l.value === educationLevel)?.label : 'Select education level'}</span>
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className="dropdownMenu">
                  {EDUCATION_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      className={`dropdownItem ${educationLevel === level.value ? 'selected' : ''}`}
                      onClick={() => handleEducationLevelChange(level.value)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Target Examinations Section */}
          {educationLevel && (
            <div className="profileSection targetExaminationsSection">
              <div className="sectionHeader">
                <Target size={18} className="targetIcon" />
                <h3>Target Examinations</h3>
              </div>
              
              {/* Search Bar */}
              <div className="searchContainer">
                <Search size={16} className="searchIcon" />
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
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
