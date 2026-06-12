import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { AddExerciseForm } from './AddExerciseForm';
import { useCustomisationStore } from '../../store/customisationStore';
import { getExerciseLibrary } from '../../data/exercises';
import type { TennisCategory } from '../../types';

const CATEGORY_ORDER: TennisCategory[] = [
  'lateral-agility',
  'rotational-power',
  'shoulder-stability',
  'hiit-stamina',
  'general-strength',
];

const CATEGORY_LABELS: Record<TennisCategory, string> = {
  'lateral-agility':    'Lateral Agility',
  'rotational-power':   'Rotational Power',
  'shoulder-stability': 'Shoulder Stability',
  'hiit-stamina':       'HIIT Stamina',
  'general-strength':   'General Strength',
};

interface Props {
  onBack: () => void;
}

export function ExerciseManagement({ onBack }: Props) {
  const customExercises = useCustomisationStore((s) => s.customExercises);
  const isExcluded = useCustomisationStore((s) => s.isExcluded);
  const isCategoryBlocked = useCustomisationStore((s) => s.isCategoryBlocked);
  const excludeExercise = useCustomisationStore((s) => s.excludeExercise);
  const includeExercise = useCustomisationStore((s) => s.includeExercise);
  const blockCategory = useCustomisationStore((s) => s.blockCategory);
  const unblockCategory = useCustomisationStore((s) => s.unblockCategory);
  const addCustomExercise = useCustomisationStore((s) => s.addCustomExercise);
  const deleteCustomExercise = useCustomisationStore((s) => s.deleteCustomExercise);

  const [addingToCategory, setAddingToCategory] = useState<TennisCategory | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const allExercises = getExerciseLibrary(customExercises);
  const allBlocked = CATEGORY_ORDER.every((cat) => isCategoryBlocked(cat));

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-app)' }}>
      {/* Header */}
      <header
        className="flex items-center gap-2 flex-shrink-0"
        style={{
          height: 56,
          padding: '0 8px 0 4px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--fg-secondary)',
          }}
        >
          <Icon name="chevron-left" size={20} />
        </button>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--fg-primary)',
            margin: 0,
          }}
        >
          Exercise Management
        </h1>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>
        {/* All-blocked warning */}
        {allBlocked && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--color-forest-100)',
              marginBottom: 16,
              color: 'var(--color-forest-800)',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
            }}
          >
            <Icon name="spark" size={16} />
            No exercises available — unblock at least one category to generate workouts.
          </div>
        )}

        {/* Category sections */}
        {CATEGORY_ORDER.map((cat) => {
          const blocked = isCategoryBlocked(cat);
          const categoryExercises = allExercises.filter((e) => e.category === cat);
          const isCustom = (id: string) => customExercises.some((e) => e.id === id);

          return (
            <div
              key={cat}
              style={{
                background: 'var(--bg-surface)',
                borderRadius: 16,
                boxShadow: 'var(--shadow-card)',
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              {/* Category header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderBottom: blocked ? 'none' : '1px solid var(--border-hairline)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: blocked ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
                    margin: 0,
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </h2>
                <button
                  type="button"
                  onClick={() => blocked ? unblockCategory(cat) : blockCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-hairline)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: blocked ? 'var(--brand)' : 'var(--fg-tertiary)',
                  }}
                >
                  <Icon name={blocked ? 'plus' : 'x'} size={12} />
                  {blocked ? 'Unblock' : 'Block'}
                </button>
              </div>

              {/* Exercise list — hidden when blocked */}
              {!blocked && (
                <>
                  {categoryExercises.map((ex) => {
                    const excluded = isExcluded(ex.id);
                    const custom = isCustom(ex.id);
                    const pendingDelete = confirmDeleteId === ex.id;

                    return (
                      <div
                        key={ex.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '11px 16px',
                          borderBottom: '1px solid var(--border-hairline)',
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            fontFamily: 'var(--font-sans)',
                            fontSize: 14,
                            color: excluded ? 'var(--fg-tertiary)' : 'var(--fg-primary)',
                            textDecoration: excluded ? 'line-through' : 'none',
                          }}
                        >
                          {ex.name}
                        </span>

                        {custom && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: 999,
                              background: 'var(--brand-soft)',
                              color: 'var(--color-forest-800)',
                              flexShrink: 0,
                            }}
                          >
                            Custom
                          </span>
                        )}

                        {/* Exclude / include toggle */}
                        <button
                          type="button"
                          onClick={() => excluded ? includeExercise(ex.id) : excludeExercise(ex.id)}
                          aria-label={excluded ? 'Re-include exercise' : 'Exclude exercise'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            border: 'none',
                            borderRadius: '50%',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: excluded ? 'var(--brand)' : 'var(--fg-tertiary)',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name={excluded ? 'plus' : 'x'} size={16} />
                        </button>

                        {/* Delete button (custom exercises only) */}
                        {custom && !pendingDelete && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(ex.id)}
                            aria-label="Delete custom exercise"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 32,
                              height: 32,
                              border: 'none',
                              borderRadius: '50%',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#a23a3a',
                              flexShrink: 0,
                            }}
                          >
                            <Icon name="x" size={14} />
                          </button>
                        )}

                        {/* Confirm delete inline */}
                        {custom && pendingDelete && (
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCustomExercise(ex.id);
                                setConfirmDeleteId(null);
                              }}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#a23a3a',
                                color: 'white',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 8,
                                border: '1px solid var(--border-hairline)',
                                background: 'transparent',
                                color: 'var(--fg-secondary)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: 12,
                                cursor: 'pointer',
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add exercise button */}
                  <button
                    type="button"
                    onClick={() => setAddingToCategory(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--brand)',
                      textAlign: 'left',
                    }}
                  >
                    <Icon name="plus" size={16} />
                    Add exercise
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* AddExerciseForm overlay */}
      {addingToCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14,31,23,0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 100,
          }}
          onClick={() => setAddingToCategory(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 640,
              margin: '0 auto',
              background: 'var(--bg-surface)',
              borderRadius: '20px 20px 0 0',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <AddExerciseForm
              initialCategory={addingToCategory}
              existingExercises={getExerciseLibrary(customExercises)}
              onSave={(name, category, goalTags) => {
                addCustomExercise(name, category, goalTags);
                setAddingToCategory(null);
              }}
              onCancel={() => setAddingToCategory(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
