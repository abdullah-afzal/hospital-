const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const doctorsFilePath = path.join(__dirname, 'data', 'doctors.json');
const servicesFilePath = path.join(__dirname, 'data', 'services.json');
const patientsFilePath = path.join(__dirname, 'data', 'patients.json');


async function changePassword() {
  
  try {
    const user = await ipcRenderer.invoke('get-session');
    if (!user) {
      alert('User session not found. Please log in again.');
      window.location.href = 'login.html';
      return;
    }

    const oldPassword = document.getElementById('old-password').value.trim();
    const newPassword = document.getElementById('new-password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    // Validate input fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('All fields are required.');
      return;
    }

    // Check if the old password matches the current password
    if (oldPassword !== user.password) {
      alert('Old password is incorrect.');
      return;
    }

    // Check if the new password and confirmation password match
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation password do not match.');
      return;
    }

    // Read the users.json file
    fs.readFile(usersFilePath, 'utf8', (err, data) => {
      if (err) {
        alert('Error reading user data.');
        console.error(err);
        return;
      }

      let users;
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        alert('Error processing user data.');
        console.error(parseError);
        return;
      }

      // Find the user in the file
      const userIndex = users.findIndex((u) => u.username === user.username);
      if (userIndex === -1) {
        alert('User not found.');
        return;
      }

      // Update the password for the user
      users[userIndex].password = newPassword;

      // Write the updated users back to the file
      fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (writeError) => {
        if (writeError) {
          alert('Error saving the new password.');
          console.error(writeError);
          return;
        }

        alert('Password changed successfully!');
        signOut(`SignIn again with new password`)
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
}

// Load doctors and services
function loadDoctors() {
  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    if (err) throw err;
    const doctors = data ? JSON.parse(data) : [];
    populateDoctorsDropdown(doctors);
  });
}

function loadServices() {
  fs.readFile(servicesFilePath, 'utf8', (err, data) => {
    if (err) throw err;
    const services = data ? JSON.parse(data) : [];
    populateServicesDropdown(services);
  });
}

function populateDoctorsDropdown(doctors) {
  const doctorSelect = document.getElementById('doctor-select');
  doctorSelect.innerHTML = '';  // Clear previous options

  doctors.forEach((doctor) => {
    const option = document.createElement('option');
    option.value = doctor.name;
    option.innerText = `${doctor.name} (${doctor.specialization})`;
    doctorSelect.appendChild(option);
  });
}

// Display the selected doctor's fee
document.getElementById('doctor-select').addEventListener('change', function() {
  const doctorSelect = document.getElementById('doctor-select');
  const selectedDoctorName = doctorSelect.value;

  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    if (err) throw err;
    const doctors = JSON.parse(data);
    const selectedDoctor = doctors.find(doctor => doctor.name === selectedDoctorName);
    
    if (selectedDoctor) {
      document.getElementById('doctor-fee').innerText = `Doctor's Fee: $${selectedDoctor.fee}`;
    }
  });
});

function populateServicesDropdown(services) {
  const serviceSelect = document.getElementById('service-select');
  serviceSelect.innerHTML = '';  // Clear previous options

  services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.name;
    option.dataset.fee = service.fee; // Store the fee in a data attribute
    option.innerText = `${service.name} - $${service.fee}`;
    serviceSelect.appendChild(option);
  });
}

// Handle form submission and save patient details
document.getElementById('patient-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const patientName = document.getElementById('patient-name').value;
  const patientAge = document.getElementById('patient-age').value;
  const patientGender = document.getElementById('patient-gender').value;
  const patientPhone = document.getElementById('patient-phone').value;
  const doctor = document.getElementById('doctor-select').value;
  const selectedServices = Array.from(document.getElementById('service-select').selectedOptions);

  const services = selectedServices.map(option => option.value);

  try {
    const user = await ipcRenderer.invoke('get-session');
    // Fetch the doctor's fee
    const doctorFee = await getDoctorFee(doctor);

    // Calculate the total service fee
    const servicesFee = selectedServices.reduce((total, option) => total + parseFloat(option.dataset.fee), 0);

    // Calculate the total expense: doctor fee + services fee
    const totalExpense = Number(doctorFee) + Number(servicesFee);

    const newPatient = {
      name: patientName,
      age: patientAge,
      gender: patientGender,
      phone: patientPhone,
      doctor: doctor,
      services: services,
      doctorFee: doctorFee,
      servicesFee: servicesFee,
      totalExpense: totalExpense,
      time: new Date(),
      receptionist: user.username,
    };

    // Read existing patients and append new one
    fs.readFile(patientsFilePath, 'utf8', (err, data) => {
      const patients = data ? JSON.parse(data) : [];
      patients.push(newPatient);

      fs.writeFile(patientsFilePath, JSON.stringify(patients, null, 2), (err) => {
        if (err) throw err;

        // Display patient details and total expense below the form
        displayPatientDetails(newPatient);
        document.getElementById('patient-form').reset(); // Reset form
        document.getElementById('message').innerText = 'Receipt generated successfully!';
      });
    });
     
    document.getElementById('patient-name').value = '';
    document.getElementById('patient-gender').value = '';
    document.getElementById('patient-age').value = '';
    document.getElementById('patient-phone').value = '';
    document.getElementById('doctor-select').value = '';

  } catch (error) {
    console.error("Error fetching doctor's fee or processing patient data:", error);
  }
});

// Get the doctor's fee from the doctors list
function getDoctorFee(doctorName) {
  return new Promise((resolve, reject) => {
    fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
      if (err) reject(err);
      const doctors = JSON.parse(data);
      const doctor = doctors.find(d => d.name === doctorName);
      if (doctor) {
        resolve(doctor.fee);
      } else {
        resolve(0);  // Return 0 if doctor is not found
      }
    });
  });
}

// Display patient details after registration
function displayPatientDetails(patient) {
  const patientInfo = `
    <strong>Patient Name:</strong> ${patient.name} <br>
    <strong>Patient Age:</strong> ${patient.age} <br>
    <strong>Patient Gender:</strong> ${patient.gender} <br>
    <strong>Phone Number:</strong> ${patient.phone} <br>
    <strong>Doctor's Name:</strong> ${patient.doctor} <br>
  `;
  
  document.getElementById('patient-info').innerHTML = patientInfo;

  // Display services and their respective fees
  let feesInfo = `
    <h3>Services:</h3>
    <ul>
  `;

  patient.services.forEach(service => {
    feesInfo += `<li>${service} fee:${patient.servicesFee}</li>`;
  });

  feesInfo += `
    </ul>
    <h4>Doctor's Fee: $${patient.doctorFee}</h4>
  `;
  
  document.getElementById('fees-info').innerHTML = feesInfo;
  document.getElementById('total-expense').innerText = patient.totalExpense; // Show total expense
  document.getElementById('print-slip-btn').style.display = 'block';  // Show the print button
}

// Print slip function with improved formatting
async function printSlip() {
  const printWindow = window.open('', '', 'height=600,width=800');
  
  // Get current date and time for the slip
  const date = new Date().toLocaleString();
  
  // Generate the receptionist's name (for now, hardcoded, you can modify as needed)
  const user = await ipcRenderer.invoke('get-session');
  const receptionistName = user.username;

  printWindow.document.write('<html><head><title>Patient Slip</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
    }
    .container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }
    .header, .footer {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .header h2 {
      font-size: 18px;
      margin: 5px 0;
    }
    .patient-info, .fees-info {
      margin: 20px 0;
    }
    .patient-info strong {
      font-weight: bold;
    }
    .fees-info ul {
      list-style-type: none;
      padding: 0;
    }
    .fees-info li {
      margin-bottom: 5px;
    }
    .total-expense {
      font-size: 18px;
      font-weight: bold;
    }
    .footer p {
      margin-top: 20px;
      font-size: 14px;
    }
  `);
  printWindow.document.write('</style></head><body>');

  printWindow.document.write(`
    <div class="container">
      <div class="header">
        <h1>Hospital Registration Slip</h1>
        <h2>Generated on: ${date}</h2>
        <h2>Generated by: ${receptionistName}</h2>
      </div>

      <div class="patient-info">
        <h3>Patient Details</h3>
        ${document.getElementById('patient-info').innerHTML}
      </div>

      <div class="fees-info">
        <h3>Services & Fees</h3>
        ${document.getElementById('fees-info').innerHTML}
      </div>

      <div class="total-expense">
        <p><strong>Total Expense:</strong> $${document.getElementById('total-expense').innerText}</p>
      </div>

      <div class="footer">
        <p>Thank you for choosing our hospital. For any inquiries, please contact us.</p>
      </div>
    </div>
  `);

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();  // Trigger print dialog
}



///signout
function signOut(message) {
  window.location.href = 'index.html';
  alert(message);
}


// Load doctors and services on page load
loadDoctors();
loadServices();
