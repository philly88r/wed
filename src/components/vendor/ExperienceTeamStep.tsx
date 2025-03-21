import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Experience, TeamInfo } from '../../types/vendor';

interface ExperienceTeamStepProps {
  formData: {
    experience: Experience;
    team_info: TeamInfo;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;  
}

const ExperienceTeamStep: React.FC<ExperienceTeamStepProps> = ({
  formData,
  onChange,
  errors
}) => {
  const handleArrayAdd = (field: string, value: string) => {
    const currentArray = formData.experience[field as keyof Experience] as string[];
    onChange(`experience.${field}`, [...currentArray, value]);
  };

  const handleArrayRemove = (field: string, index: number) => {
    const currentArray = formData.experience[field as keyof Experience] as string[];
    onChange(`experience.${field}`, currentArray.filter((_, i) => i !== index));
  };

  const handleTeamMemberAdd = () => {
    const newMember = {
      name: '',
      role: '',
      bio: '',
      photo_url: ''
    };
    onChange('team_info.members', [...formData.team_info.members, newMember]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Experience & Credentials
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Years in Business"
            value={formData.experience.years_in_business}
            onChange={(e) => onChange('experience.years_in_business', parseInt(e.target.value))}
            error={!!errors?.years_in_business}
            helperText={errors?.years_in_business}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Weddings Completed"
            value={formData.experience.weddings_completed}
            onChange={(e) => onChange('experience.weddings_completed', parseInt(e.target.value))}
          />
        </Grid>

        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Insurance Information
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.experience.insurance.has_insurance}
                    onChange={(e) => onChange('experience.insurance.has_insurance', e.target.checked)}
                  />
                }
                label="Has Insurance"
              />
              {formData.experience.insurance.has_insurance && (
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Coverage Details"
                  value={formData.experience.insurance.coverage_details}
                  onChange={(e) => onChange('experience.insurance.coverage_details', e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Awards Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Awards & Recognition
            </Typography>
            <TextField
              fullWidth
              label="Add Award"
              placeholder="Enter award or recognition"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  handleArrayAdd('awards', target.value);
                  target.value = '';
                }
              }}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.experience.awards.map((award, index) => (
                <Chip
                  key={index}
                  label={award}
                  onDelete={() => handleArrayRemove('awards', index)}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Certifications Section */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Certifications
            </Typography>
            <TextField
              fullWidth
              label="Add Certification"
              placeholder="Enter certification"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  handleArrayAdd('certifications', target.value);
                  target.value = '';
                }
              }}
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.experience.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  onDelete={() => handleArrayRemove('certifications', index)}
                />
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Team Information */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Team Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Team Size"
                value={formData.team_info.size}
                onChange={(e) => onChange('team_info.size', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Backup Policy"
                value={formData.team_info.backup_policy}
                onChange={(e) => onChange('team_info.backup_policy', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dress Code"
                value={formData.team_info.dress_code}
                onChange={(e) => onChange('team_info.dress_code', e.target.value)}
              />
            </Grid>

            {/* Team Members */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Team Members
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleTeamMemberAdd}
                  sx={{ mb: 2 }}
                >
                  Add Team Member
                </Button>
                
                {formData.team_info.members.map((member, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            value={member.name}
                            onChange={(e) => {
                              const newMembers = [...formData.team_info.members];
                              newMembers[index].name = e.target.value;
                              onChange('team_info.members', newMembers);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Role"
                            value={member.role}
                            onChange={(e) => {
                              const newMembers = [...formData.team_info.members];
                              newMembers[index].role = e.target.value;
                              onChange('team_info.members', newMembers);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Bio"
                            value={member.bio}
                            onChange={(e) => {
                              const newMembers = [...formData.team_info.members];
                              newMembers[index].bio = e.target.value;
                              onChange('team_info.members', newMembers);
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Photo URL"
                            value={member.photo_url}
                            onChange={(e) => {
                              const newMembers = [...formData.team_info.members];
                              newMembers[index].photo_url = e.target.value;
                              onChange('team_info.members', newMembers);
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          onClick={() => {
                            const newMembers = formData.team_info.members.filter((_, i) => i !== index);
                            onChange('team_info.members', newMembers);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            {/* Languages */}
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Languages Spoken
                </Typography>
                <TextField
                  fullWidth
                  label="Add Language"
                  placeholder="Enter language"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      onChange('team_info.languages', [...formData.team_info.languages, target.value]);
                      target.value = '';
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.team_info.languages.map((language, index) => (
                    <Chip
                      key={index}
                      label={language}
                      onDelete={() => {
                        const newLanguages = formData.team_info.languages.filter((_, i) => i !== index);
                        onChange('team_info.languages', newLanguages);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExperienceTeamStep;
