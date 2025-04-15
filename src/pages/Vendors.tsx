import { useState } from 'react';
import { Container, Typography, Box, Tab, Tabs } from '@mui/material';
import VendorDirectory from './VendorDirectory';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vendor-tabpanel-${index}`}
      aria-labelledby={`vendor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Vendors() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Find Vendors" />
          <Tab label="My Favorites" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <VendorDirectory />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6">Coming Soon</Typography>
      </TabPanel>
    </Container>
  );
}
