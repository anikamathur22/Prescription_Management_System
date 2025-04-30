
import React, { useState, useEffect } from "react";
import ReportPage from "./ReportPage";  // Add this import
// import ReportPage from "frontend/src/ReportPage.js"
import {
  Button,
  TextField,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import { Delete, Edit, Close } from "@mui/icons-material";
import axios from "axios";

const API_URL = "https://prescription-management-system.onrender.com/api"; // "http://localhost:5000/api";

const App = () => {
  const [screen, setScreen] = useState("home");
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    amount: "",
    patient_name: "",
    patient_ssn: "",
    prescription_name: "",
  });

  // Fetch data
  useEffect(() => {
    const fetchPrescriptionsAndDoctors = async () => {
      try {
        // Fetch prescriptions with doctor details already populated
        const presRes = await axios.get(`${API_URL}/prescriptions`);
        console.log("Fetched Prescriptions:", presRes.data);

        const prescriptions = presRes.data.data;

        // Fetch all doctors (optional, but can be useful)
        const docRes = await axios.get(`${API_URL}/doctors`);
        console.log("Fetched Doctors:", docRes.data);

        setDoctors(docRes.data.data);
        setPrescriptions(prescriptions);

        console.log("Updated Prescriptions:", prescriptions);
      } catch (error) {
        console.error("Error fetching prescriptions and doctors:", error);
      }
    };

    fetchPrescriptionsAndDoctors();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Reset any previous errors
      setError(null);
  
      if (editingId) {
        const response = await axios.put(`${API_URL}/prescriptions/${editingId}`, formData);
        setPrescriptions(prescriptions.map((p) => (p._id === editingId ? response.data.data : p)));
        setEditingId(null);
      } else {
        const response = await axios.post(`${API_URL}/prescriptions`, formData);
        setPrescriptions([...prescriptions, response.data.data]);
      }
      resetForm();
    } catch (error) {
      // Check if there's a response from the server
      if (error.response && error.response.data) {
        // Set the error message from the backend
        setError(error.response.data.message);
        setOpenSnackbar(true);
      } else {
        // Fallback error message
        setError("An unexpected error occurred");
        setOpenSnackbar(true);
      }
      console.error("Error saving prescription:", error);
    }
  };

  // Delete prescription
  const deletePrescription = async (id) => {
    try {
      await axios.delete(`${API_URL}/prescriptions/${id}`);
      setPrescriptions(prescriptions.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting prescription:", error);
    }
  };

  // Start editing prescription
  const startEdit = (prescription) => {
    // Check if doctor_id is an object (populated) or just an ID
    const doctor = prescription.doctor_id && typeof prescription.doctor_id === 'object'
      ? prescription.doctor_id  // If already populated
      : doctors.find((doc) => doc._id === prescription.doctor_id);  // If just an ID
    
    setFormData({
      ...prescription,
      first_name: doctor ? doctor.first_name : "",
      last_name: doctor ? doctor.last_name : "",
      prescription_name: prescription.prescription_name || "", // Ensure prescription name is included
    });
    
    setEditingId(prescription._id);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ 
      first_name: "", 
      last_name: "", 
      amount: "", 
      patient_name: "", 
      patient_ssn: "",
      prescription_name: ""
    });
    setEditingId(null);
  };

  // Get doctor info for prescription
  const getDoctorInfo = (prescription) => {
    return prescription.doctor_id 
      ? `${prescription.doctor_id.first_name} ${prescription.doctor_id.last_name}` 
      : "Unknown Doctor";
  };

  // Handle Snackbar close
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container style={{ textAlign: "center", marginTop: "50px" }}>
      {screen === "home" && (
        <>
          <Typography variant="h4">Doctor Portal</Typography>
          <Button variant="contained" onClick={() => setScreen("manage")}>
            Manage Prescriptions
          </Button>
          <Button variant="contained" onClick={() => setScreen("report")} style={{ marginLeft: "10px" }}>
            View Report
          </Button>
        </>
      )}

      {screen === "manage" && (
        <>
          <Typography variant="h4">Manage Prescriptions</Typography>
          <TextField 
            name="first_name" 
            label="Doctor First Name" 
            value={formData.first_name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
          />
          <TextField 
            name="last_name" 
            label="Doctor Last Name" 
            value={formData.last_name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
          />
          <TextField 
            name="amount" 
            label="Amount" 
            value={formData.amount} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
          />
          <TextField 
            name="patient_name" 
            label="Patient Name" 
            value={formData.patient_name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
          />
          <TextField 
            name="patient_ssn" 
            label="Patient SSN" 
            value={formData.patient_ssn} 
            onChange={handleChange} 
            fullWidth 
            margin="normal" 
            placeholder="XXX-XX-XXXX"
          />
          <TextField 
            name="prescription_name" 
            label="Prescription Name" 
            value={formData.prescription_name} 
            onChange={handleChange} 
            fullWidth 
            margin="normal"
          />

          <div style={{ marginTop: "10px" }}>
            <Button variant="contained" onClick={handleSubmit}>
              {editingId ? "Update Prescription" : "Add Prescription"}
            </Button>
            {editingId && (
              <Button variant="outlined" onClick={resetForm} style={{ marginLeft: "10px" }}>
                Cancel
              </Button>
            )}
          </div>

          <Button variant="outlined" onClick={() => setScreen("home")} style={{ marginTop: "10px" }}>
            Back
          </Button>

          <Typography variant="h5" style={{ marginTop: "20px" }}>Existing Prescriptions</Typography>
          <List>
            {prescriptions.map((p) => (
              <ListItem key={p._id}>
                <ListItemText 
                  primary={`Time: ${p.order_time}`} 
                  secondary={
                    <>
                      <Typography variant="body2">Prescription: {p.prescription_name}</Typography>
                      <Typography variant="body2">Patient: {p.patient_name}</Typography>
                      <Typography variant="body2">Amount: {p.amount}</Typography>
                      <Typography variant="body2">Doctor: {getDoctorInfo(p)}</Typography>
                    </>
                  } 
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => startEdit(p)}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => deletePrescription(p._id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {screen === "report" && (
        <ReportPage setScreen={setScreen} />
        // <>
        //   <Typography variant="h4">Doctors & Prescriptions Report</Typography>
        //   <List>
        //     {doctors.map((doctor) => (
        //       <ListItem key={doctor._id}>
        //         <ListItemText
        //           primary={`${doctor.first_name} ${doctor.last_name}`}
        //           secondary={`Prescriptions: ${
        //             prescriptions.filter((p) => p.doctor_id === doctor._id).length
        //           }`}
        //         />
        //       </ListItem>
        //     ))}
        //   </List>
        //   <Button variant="outlined" onClick={() => setScreen("home")}>
        //     Back
        //   </Button>
        // </>
      )}

      {/* Snackbar for error messages */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default App;
