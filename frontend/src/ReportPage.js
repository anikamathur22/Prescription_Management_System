import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import axios from "axios";

// const API_URL = "http://localhost:5000/api";
// const API_URL = process.env.MONGO_URI; 
const API_URL = "https://prescription-management-system.onrender.com/api"; 

const ReportPage = ({ setScreen }) => {
  // State for filters
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    doctorId: '',
    prescription_name: ''
  });

  // State for filter options
  const [filterOptions, setFilterOptions] = useState({
    prescriptionNames: [],
    doctors: []
  });

  // State for report results
  const [reportData, setReportData] = useState({
    prescriptions: [],
    stats: null
  });

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/report-filters`);
        setFilterOptions(response.data.data);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate report
  // const generateReport = async () => {
  //   try {
  //     const response = await axios.post(`${API_URL}/reports`, filters);
  //     setReportData({
  //       prescriptions: response.data.data,
  //       stats: response.data.stats
  //     });
  //   } catch (error) {
  //     console.error("Error generating report:", error);
  //   }
  // };

  // Inside the generateReport function in ReportPage.js
  const generateReport = async () => {
    try {
      const response = await axios.post(`${API_URL}/reports`, filters);
      
      // Handle the case where stats might not be included in the response
      setReportData({
        prescriptions: response.data.data,
        stats: response.data.stats || {
          totalPrescriptions: response.data.data.length,
          totalAmount: response.data.data.reduce((sum, p) => sum + (p.amount || 0), 0),
          averageAmount: response.data.data.length > 0 
            ? (response.data.data.reduce((sum, p) => sum + (p.amount || 0), 0) / response.data.data.length).toFixed(2)
            : 0
        }
      });
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <Container>
      <Button 
        variant="outlined" 
        onClick={() => setScreen('home')} 
        style={{ marginBottom: '20px' }}
      >
        Back to Home
      </Button>

      <Typography variant="h4" gutterBottom>
        Prescription Report
      </Typography>

      <Paper style={{ padding: '20px', marginBottom: '20px' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              name="startDate"
              label="Start Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.startDate || ''}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              name="endDate"
              label="End Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={filters.endDate || ''}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Prescription Name</InputLabel>
              <Select
                name="prescription_name"
                value={filters.prescription_name}
                label="Prescription Name"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Prescriptions</MenuItem>
                {filterOptions.prescriptionNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Doctor</InputLabel>
              <Select
                name="doctorId"
                value={filters.doctorId}
                label="Doctor"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Doctors</MenuItem>
                {filterOptions.doctors.map((doctor) => (
                  <MenuItem 
                    key={doctor._id} 
                    value={doctor._id}
                  >
                    {`${doctor.first_name} ${doctor.last_name} (${doctor.prescriptionCount} prescriptions)`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          onClick={generateReport} 
          style={{ marginTop: '20px' }}
        >
          Generate Report
        </Button>
      </Paper>

      {reportData.stats && (
        <Paper style={{ padding: '20px', marginBottom: '20px' }}>
          <Typography variant="h5">Report Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography>
                Total Prescriptions: {reportData.stats.totalPrescriptions}
              </Typography>
              <Typography>
                Total Amount Prescribed (mg): {reportData.stats.totalAmount}
              </Typography>
              <Typography>
                Average Amount Prescribed (mg): {reportData.stats.averageAmount}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Prescriptions by Doctor</Typography>
              {Object.entries(reportData.stats.prescriptionsByDoctor || {}).map(([doctor, count]) => (
                <Typography key={doctor}>
                  {doctor}: {count}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">Prescriptions by Name</Typography>
              {Object.entries(reportData.stats.prescriptionsByName || {}).map(([name, count]) => (
                <Typography key={name}>
                  {name}: {count}
                </Typography>
              ))}
            </Grid>
          </Grid>
        </Paper>
      )}

      {reportData.prescriptions.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Prescription Name</TableCell>
                <TableCell>Patient Name</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Order Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.prescriptions.map((prescription) => (
                <TableRow key={prescription._id}>
                  <TableCell>{prescription.prescription_name}</TableCell>
                  <TableCell>{prescription.patient_name}</TableCell>
                  <TableCell>
                    {prescription.doctor_id 
                      ? `${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` 
                      : 'Unknown'}
                  </TableCell>
                  <TableCell>{prescription.amount}</TableCell>
                  <TableCell>
                    {new Date(prescription.order_time).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ReportPage;