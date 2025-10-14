import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import type { Project } from "@/types";

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, "id" | "tasks">) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  open,
  onClose,
  onCreateProject,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    type: "Software" as Project["type"],
    startDate: "",
    endDate: "",
    teamMembers: [] as string[],
  });
  const [newMember, setNewMember] = useState("");

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.key ||
      !formData.startDate ||
      !formData.endDate
    ) {
      return;
    }

    const project: Omit<Project, "id" | "tasks"> = {
      name: formData.name,
      key: formData.key.toUpperCase(),
      type: formData.type,
      templateType: 'scrum', // Default template type
      features: [], // Initialize empty features array
      timeline: {
        start: formData.startDate,
        end: formData.endDate,
      },
      teamMembers: formData.teamMembers.map((name) => ({
        name,
        role: "Team Member",
      })),
    };

    // Debug logging to verify type is captured
    console.log("CreateProjectModal - Project data being sent:", {
      ...project,
      typeDebug: `Type: "${project.type}" (${typeof project.type})`,
    });

    onCreateProject(project);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      key: "",
      description: "",
      type: "Software",
      startDate: "",
      endDate: "",
      teamMembers: [],
    });
    setNewMember("");
    onClose();
  };

  const handleAddMember = () => {
    if (newMember.trim() && !formData.teamMembers.includes(newMember.trim())) {
      setFormData((prev) => ({
        ...prev,
        teamMembers: [...prev.teamMembers, newMember.trim()],
      }));
      setNewMember("");
    }
  };

  const handleRemoveMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((m) => m !== member),
    }));
  };

  const generateKey = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words
      .map((word) => word[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: prev.key || generateKey(name),
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: "500px",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            pb: 1,
          }}
        >
          <Typography variant="h6" sx={{ color: "#172B4D", fontWeight: 600 }}>
            Create New Project
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Project Name */}
          <TextField
            fullWidth
            label="Project Name"
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            variant="outlined"
          />

          {/* Project Key */}
          <TextField
            fullWidth
            label="Project Key"
            value={formData.key}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                key: e.target.value.toUpperCase(),
              }))
            }
            required
            variant="outlined"
            helperText="A unique identifier for your project (e.g., MLC, MAD)"
            inputProps={{ maxLength: 10 }}
          />

          {/* Project Type */}
          <FormControl fullWidth>
            <InputLabel>Project Type</InputLabel>
            <Select
              value={formData.type}
              label="Project Type"
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  type: e.target.value as Project["type"],
                }))
              }
            >
              <MenuItem value="Software">Software</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            multiline
            rows={3}
            variant="outlined"
            placeholder="Brief description of your project..."
          />

          {/* Timeline */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {/* Team Members */}
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: "#5E6C84", fontWeight: 600, mb: 1 }}
            >
              Team Members
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add team member..."
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddMember()}
              />
              <Button
                variant="outlined"
                onClick={handleAddMember}
                disabled={!newMember.trim()}
                sx={{ textTransform: "none" }}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {formData.teamMembers.map((member) => (
                <Chip
                  key={member}
                  label={member}
                  onDelete={() => handleRemoveMember(member)}
                  size="small"
                  sx={{ bgcolor: "#E3FCEF", color: "#00875A" }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !formData.name ||
            !formData.key ||
            !formData.startDate ||
            !formData.endDate
          }
          sx={{
            textTransform: "none",
            bgcolor: "#0052CC",
            "&:hover": { bgcolor: "#0747A6" },
          }}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectModal;
