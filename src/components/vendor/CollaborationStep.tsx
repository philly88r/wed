import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Collaboration } from '../../types/vendor';

interface CollaborationStepProps {
  formData: {
    collaboration: Collaboration;
  };
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const CollaborationStep: React.FC<CollaborationStepProps> = ({
  formData,
  onChange
}) => {
  const handlePreferredVendorAdd = () => {
    const newVendor = {
      name: '',
      type: '',
      discount: ''
    };
    onChange('collaboration.preferred_vendors', [...formData.collaboration.preferred_vendors, newVendor]);
  };

  const handleVenuePartnershipAdd = () => {
    const newVenue = {
      venue: '',
      benefits: ''
    };
    onChange('collaboration.venue_partnerships', [...formData.collaboration.venue_partnerships, newVenue]);
  };

  const handlePackageDealAdd = () => {
    const newDeal = {
      name: '',
      includes: [],
      discount: ''
    };
    onChange('collaboration.package_deals', [...formData.collaboration.package_deals, newDeal]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Collaboration & Partnerships
      </Typography>
      
      {/* Preferred Vendors */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Preferred Vendors
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handlePreferredVendorAdd}
            >
              Add Preferred Vendor
            </Button>
          </Box>

          {formData.collaboration.preferred_vendors.map((vendor, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Vendor Name"
                    value={vendor.name}
                    onChange={(e) => {
                      const newVendors = [...formData.collaboration.preferred_vendors];
                      newVendors[index].name = e.target.value;
                      onChange('collaboration.preferred_vendors', newVendors);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Vendor Type"
                    value={vendor.type}
                    onChange={(e) => {
                      const newVendors = [...formData.collaboration.preferred_vendors];
                      newVendors[index].type = e.target.value;
                      onChange('collaboration.preferred_vendors', newVendors);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Discount Offered"
                    value={vendor.discount}
                    onChange={(e) => {
                      const newVendors = [...formData.collaboration.preferred_vendors];
                      newVendors[index].discount = e.target.value;
                      onChange('collaboration.preferred_vendors', newVendors);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newVendors = formData.collaboration.preferred_vendors.filter((_, i) => i !== index);
                      onChange('collaboration.preferred_vendors', newVendors);
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

      {/* Venue Partnerships */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Venue Partnerships
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleVenuePartnershipAdd}
            >
              Add Venue Partnership
            </Button>
          </Box>

          {formData.collaboration.venue_partnerships.map((partnership, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Venue Name"
                    value={partnership.venue}
                    onChange={(e) => {
                      const newPartnerships = [...formData.collaboration.venue_partnerships];
                      newPartnerships[index].venue = e.target.value;
                      onChange('collaboration.venue_partnerships', newPartnerships);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Partnership Benefits"
                    value={partnership.benefits}
                    onChange={(e) => {
                      const newPartnerships = [...formData.collaboration.venue_partnerships];
                      newPartnerships[index].benefits = e.target.value;
                      onChange('collaboration.venue_partnerships', newPartnerships);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newPartnerships = formData.collaboration.venue_partnerships.filter((_, i) => i !== index);
                      onChange('collaboration.venue_partnerships', newPartnerships);
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

      {/* Package Deals */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Package Deals
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handlePackageDealAdd}
            >
              Add Package Deal
            </Button>
          </Box>

          {formData.collaboration.package_deals.map((deal, index) => (
            <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Package Name"
                    value={deal.name}
                    onChange={(e) => {
                      const newDeals = [...formData.collaboration.package_deals];
                      newDeals[index].name = e.target.value;
                      onChange('collaboration.package_deals', newDeals);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Included Services"
                    value={deal.includes.join(', ')}
                    onChange={(e) => {
                      const newDeals = [...formData.collaboration.package_deals];
                      newDeals[index].includes = e.target.value.split(',').map(s => s.trim());
                      onChange('collaboration.package_deals', newDeals);
                    }}
                    helperText="Separate services with commas"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Discount"
                    value={deal.discount}
                    onChange={(e) => {
                      const newDeals = [...formData.collaboration.package_deals];
                      newDeals[index].discount = e.target.value;
                      onChange('collaboration.package_deals', newDeals);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => {
                      const newDeals = formData.collaboration.package_deals.filter((_, i) => i !== index);
                      onChange('collaboration.package_deals', newDeals);
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

      {/* Coordinator Experience */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Wedding Coordinator Experience
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Coordinator Experience"
            value={formData.collaboration.coordinator_experience}
            onChange={(e) => onChange('collaboration.coordinator_experience', e.target.value)}
            placeholder="Describe your experience working with wedding coordinators..."
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CollaborationStep;
