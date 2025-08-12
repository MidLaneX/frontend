export interface SprintDTO {
  id?: number;
  projectId?: number;
  name: string;
  startDate: string; // or Date if you handle serialization
  endDate: string;
  goal?: string;
  status?: string;
}
