// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Button,
//   Paper,
//   Chip,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Alert,
//   CircularProgress,
//   Avatar,
//   Tooltip,
//   LinearProgress,
//   Divider,
//   Stepper,
//   Step,
//   StepLabel,
//   StepContent,
// } from "@mui/material";
// import {
//   Add as AddIcon,
//   Edit as EditIcon,
//   Analytics as SigmaIcon,
//   TrendingDown as DefectIcon,
//   Speed as ProcessIcon,
//   Assessment as DataIcon,
//   Assignment as TaskIcon,
//   CalendarToday as CalendarIcon,
// } from "@mui/icons-material";
// import { TaskService } from "@/services/TaskService";
// import type { Task, TaskStatus, TaskPriority } from "@/types";

// interface SixSigmaProps {
//   projectId: string;
//   projectName?: string;
//   templateType?: string;
// }

// const dmaikPhases = [
//   { phase: "Define", description: "Define the problem and project goals" },
//   { phase: "Measure", description: "Measure current performance" },
//   { phase: "Analyze", description: "Analyze data to find root causes" },
//   { phase: "Improve", description: "Implement solutions" },
//   { phase: "Control", description: "Control and sustain improvements" },
// ];

// const statusOptions: TaskStatus[] = [
//   "Backlog",
//   "Todo",
//   "In Progress",
//   "Review",
//   "Done",
// ];
// const priorityOptions: TaskPriority[] = [
//   "Highest",
//   "High",
//   "Medium",
//   "Low",
//   "Lowest",
// ];
// const dmaikTypes = [
//   "Problem Definition",
//   "Data Collection",
//   "Root Cause Analysis",
//   "Solution Implementation",
//   "Control Plan",
// ];

// const SixSigma: React.FC<SixSigmaProps> = ({
//   projectId,
//   projectName,
//   templateType = "sixsigma",
// }) => {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [editTask, setEditTask] = useState<Task | null>(null);
//   const [activePhase, setActivePhase] = useState(0);

//   const [newTaskData, setNewTaskData] = useState<Partial<Task>>({
//     title: "",
//     description: "",
//     priority: "Medium",
//     status: "Todo",
//     type: "Problem Definition",
//     assignee: "",
//     reporter: "",
//     dueDate: "",
//     storyPoints: 3,
//     labels: [],
//     comments: [],
//   });

//   const fetchTasks = async () => {
//     setLoading(true);
//     try {
//       const data = await TaskService.getTasksByProjectId(
//         Number(projectId),
//         templateType,
//       );
//       setTasks(data || []);
//       setError(null);
//     } catch (err) {
//       console.error("Failed to load tasks:", err);
//       setError("Failed to load tasks.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, [projectId, templateType]);

//   const handleSave = async () => {
//     if (!newTaskData.title) return;

//     try {
//       if (editTask) {
//         await TaskService.updateTask(
//           Number(projectId),
//           Number(editTask.id),
//           newTaskData,
//           templateType,
//         );
//       } else {
//         await TaskService.createTask(
//           Number(projectId),
//           newTaskData as Omit<Task, "id">,
//           templateType,
//         );
//       }

//       setOpenDialog(false);
//       setEditTask(null);
//       resetForm();
//       fetchTasks();
//     } catch (error) {
//       console.error("Failed to save task:", error);
//       setError("Failed to save task.");
//     }
//   };

//   const resetForm = () => {
//     setNewTaskData({
//       title: "",
//       description: "",
//       priority: "Medium",
//       status: "Todo",
//       type: "Problem Definition",
//       assignee: "",
//       reporter: "",
//       dueDate: "",
//       storyPoints: 3,
//       labels: [],
//       comments: [],
//     });
//   };

//   const getTasksByPhase = (phase: string) => {
//     return tasks.filter((task) => task.labels && task.labels.includes(phase));
//   };

//   const getPhaseProgress = (phase: string) => {
//     const phaseTasks = getTasksByPhase(phase);
//     if (phaseTasks.length === 0) return 0;
//     const completedTasks = phaseTasks.filter((task) => task.status === "Done");
//     return (completedTasks.length / phaseTasks.length) * 100;
//   };

//   const getDefectRate = () => {
//     const bugTasks = tasks.filter((task) => task.type === "Bug");
//     const totalTasks = tasks.length;
//     return totalTasks > 0
//       ? ((bugTasks.length / totalTasks) * 100).toFixed(1)
//       : "0";
//   };

//   const getProcessEfficiency = () => {
//     const completedTasks = tasks.filter(
//       (task) => task.status === "Done",
//     ).length;
//     const totalTasks = tasks.length;
//     return totalTasks > 0
//       ? ((completedTasks / totalTasks) * 100).toFixed(1)
//       : "0";
//   };

//   const getPriorityColor = (priority: TaskPriority) => {
//     switch (priority) {
//       case "Highest":
//         return "#d32f2f";
//       case "High":
//         return "#f57c00";
//       case "Medium":
//         return "#1976d2";
//       case "Low":
//         return "#388e3c";
//       case "Lowest":
//         return "#7b1fa2";
//       default:
//         return "#1976d2";
//     }
//   };

//   const getStatusColor = (status: TaskStatus) => {
//     switch (status) {
//       case "Backlog":
//         return "#757575";
//       case "Todo":
//         return "#1976d2";
//       case "In Progress":
//         return "#f57c00";
//       case "Review":
//         return "#9c27b0";
//       case "Done":
//         return "#4caf50";
//       default:
//         return "#757575";
//     }
//   };

//   const renderTaskCard = (task: Task) => (
//     <Card
//       key={task.id}
//       sx={{ mb: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}
//     >
//       <CardContent sx={{ p: 2 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             mb: 1,
//           }}
//         >
//           <Typography variant="subtitle1" fontWeight={600}>
//             {task.title}
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Chip
//               label={task.priority}
//               size="small"
//               sx={{
//                 bgcolor: `${getPriorityColor(task.priority)}15`,
//                 color: getPriorityColor(task.priority),
//                 border: `1px solid ${getPriorityColor(task.priority)}50`,
//               }}
//             />
//             <Chip
//               label={task.status}
//               size="small"
//               sx={{
//                 bgcolor: `${getStatusColor(task.status)}15`,
//                 color: getStatusColor(task.status),
//               }}
//             />
//             <IconButton
//               size="small"
//               onClick={() => {
//                 setEditTask(task);
//                 setNewTaskData({
//                   title: task.title,
//                   description: task.description,
//                   priority: task.priority,
//                   status: task.status,
//                   type: task.type,
//                   assignee: task.assignee,
//                   reporter: task.reporter,
//                   dueDate: task.dueDate,
//                   storyPoints: task.storyPoints,
//                   labels: task.labels,
//                   comments: task.comments,
//                 });
//                 setOpenDialog(true);
//               }}
//             >
//               <EditIcon sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Box>
//         </Box>

//         {task.description && (
//           <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//             {task.description}
//           </Typography>
//         )}

//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             {task.assignee && (
//               <Tooltip title={`Assigned to ${task.assignee}`}>
//                 <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
//                   {task.assignee.charAt(0).toUpperCase()}
//                 </Avatar>
//               </Tooltip>
//             )}
//             {task.dueDate && (
//               <Chip
//                 icon={<CalendarIcon sx={{ fontSize: 12 }} />}
//                 label={new Date(task.dueDate).toLocaleDateString()}
//                 size="small"
//                 variant="outlined"
//                 sx={{ height: 20, fontSize: 10 }}
//               />
//             )}
//           </Box>
//           {task.storyPoints && (
//             <Chip
//               label={`${task.storyPoints} pts`}
//               size="small"
//               sx={{
//                 height: 20,
//                 fontSize: 10,
//                 fontWeight: 600,
//                 bgcolor: "primary.50",
//                 color: "primary.main",
//               }}
//             />
//           )}
//         </Box>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "50vh",
//         }}
//       >
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading Six Sigma workspace...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         bgcolor: "#f8f9fa",
//       }}
//     >
//       {/* Header */}
//       <Paper
//         elevation={0}
//         sx={{
//           px: 3,
//           py: 2,
//           borderBottom: "1px solid #e0e0e0",
//           bgcolor: "white",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//           <SigmaIcon sx={{ color: "primary.main", fontSize: 28 }} />
//           <Box>
//             <Typography variant="h5" fontWeight={700} color="text.primary">
//               Six Sigma (DMAIC)
//             </Typography>
//             {projectName && (
//               <Typography variant="body2" color="text.secondary">
//                 {projectName}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => setOpenDialog(true)}
//           sx={{
//             borderRadius: 2,
//             px: 3,
//             py: 1,
//             textTransform: "none",
//             fontWeight: 600,
//           }}
//         >
//           Add Task
//         </Button>
//       </Paper>

//       {error && (
//         <Alert severity="error" sx={{ m: 2 }}>
//           {error}
//         </Alert>
//       )}

//       {/* Metrics Dashboard */}
//       <Paper sx={{ m: 3, p: 3, borderRadius: 2 }}>
//         <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
//           Six Sigma Metrics
//         </Typography>
//         <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
//           <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
//             <DefectIcon sx={{ fontSize: 32, color: "error.main", mb: 1 }} />
//             <Typography variant="h4" fontWeight={600} color="error.main">
//               {getDefectRate()}%
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Defect Rate
//             </Typography>
//           </Box>
//           <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
//             <ProcessIcon sx={{ fontSize: 32, color: "success.main", mb: 1 }} />
//             <Typography variant="h4" fontWeight={600} color="success.main">
//               {getProcessEfficiency()}%
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Process Efficiency
//             </Typography>
//           </Box>
//           <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
//             <DataIcon sx={{ fontSize: 32, color: "info.main", mb: 1 }} />
//             <Typography variant="h4" fontWeight={600} color="info.main">
//               3.4
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Sigma Level
//             </Typography>
//           </Box>
//           <Box sx={{ flex: 1, minWidth: 200, textAlign: "center" }}>
//             <TaskIcon sx={{ fontSize: 32, color: "warning.main", mb: 1 }} />
//             <Typography variant="h4" fontWeight={600} color="warning.main">
//               {tasks.length}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               Total Activities
//             </Typography>
//           </Box>
//         </Box>
//       </Paper>

//       {/* DMAIC Process */}
//       <Box sx={{ flex: 1, display: "flex", gap: 3, p: 3, overflow: "auto" }}>
//         <Box sx={{ flex: 1 }}>
//           <Paper sx={{ p: 3, borderRadius: 2, height: "fit-content" }}>
//             <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
//               DMAIC Process
//             </Typography>

//             <Stepper orientation="vertical" activeStep={activePhase}>
//               {dmaikPhases.map((phaseData, index) => {
//                 const phaseTasks = getTasksByPhase(phaseData.phase);
//                 const progress = getPhaseProgress(phaseData.phase);

//                 return (
//                   <Step key={phaseData.phase}>
//                     <StepLabel
//                       onClick={() => setActivePhase(index)}
//                       sx={{ cursor: "pointer" }}
//                     >
//                       <Box
//                         sx={{ display: "flex", alignItems: "center", gap: 2 }}
//                       >
//                         <Typography variant="subtitle1" fontWeight={600}>
//                           {phaseData.phase}
//                         </Typography>
//                         <Chip
//                           label={`${phaseTasks.length} tasks`}
//                           size="small"
//                           variant="outlined"
//                         />
//                       </Box>
//                       <Typography variant="caption" color="text.secondary">
//                         {phaseData.description}
//                       </Typography>
//                     </StepLabel>
//                     <StepContent>
//                       <Box sx={{ mt: 2 }}>
//                         <Box sx={{ mb: 2 }}>
//                           <LinearProgress
//                             variant="determinate"
//                             value={progress}
//                             sx={{
//                               height: 6,
//                               borderRadius: 3,
//                               bgcolor: "grey.200",
//                             }}
//                           />
//                           <Typography
//                             variant="caption"
//                             color="text.secondary"
//                             sx={{ mt: 0.5, display: "block" }}
//                           >
//                             {progress.toFixed(0)}% complete
//                           </Typography>
//                         </Box>

//                         <Button
//                           variant="outlined"
//                           startIcon={<AddIcon />}
//                           onClick={() => {
//                             setNewTaskData({
//                               ...newTaskData,
//                               labels: [phaseData.phase],
//                             });
//                             setOpenDialog(true);
//                           }}
//                           sx={{ mb: 2 }}
//                         >
//                           Add Task to {phaseData.phase}
//                         </Button>
//                       </Box>
//                     </StepContent>
//                   </Step>
//                 );
//               })}
//             </Stepper>
//           </Paper>
//         </Box>

//         {/* Tasks for Active Phase */}
//         <Box sx={{ flex: 2 }}>
//           <Paper sx={{ p: 3, borderRadius: 2 }}>
//             <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
//               {dmaikPhases[activePhase]?.phase} Phase Tasks
//             </Typography>

//             <Divider sx={{ mb: 2 }} />

//             {getTasksByPhase(dmaikPhases[activePhase]?.phase).length > 0 ? (
//               getTasksByPhase(dmaikPhases[activePhase]?.phase).map((task) =>
//                 renderTaskCard(task),
//               )
//             ) : (
//               <Box sx={{ textAlign: "center", py: 4 }}>
//                 <TaskIcon sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
//                 <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
//                   No tasks in {dmaikPhases[activePhase]?.phase} phase
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   sx={{ mb: 2 }}
//                 >
//                   Start by adding tasks to this DMAIC phase
//                 </Typography>
//                 <Button
//                   variant="contained"
//                   startIcon={<AddIcon />}
//                   onClick={() => {
//                     setNewTaskData({
//                       ...newTaskData,
//                       labels: [dmaikPhases[activePhase]?.phase],
//                     });
//                     setOpenDialog(true);
//                   }}
//                 >
//                   Add First Task
//                 </Button>
//               </Box>
//             )}
//           </Paper>
//         </Box>
//       </Box>

//       {/* Create/Edit Task Dialog */}
//       <Dialog
//         open={openDialog}
//         onClose={() => setOpenDialog(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle>{editTask ? "Edit Task" : "Create New Task"}</DialogTitle>

//         <DialogContent sx={{ pt: 2 }}>
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//             <TextField
//               label="Task Title"
//               fullWidth
//               value={newTaskData.title}
//               onChange={(e) =>
//                 setNewTaskData({ ...newTaskData, title: e.target.value })
//               }
//             />

//             <TextField
//               label="Description"
//               fullWidth
//               multiline
//               rows={3}
//               value={newTaskData.description}
//               onChange={(e) =>
//                 setNewTaskData({ ...newTaskData, description: e.target.value })
//               }
//             />

//             <Box sx={{ display: "flex", gap: 2 }}>
//               <FormControl fullWidth>
//                 <InputLabel>DMAIC Phase</InputLabel>
//                 <Select
//                   value={newTaskData.labels?.[0] || ""}
//                   label="DMAIC Phase"
//                   onChange={(e) =>
//                     setNewTaskData({ ...newTaskData, labels: [e.target.value] })
//                   }
//                 >
//                   {dmaikPhases.map((phase) => (
//                     <MenuItem key={phase.phase} value={phase.phase}>
//                       {phase.phase}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <FormControl fullWidth>
//                 <InputLabel>Type</InputLabel>
//                 <Select
//                   value={newTaskData.type}
//                   label="Type"
//                   onChange={(e) =>
//                     setNewTaskData({ ...newTaskData, type: e.target.value })
//                   }
//                 >
//                   {dmaikTypes.map((type) => (
//                     <MenuItem key={type} value={type}>
//                       {type}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>

//             <Box sx={{ display: "flex", gap: 2 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Priority</InputLabel>
//                 <Select
//                   value={newTaskData.priority}
//                   label="Priority"
//                   onChange={(e) =>
//                     setNewTaskData({
//                       ...newTaskData,
//                       priority: e.target.value as TaskPriority,
//                     })
//                   }
//                 >
//                   {priorityOptions.map((priority) => (
//                     <MenuItem key={priority} value={priority}>
//                       {priority}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Box>

//             <Box sx={{ display: "flex", gap: 2 }}>
//               <FormControl fullWidth>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={newTaskData.status}
//                   label="Status"
//                   onChange={(e) =>
//                     setNewTaskData({
//                       ...newTaskData,
//                       status: e.target.value as TaskStatus,
//                     })
//                   }
//                 >
//                   {statusOptions.map((status) => (
//                     <MenuItem key={status} value={status}>
//                       {status}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>

//               <TextField
//                 label="Story Points"
//                 type="number"
//                 fullWidth
//                 value={newTaskData.storyPoints}
//                 onChange={(e) =>
//                   setNewTaskData({
//                     ...newTaskData,
//                     storyPoints: Number(e.target.value),
//                   })
//                 }
//               />
//             </Box>

//             <Box sx={{ display: "flex", gap: 2 }}>
//               <TextField
//                 label="Assignee"
//                 fullWidth
//                 value={newTaskData.assignee}
//                 onChange={(e) =>
//                   setNewTaskData({ ...newTaskData, assignee: e.target.value })
//                 }
//               />

//               <TextField
//                 label="Due Date"
//                 type="date"
//                 fullWidth
//                 InputLabelProps={{ shrink: true }}
//                 value={newTaskData.dueDate}
//                 onChange={(e) =>
//                   setNewTaskData({ ...newTaskData, dueDate: e.target.value })
//                 }
//               />
//             </Box>
//           </Box>
//         </DialogContent>

//         <DialogActions sx={{ p: 3 }}>
//           <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
//           <Button variant="contained" onClick={handleSave}>
//             {editTask ? "Update" : "Create"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default SixSigma;
