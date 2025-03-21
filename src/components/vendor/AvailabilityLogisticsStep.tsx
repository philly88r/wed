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
import { Availability, Logistics } from '../../types/vendor';

interface AvailabilityLogisticsStepProps {
  formData: {
    availability: Availability;
    logistics: Logistics;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;  // Keep this required since we use it
}

const AvailabilityLogisticsStep: React.FC<AvailabilityLogisticsStepProps> = ({
  formData,
  onChange,
  errors
}) => {
  const handleTravelZoneAdd = () => {
    const newZone = {
      zone: '',
      radius_miles: 0,
      fee: 0
    };
    onChange('availability.travel_zones', [...formData.availability.travel_zones, newZone]);
  };

  const handleTechnicalRequirementAdd = (value: string) => {
    onChange('logistics.technical_requirements', [...formData.logistics.technical_requirements, value]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Availability
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="number"
            label="Lead Time (Days)"
            value={formData.availability.lead_time_days}
            onChange={(e) => onChange('availability.lead_time_days', parseInt(e.target.value))}
            error={!!errors.lead_time_days}
            helperText={errors.lead_time_days}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.availability.calendar_sync_enabled}
                onChange={(e) => onChange('availability.calendar_sync_enabled', e.target.checked)}
              />
            }
            label="Enable Calendar Sync"
          />
          {formData.availability.calendar_sync_enabled && (
            <TextField
              fullWidth
              label="Calendar URL"
              value={formData.availability.calendar_url || ''}
              onChange={(e) => onChange('availability.calendar_url', e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </Grid>

        {/* Seasonal Availability */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Seasonal Availability
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary">
                  Peak Season Months
                </Typography>
                <TextField
                  fullWidth
                  label="Add Peak Season Month"
                  placeholder="e.g., June"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      onChange('availability.peak_season', [...formData.availability.peak_season, target.value]);
                      target.value = '';
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.availability.peak_season.map((month, index) => (
                    <Chip
                      key={index}
                      label={month}
                      onDelete={() => {
                        const newMonths = formData.availability.peak_season.filter((_, i) => i !== index);
                        onChange('availability.peak_season', newMonths);
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="primary">
                  Off-Peak Season Months
                </Typography>
                <TextField
                  fullWidth
                  label="Add Off-Peak Season Month"
                  placeholder="e.g., January"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      onChange('availability.off_peak_season', [...formData.availability.off_peak_season, target.value]);
                      target.value = '';
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.availability.off_peak_season.map((month, index) => (
                    <Chip
                      key={index}
                      label={month}
                      onDelete={() => {
                        const newMonths = formData.availability.off_peak_season.filter((_, i) => i !== index);
                        onChange('availability.off_peak_season', newMonths);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Travel Zones */}
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">
                  Travel Zones
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleTravelZoneAdd}
                >
                  Add Zone
                </Button>
              </Box>

              {formData.availability.travel_zones.map((zone, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Zone Name"
                        value={zone.zone}
                        onChange={(e) => {
                          const newZones = [...formData.availability.travel_zones];
                          newZones[index].zone = e.target.value;
                          onChange('availability.travel_zones', newZones);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Radius (Miles)"
                        value={zone.radius_miles}
                        onChange={(e) => {
                          const newZones = [...formData.availability.travel_zones];
                          newZones[index].radius_miles = parseInt(e.target.value);
                          onChange('availability.travel_zones', newZones);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Fee ($)"
                        value={zone.fee}
                        onChange={(e) => {
                          const newZones = [...formData.availability.travel_zones];
                          newZones[index].fee = parseInt(e.target.value);
                          onChange('availability.travel_zones', newZones);
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => {
                          const newZones = formData.availability.travel_zones.filter((_, i) => i !== index);
                          onChange('availability.travel_zones', newZones);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Logistics */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Logistics
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Setup Time (Minutes)"
                value={formData.logistics.setup_time_minutes}
                onChange={(e) => onChange('logistics.setup_time_minutes', parseInt(e.target.value))}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Breakdown Time (Minutes)"
                value={formData.logistics.breakdown_time_minutes}
                onChange={(e) => onChange('logistics.breakdown_time_minutes', parseInt(e.target.value))}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Space Requirements"
                value={formData.logistics.space_requirements}
                onChange={(e) => onChange('logistics.space_requirements', e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Technical Requirements
                </Typography>
                <TextField
                  fullWidth
                  label="Add Requirement"
                  placeholder="e.g., 2x 20-amp circuits"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      handleTechnicalRequirementAdd(target.value);
                      target.value = '';
                    }
                  }}
                />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.logistics.technical_requirements.map((req, index) => (
                    <Chip
                      key={index}
                      label={req}
                      onDelete={() => {
                        const newReqs = formData.logistics.technical_requirements.filter((_, i) => i !== index);
                        onChange('logistics.technical_requirements', newReqs);
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parking Needs"
                value={formData.logistics.parking_needs}
                onChange={(e) => onChange('logistics.parking_needs', e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Weather Policy"
                value={formData.logistics.weather_policy}
                onChange={(e) => onChange('logistics.weather_policy', e.target.value)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AvailabilityLogisticsStep;
