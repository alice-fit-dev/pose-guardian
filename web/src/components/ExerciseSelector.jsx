const EXERCISES = [
  { id: 'squat',     label: '스쿼트' },
  { id: 'deadlift',  label: '데드리프트' },
  { id: 'bench',     label: '벤치프레스' },
];

export default function ExerciseSelector({ selected, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '12px 0' }}>
      {EXERCISES.map(ex => (
        <button
          key={ex.id}
          onClick={() => onChange(ex.id)}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: selected === ex.id ? '#4f8ef7' : '#2a2a2a',
            color: '#fff',
            fontWeight: selected === ex.id ? 700 : 400,
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          {ex.label}
        </button>
      ))}
    </div>
  );
}
