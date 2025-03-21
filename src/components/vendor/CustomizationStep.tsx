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
import { CustomizationOptions } from '../../types/vendor';

interface CustomizationStepProps {
  formData: {
    customization_options: CustomizationOptions;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const CustomizationStep: React.FC<CustomizationStepProps> = ({
  formData,
  onChange
}) => {
  const handlePackageAddonAdd = () => {
    const newAddon = {
      name: '',
      price: 0,
      description: ''
    };
    onChange('customization_options.package_addons', [...formData.customization_options.package_addons, newAddon]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Customization Options
      </Typography>
      
      {/* Package Add-ons */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Package Add-ons
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handlePackageAddonAdd}
            >
              Add Package Add-on
            </Button>
          </Box>

          {formData.customization_options.package_addons.map((addon, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Add-on Name"
                    value={addon.name}
                    onChange={(e) => {
                      const newAddons = [...formData.customization_options.package_addons];
                      newAddons[index].name = e.target.value;
                      onChange('customization_options.package_addons', newAddons);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price ($)"
                    value={addon.price}
                    onChange={(e) => {
                      const newAddons = [...formData.customization_options.package_addons];
                      newAddons[index].price = parseInt(e.target.value);
                      onChange('customization_options.package_addons', newAddons);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={addon.description}
                    onChange={(e) => {
                      const newAddons = [...formData.customization_options.package_addons];
                      newAddons[index].description = e.target.value;
                      onChange('customization_options.package_addons', newAddons);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newAddons = formData.customization_options.package_addons.filter((_, i) => i !== index);
                      onChange('customization_options.package_addons', newAddons);
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

      {/* Special Requests Policy */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Special Requests Policy
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Special Requests Policy"
            value={formData.customization_options.special_requests_policy}
            onChange={(e) => onChange('customization_options.special_requests_policy', e.target.value)}
            placeholder="Describe how you handle special requests..."
          />
        </CardContent>
      </Card>

      {/* Cultural Expertise */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Cultural Expertise
          </Typography>
          <TextField
            fullWidth
            label="Add Cultural Expertise"
            placeholder="e.g., Indian Weddings"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                onChange('customization_options.cultural_expertise', 
                  [...formData.customization_options.cultural_expertise, target.value]);
                target.value = '';
              }
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.customization_options.cultural_expertise.map((expertise, index) => (
              <Chip
                key={index}
                label={expertise}
                onDelete={() => {
                  const newExpertise = formData.customization_options.cultural_expertise.filter((_, i) => i !== index);
                  onChange('customization_options.cultural_expertise', newExpertise);
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Multi-day Events */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Multi-day Events
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.customization_options.multi_day_events.available}
                onChange={(e) => onChange('customization_options.multi_day_events.available', e.target.checked)}
              />
            }
            label="Available for Multi-day Events"
          />
          {formData.customization_options.multi_day_events.available && (
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Multi-day Event Details"
              value={formData.customization_options.multi_day_events.details}
              onChange={(e) => onChange('customization_options.multi_day_events.details', e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Describe your multi-day event packages and policies..."
            />
          )}
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Equipment List
          </Typography>
          <TextField
            fullWidth
            label="Add Equipment"
            placeholder="e.g., Professional Sound System"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                onChange('customization_options.equipment', 
                  [...formData.customization_options.equipment, target.value]);
                target.value = '';
              }
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {formData.customization_options.equipment.map((item, index) => (
              <Chip
                key={index}
                label={item}
                onDelete={() => {
                  const newEquipment = formData.customization_options.equipment.filter((_, i) => i !== index);
                  onChange('customization_options.equipment', newEquipment);
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomizationStep;
