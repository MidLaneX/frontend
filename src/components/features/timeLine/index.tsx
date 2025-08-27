import React, { useState, useEffect } from 'react';
import type { SprintDTO } from '@/types/featurevise/sprint';
import { SprintService } from '@/services/SprintService';

// Helper to parse dates for timeline calculations
const parseDate = (dateStr: string) => new Date(dateStr);

interface TimelinePageProps {
  projectId: number;
  template?: string;
}

const Timeline: React.FC<TimelinePageProps> = ({ projectId, template = 'scrum' }) => {
  const [sprints, setSprints] = useState<SprintDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSprints() {
      setLoading(true);
      try {
        const response = await SprintService.getAllSprints(projectId, template);
        setSprints(response.data);
      } catch (error) {
        console.error('Failed to fetch sprints', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSprints();
  }, [projectId, template]);

  if (loading) return <div>Loading timeline...</div>;
  if (sprints.length === 0) return <div>No sprints to display</div>;

  // Calculate timeline boundaries (min start date, max end date)
  const startDates = sprints.map(s => parseDate(s.startDate));
  const endDates = sprints.map(s => parseDate(s.endDate));
  const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
  const timelineDuration = maxDate.getTime() - minDate.getTime();

  // Converts a date to a percentage position on the timeline
  const getPositionPercent = (dateStr: string) => {
    const date = parseDate(dateStr);
    return ((date.getTime() - minDate.getTime()) / timelineDuration) * 100;
  };

  // Color picker based on sprint status
  const getColorByStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned':
        return '#007bff'; // Blue
      case 'active':
        return '#28a745'; // Green
      case 'completed':
        return '#6c757d'; // Gray (can change if you want)
      default:
        return '#6c757d'; // Default to gray for unknown statuses
    }
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>Project Timeline</h2>
      <div
        style={{
          position: 'relative',
          height: sprints.length * 50 + 40,
          border: '1px solid #ccc',
          padding: '20px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Timeline base line */}
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#ddd',
          }}
        />

        {sprints.map((sprint, i) => {
          const leftPercent = getPositionPercent(sprint.startDate);
          const rightPercent = getPositionPercent(sprint.endDate);
          const widthPercent = rightPercent - leftPercent;
          const color = getColorByStatus(sprint.status);

          return (
            <div
              key={sprint.id}
              style={{
                position: 'absolute',
                top: 40 + i * 50,
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: 30,
                backgroundColor: color,
                borderRadius: 4,
                color: 'white',
                textAlign: 'center',
                lineHeight: '30px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 'bold',
              }}
              title={`${sprint.name} (${sprint.startDate} - ${sprint.endDate}) - Status: ${sprint.status}`}
            >
              {sprint.name}
            </div>
          );
        })}

        {/* Timeline labels: show min and max dates */}
        <div style={{ position: 'absolute', top: 0, left: 0, fontSize: 12 }}>
          {minDate.toISOString().slice(0, 10)}
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, fontSize: 12 }}>
          {maxDate.toISOString().slice(0, 10)}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
