// import React, { useState } from "react";
// import Dialog from "@mui/material/Dialog";
// import DialogTitle from "@mui/material/DialogTitle";
// import DialogContent from "@mui/material/DialogContent";
// import DialogActions from "@mui/material/DialogActions";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Button from "@mui/material/Button";
// import TextField from "@mui/material/TextField";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import InputLabel from "@mui/material/InputLabel";
// import Chip from "@mui/material/Chip";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
// import type { Task, Project } from "@/types";

// interface CreateIssueModalProps {
//   open: boolean;
//   onClose: () => void;
//   onCreateIssue: (issue: Omit<Task, "id" | "comments">) => void;
//   project: Project;
// }

// const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
//   open,
//   onClose,
//   onCreateIssue,
//   project,
// }) => {
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     type: "Task" as Task["type"],
//     priority: "Medium" as Task["priority"],
//     status: "Backlog" as Task["status"],
//     assignee: "",
//     reporter: "Current User",
//     dueDate: "",
//     storyPoints: "",
//     labels: [] as string[],
//   });
//   const [newLabel, setNewLabel] = useState("");

//   const handleSubmit = () => {
//     if (!formData.title || !formData.assignee || !formData.dueDate) {
//       return;
//     }

//     const issue: Omit<Task, "id" | "comments"> = {
//       title: formData.title,
//       description: formData.description,
//       type: formData.type,
//       priority: formData.priority,
//       status: formData.status,
//       assignee: formData.assignee,
//       reporter: formData.reporter,
//       dueDate: formData.dueDate,
//       storyPoints: formData.storyPoints
//         ? parseInt(formData.storyPoints)
//         : undefined,
//       labels: formData.labels,
//     };

//     onCreateIssue(issue);
//     handleClose();
//   };

//   const handleClose = () => {
//     setFormData({
//       title: "",
//       description: "",
//       type: "Task",
//       priority: "Medium",
//       status: "Backlog",
//       assignee: "",
//       reporter: "Current User",
//       dueDate: "",
//       storyPoints: "",
//       labels: [],
//     });
//     setNewLabel("");
//     onClose();
//   };

//   const handleAddLabel = () => {
//     if (
//       newLabel.trim() &&
//       !formData.labels.includes(newLabel.trim().toLowerCase())
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         labels: [...prev.labels, newLabel.trim().toLowerCase()],
//       }));
//       setNewLabel("");
//     }
//   };

//   const handleRemoveLabel = (label: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       labels: prev.labels.filter((l) => l !== label),
//     }));
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: {
//           minHeight: "600px",
//         },
//       }}
//     >
//       <DialogTitle sx={{ p: 0 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             p: 3,
//             pb: 1,
//           }}
//         >
//           <Typography variant="h6" sx={{ color: "#172B4D", fontWeight: 600 }}>
//             Create Issue
//           </Typography>
//           <IconButton onClick={handleClose} size="small">
//             <CloseIcon />
//           </IconButton>
//         </Box>
//       </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Issue Type & Project */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Issue Type"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value as Task["type"],
                    }))
                  }
                >
                  <MenuItem value="Task">Task</MenuItem>
                  <MenuItem value="Story">Story</MenuItem>
                  <MenuItem value="Bug">Bug</MenuItem>
                  <MenuItem value="Epic">Epic</MenuItem>
                  <MenuItem value="Issue">Issue</MenuItem>
                  <MenuItem value="Approval">Approval</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "#5E6C84" }}>
                  Project:{" "}
                  <strong>
                    {project.name} ({project.key})
                  </strong>
                </Typography>
              </Box>
            </Box>

//             {/* Summary */}
//             <TextField
//               fullWidth
//               label="Summary"
//               value={formData.title}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, title: e.target.value }))
//               }
//               required
//               variant="outlined"
//               sx={{ mb: 3 }}
//               placeholder="Enter a brief summary of the issue..."
//             />

//             {/* Description */}
//             <TextField
//               fullWidth
//               label="Description"
//               value={formData.description}
//               onChange={(e) =>
//                 setFormData((prev) => ({
//                   ...prev,
//                   description: e.target.value,
//                 }))
//               }
//               multiline
//               rows={6}
//               variant="outlined"
//               sx={{ mb: 3 }}
//               placeholder="Describe the issue in detail..."
//             />

//             {/* Labels */}
//             <Box sx={{ mb: 3 }}>
//               <Typography
//                 variant="subtitle2"
//                 sx={{ color: "#5E6C84", fontWeight: 600, mb: 1 }}
//               >
//                 Labels
//               </Typography>
//               <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//                 <TextField
//                   size="small"
//                   placeholder="Add label..."
//                   value={newLabel}
//                   onChange={(e) => setNewLabel(e.target.value)}
//                   onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
//                 />
//                 <Button
//                   variant="outlined"
//                   size="small"
//                   onClick={handleAddLabel}
//                   disabled={!newLabel.trim()}
//                   sx={{ textTransform: "none" }}
//                 >
//                   Add
//                 </Button>
//               </Box>
//               <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
//                 {formData.labels.map((label) => (
//                   <Chip
//                     key={label}
//                     label={label}
//                     onDelete={() => handleRemoveLabel(label)}
//                     size="small"
//                     sx={{ bgcolor: "#E3FCEF", color: "#00875A" }}
//                   />
//                 ))}
//               </Box>
//             </Box>
//           </Box>

//           {/* Sidebar */}
//           <Box sx={{ width: 280 }}>
//             <Box sx={{ bgcolor: "#F4F5F7", borderRadius: 1, p: 2 }}>
//               {/* Status */}
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={formData.status}
//                   label="Status"
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       status: e.target.value as Task["status"],
//                     }))
//                   }
//                 >
//                   <MenuItem value="Backlog">Backlog</MenuItem>
//                   <MenuItem value="Todo">Todo</MenuItem>
//                   <MenuItem value="In Progress">In Progress</MenuItem>
//                   <MenuItem value="Review">Review</MenuItem>
//                   <MenuItem value="Done">Done</MenuItem>
//                 </Select>
//               </FormControl>

//               {/* Assignee */}
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Assignee</InputLabel>
//                 <Select
//                   value={formData.assignee}
//                   label="Assignee"
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       assignee: e.target.value,
//                     }))
//                   }
//                   disabled={
//                     !project.teamMembers || project.teamMembers.length === 0
//                   }
//                 >
//                   {project.teamMembers && project.teamMembers.length > 0 ? (
//                     project.teamMembers.map((member) => (
//                       <MenuItem key={member.name} value={member.name}>
//                         {member.name} ({member.role})
//                       </MenuItem>
//                     ))
//                   ) : (
//                     <MenuItem value="" disabled>
//                       No team members available
//                     </MenuItem>
//                   )}
//                 </Select>
//                 {(!project.teamMembers || project.teamMembers.length === 0) && (
//                   <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
//                     No team members found. Please add team members to the
//                     project first.
//                   </Typography>
//                 )}
//               </FormControl>

//               {/* Priority */}
//               <FormControl fullWidth sx={{ mb: 2 }}>
//                 <InputLabel>Priority</InputLabel>
//                 <Select
//                   value={formData.priority}
//                   label="Priority"
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       priority: e.target.value as Task["priority"],
//                     }))
//                   }
//                 >
//                   <MenuItem value="Highest">Highest</MenuItem>
//                   <MenuItem value="High">High</MenuItem>
//                   <MenuItem value="Medium">Medium</MenuItem>
//                   <MenuItem value="Low">Low</MenuItem>
//                   <MenuItem value="Lowest">Lowest</MenuItem>
//                 </Select>
//               </FormControl>

//               {/* Story Points */}
//               {(formData.type === "Story" || formData.type === "Epic") && (
//                 <TextField
//                   fullWidth
//                   label="Story Points"
//                   type="number"
//                   value={formData.storyPoints}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       storyPoints: e.target.value,
//                     }))
//                   }
//                   sx={{ mb: 2 }}
//                   inputProps={{ min: 1, max: 100 }}
//                 />
//               )}

//               {/* Due Date */}
//               <TextField
//                 fullWidth
//                 label="Due Date"
//                 type="date"
//                 value={formData.dueDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
//                 }
//                 required
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Box>
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 3, pt: 0 }}>
//         <Button onClick={handleClose} sx={{ textTransform: "none" }}>
//           Cancel
//         </Button>
//         <Button
//           variant="contained"
//           onClick={handleSubmit}
//           disabled={!formData.title || !formData.assignee || !formData.dueDate}
//           sx={{
//             textTransform: "none",
//             bgcolor: "#0052CC",
//             "&:hover": { bgcolor: "#0747A6" },
//           }}
//         >
//           Create Issue
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CreateIssueModal;
