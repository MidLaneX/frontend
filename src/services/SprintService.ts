// services/SprintService.ts
import { sprintApi } from "@/api/endpoints/sprint";
import type { SprintDTO } from "@/types/featurevise/sprint";

export const SprintService = {
  getAllSprints: (projectId: number, template = "scrum") =>
    sprintApi.getAllSprints(projectId, template),
  getLatestSprint: (projectId: number, template = "scrum") =>
    sprintApi.getLatestSprint(projectId, template),
  createSprint: (projectId: number, sprint: SprintDTO, template = "scrum") =>
    sprintApi.createSprint(projectId, sprint, template),
  updateSprint: (
    projectId: number,
    sprintId: number,
    sprint: Partial<SprintDTO>,
    template = "scrum",
  ) => sprintApi.updateSprint(projectId, sprintId, sprint, template),
  deleteSprint: (projectId: number, sprintId: number, template = "scrum") =>
    sprintApi.deleteSprint(projectId, sprintId, template),
};
