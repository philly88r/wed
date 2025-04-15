import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

interface VendorFormData {
  name: string;
  category_id: string;
  location: string;
  description: string;
  pricing_details: {
    packages: Array<{
      name: string;
      price: number;
    }>;
  };
  contact_info: {
    email?: string;
    phone?: string;
  };
}

interface CSVVendor {
  CATEGORY?: string;
  NAME?: string;
  LOCATION?: string;
}

const initialFormData: VendorFormData = {
  name: '',
  category_id: '',
  location: '',
  description: '',
  pricing_details: {
    packages: [
      { name: 'Premium Package', price: 0 },
      { name: 'Basic Package', price: 0 }
    ]
  },
  contact_info: {}
};

export default function AddVendor() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VendorFormData>(initialFormData);
  const [toast, setToast] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvVendors, setCsvVendors] = useState<CSVVendor[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePricingChange = (packageIndex: number, field: 'name' | 'price', value: string) => {
    setFormData(prev => {
      const newPricing = { ...prev.pricing_details };
      if (field === 'price') {
        newPricing.packages[packageIndex].price = Number(value);
      } else {
        newPricing.packages[packageIndex].name = value;
      }
      return {
        ...prev,
        pricing_details: newPricing
      };
    });
  };

  const handleContactInfoChange = (field: 'email' | 'phone', value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const avgPrice = formData.pricing_details.packages.reduce((sum, pkg) => sum + pkg.price, 0) / 2;

      // Validate package count and names
      if (formData.pricing_details.packages.length !== 2) {
        throw new Error('Each vendor must have exactly 2 package options');
      }

      // Ensure package names are not empty and are unique
      const packageNames = formData.pricing_details.packages.map(pkg => pkg.name);
      if (packageNames.some(name => !name || name.trim() === '')) {
        throw new Error('Package names cannot be empty');
      }
      if (new Set(packageNames).size !== packageNames.length) {
        throw new Error('Package names must be unique');
      }

      // Validate price ranges based on category
      let minPrice = 0;
      let maxPrice = 0;
      switch (formData.category_id) {
        case '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e': // Venues
          minPrice = 10000;
          maxPrice = 30000;
          break;
        case 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e': // Cake/Desserts
          minPrice = 500;
          maxPrice = 2000;
          break;
        case '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0': // Catering/Staffing
          minPrice = 15000;
          maxPrice = 30000;
          break;
        case 'cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e': // Couple Attire
          minPrice = 1000;
          maxPrice = 3000;
          break;
        case '99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae': // DJ's
          minPrice = 1500;
          maxPrice = 3000;
          break;
        case '051803d5-52fc-4b1d-916d-710c758b9df8': // Live Music
          minPrice = 4000;
          maxPrice = 12000;
          break;
        case '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2': // Florals/Floral Preservation
          minPrice = 8000;
          maxPrice = 15000;
          break;
        case 'dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e': // Hair & Makeup
          minPrice = 800;
          maxPrice = 1500;
          break;
        case '4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f': // Officiants
          minPrice = 800;
          maxPrice = 2000;
          break;
        case '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f': // Photographers
          minPrice = 3500;
          maxPrice = 8000;
          break;
        case 'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e': // Rentals
          minPrice = 2000;
          maxPrice = 5000;
          break;
        case 'ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e': // Stationery
          minPrice = 1500;
          maxPrice = 5000;
          break;
        case '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e': // Styling
          minPrice = 4000;
          maxPrice = 10000;
          break;
        case '77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e': // Transportation
          minPrice = 1000;
          maxPrice = 3000;
          break;
        case '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e': // Videographers
          minPrice = 3500;
          maxPrice = 8000;
          break;
        default:
          minPrice = 1000;
          maxPrice = 10000;
      }

      // Check if any package price is outside the allowed range
      const hasInvalidPrice = formData.pricing_details.packages.some(pkg => 
        pkg.price < minPrice || pkg.price > maxPrice
      );

      if (hasInvalidPrice) {
        throw new Error(`Price must be between $${minPrice} and $${maxPrice} for this category`);
      }

      // Get pricing tier based on category and average price
      let tier = 'budget';
      if (formData.category_id === '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e' || // Venues
          formData.category_id === '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0') { // Catering
        tier = avgPrice > 10000 ? 'premium' : 'mid_range';
      } else if (formData.category_id === '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2') { // Florals
        tier = avgPrice > 8000 ? 'premium' : avgPrice > 3000 ? 'mid_range' : 'budget';
      } else if (
        formData.category_id === '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f' || // Photographers
        formData.category_id === '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e' || // Videographers
        formData.category_id === '051803d5-52fc-4b1d-916d-710c758b9df8' || // Live Music
        formData.category_id === '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e' || // Styling
        formData.category_id === 'cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e'    // Couple Attire
      ) {
        tier = avgPrice > 3000 ? 'mid_range' : 'budget';
      } else {
        tier = avgPrice > 3000 ? 'mid_range' : 'budget';
      }

      const vendorData = {
        name: formData.name,
        category_id: formData.category_id,
        location: formData.location,
        description: formData.description,
        pricing_details: formData.pricing_details,
        contact_info: formData.contact_info,
        pricing_tier: {
          tier,
          avg_price: avgPrice
        }
      };

      const { error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select();

      if (error) throw error;

      setToast({
        open: true,
        message: 'Vendor added successfully!',
        severity: 'success'
      });

      setFormData(initialFormData);
    } catch (error) {
      console.error('Error adding vendor:', error);
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const csvData = event.target?.result as string;
        const rows = csvData.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const vendors: CSVVendor[] = rows.slice(1).map(row => {
          const vendor: CSVVendor = {
            CATEGORY: undefined,
            NAME: undefined,
            LOCATION: undefined
          };
          headers.forEach((header, index) => {
            const key = header.trim() as keyof CSVVendor;
            vendor[key] = row[index]?.trim() || undefined;
          });
          return vendor;
        });
        setCsvVendors(vendors);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setToast({
          open: true,
          message: 'Error parsing CSV file. Please check the format.',
          severity: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleCsvUpload = async () => {
    try {
      const categoryMap: Record<string, string> = {
        'VENUES': '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
        'CAKE/DESSERTS': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e',
        'CATERING/STAFFING': '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
        'COUPLE ATTIRE': 'cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e',
        'DJ\'S': '99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae',
        'LIVE MUSIC': '051803d5-52fc-4b1d-916d-710c758b9df8',
        'FLORALS/FLORAL PRESERVATION': '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
        'HAIR & MAKEUP': 'dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e',
        'OFFICIANTS': '4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f',
        'PHOTOGRAPHERS': '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
        'RENTALS': 'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e',
        'STATIONERY': 'ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e',
        'STYLING': '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e',
        'TRANSPORTATION': '77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e',
        'VIDEOGRAPHERS': '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e'
      };

      const validVendors = csvVendors
        .filter(vendor => vendor.CATEGORY && vendor.NAME && vendor.LOCATION)
        .map(vendor => {
          const category = vendor.CATEGORY!.trim().toUpperCase();
          const categoryId = categoryMap[category];
          
          return {
            name: vendor.NAME!.trim(),
            category_id: categoryId,
            location: vendor.LOCATION!.trim(),
            description: 'Details coming soon',
            pricing_details: { packages: [] },
            contact_info: {},
            pricing_tier: { tier: 'unset', avg_price: null }
          };
        })
        .filter(vendor => vendor.category_id);

      if (validVendors.length === 0) {
        throw new Error('No valid vendors found in CSV. Please check the format: CATEGORY,NAME,LOCATION');
      }

      const errors: string[] = [];
      const successes: string[] = [];

      for (const vendor of validVendors) {
        const { error } = await supabase
          .from('vendors')
          .insert([vendor])
          .select();

        if (error) {
          console.error('Error adding vendor:', error);
          errors.push(`Error adding ${vendor.name}: ${error.message}`);
        } else {
          successes.push(vendor.name);
        }
      }

      if (errors.length > 0) {
        setToast({
          open: true,
          message: `Failed to add ${errors.length} vendors. Please check the errors.`,
          severity: 'error'
        });
      } else {
        setToast({
          open: true,
          message: `Added ${successes.length} vendors successfully!`,
          severity: 'success'
        });
        setSelectedFile(null);
        setCsvVendors([]);
      }
    } catch (error) {
      console.error('Error uploading vendors:', error);
      setToast({
        open: true,
        message: error instanceof Error ? error.message : 'Error uploading vendors',
        severity: 'error'
      });
    }
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={8}>
        <Box>
          <Typography variant="h4" sx={{ mb: 4 }}>Add New Vendor</Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl required>
                <FormLabel>Vendor Name</FormLabel>
                <TextField
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Category</FormLabel>
                <Select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleSelectChange}
                  displayEmpty
                  native
                >
                  <option value="">Select category</option>
                  <option value="2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e">VENUES</option>
                  <option value="bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e">CAKE/DESSERTS</option>
                  <option value="3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0">CATERING/STAFFING</option>
                  <option value="cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e">COUPLE ATTIRE</option>
                  <option value="99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae">DJ'S</option>
                  <option value="051803d5-52fc-4b1d-916d-710c758b9df8">LIVE MUSIC</option>
                  <option value="5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2">FLORALS/FLORAL PRESERVATION</option>
                  <option value="dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e">HAIR & MAKEUP</option>
                  <option value="4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f">OFFICIANTS</option>
                  <option value="5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f">PHOTOGRAPHERS</option>
                  <option value="ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e">RENTALS</option>
                  <option value="ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e">STATIONERY</option>
                  <option value="66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e">STYLING</option>
                  <option value="77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e">TRANSPORTATION</option>
                  <option value="88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e">VIDEOGRAPHERS</option>
                </Select>
              </FormControl>

              <FormControl required>
                <FormLabel>Location</FormLabel>
                <TextField
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Description</FormLabel>
                <TextField
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter vendor description"
                  multiline
                  rows={3}
                  fullWidth
                />
              </FormControl>

              <FormControl>
                <FormLabel>Contact Email</FormLabel>
                <TextField
                  value={formData.contact_info.email || ''}
                  onChange={(e) => handleContactInfoChange('email', e.target.value)}
                  placeholder="Enter contact email"
                  type="email"
                  fullWidth
                />
              </FormControl>

              <FormControl>
                <FormLabel>Contact Phone</FormLabel>
                <TextField
                  value={formData.contact_info.phone || ''}
                  onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                  placeholder="Enter contact phone"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Premium Package Name</FormLabel>
                <TextField
                  value={formData.pricing_details.packages[0].name}
                  onChange={(e) => handlePricingChange(0, 'name', e.target.value)}
                  placeholder="Enter premium package name"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Premium Package Price ($)</FormLabel>
                <TextField
                  type="number"
                  value={formData.pricing_details.packages[0].price}
                  onChange={(e) => handlePricingChange(0, 'price', e.target.value)}
                  placeholder="Enter premium package price"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Basic Package Name</FormLabel>
                <TextField
                  value={formData.pricing_details.packages[1].name}
                  onChange={(e) => handlePricingChange(1, 'name', e.target.value)}
                  placeholder="Enter basic package name"
                  fullWidth
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Basic Package Price ($)</FormLabel>
                <TextField
                  type="number"
                  value={formData.pricing_details.packages[1].price}
                  onChange={(e) => handlePricingChange(1, 'price', e.target.value)}
                  placeholder="Enter basic package price"
                  fullWidth
                />
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Vendor'}
              </Button>
            </Stack>
          </form>
        </Box>

        <Stack spacing={3}>
          <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Bulk Upload Vendors
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                href="/vendor-template.csv"
                download
              >
                Download CSV Template
              </Button>
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{ width: 'fit-content' }}
                >
                  Choose CSV File
                  <input
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={handleFileSelect}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  onClick={handleCsvUpload}
                  disabled={!selectedFile}
                  startIcon={<CloudUploadIcon />}
                  sx={{ width: 'fit-content' }}
                >
                  Upload Vendors
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Snackbar 
          open={toast.open} 
          autoHideDuration={6000} 
          onClose={handleCloseToast}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseToast} severity={toast.severity}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Stack>
    </Container>
  );
}
