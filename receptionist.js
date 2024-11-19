const fs = require('fs');
const path = require('path');

const doctorsFilePath = path.join(__dirname, 'data', 'doctors.json');
const servicesFilePath = path.join(__dirname, 'data', 'services.json');
const patientsFilePath = path.join(__dirname, 'data', 'patients.json');

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
  const patientSex = document.getElementById('patient-sex').value;
  const patientPhone = document.getElementById('patient-phone').value;
  const doctor = document.getElementById('doctor-select').value;
  const selectedServices = Array.from(document.getElementById('service-select').selectedOptions);

  const services = selectedServices.map(option => option.value);

  try {
    // Fetch the doctor's fee
    const doctorFee = await getDoctorFee(doctor);

    // Calculate the total service fee
    const servicesFee = selectedServices.reduce((total, option) => total + parseFloat(option.dataset.fee), 0);

    // Calculate the total expense: doctor fee + services fee
    const totalExpense = Number(doctorFee) + Number(servicesFee);

    const newPatient = {
      name: patientName,
      age: patientAge,
      sex: patientSex,
      phone: patientPhone,
      doctor: doctor,
      services: services,
      doctorFee: doctorFee,
      servicesFee: servicesFee,
      totalExpense: totalExpense,
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
        document.getElementById('message').innerText = 'Patient registered successfully!';
      });
    });
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
    <strong>Name:</strong> ${patient.name} <br>
    <strong>Age:</strong> ${patient.age} <br>
    <strong>Sex:</strong> ${patient.sex} <br>
    <strong>Phone Number:</strong> ${patient.phone} <br>
    <strong>Doctor:</strong> ${patient.doctor} <br>
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

// Print slip function
function printSlip() {
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Patient Slip</title></head><body>');
  printWindow.document.write('<h2>Hospital Registration Slip</h2>');
  printWindow.document.write(document.getElementById('patient-info').innerHTML);
  printWindow.document.write(document.getElementById('fees-info').innerHTML);
  printWindow.document.write(`<p><strong>Total Expense:</strong> $${document.getElementById('total-expense').innerText}</p>`);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();  // Trigger print dialog
}

// Load doctors and services on page load
loadDoctors();
loadServices();
