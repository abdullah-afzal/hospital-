const fs = require('fs');
const path = require('path');
const doctorsFilePath = path.join(__dirname, 'data', 'doctors.json');
const servicesFilePath = path.join(__dirname, 'data', 'services.json');
const usersFilePath = path.join(__dirname, 'data', 'users.json');
const passwordFilePath = path.join(__dirname, 'data', 'password.json');  // New file to store password

let currentPassword = 'admin123';  // Default password

// Check if a password file exists, if it does, load the password from it
fs.readFile(passwordFilePath, 'utf8', (err, data) => {
  if (!err && data) {
    const storedPassword = JSON.parse(data);
    currentPassword = storedPassword.password;
  }
});

// Show the login form initially
document.getElementById('login-form').style.display = 'block';
document.getElementById('admin-panel').style.display = 'none';

document.getElementById('admin-login').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();  // Prevent the default form submission behavior
    checkPassword();  // Trigger the checkPassword function manually
  }
});
// Check the entered password
function checkPassword() {
  const enteredPassword = document.getElementById('password').value;
  
  // Check if the password is empty
  if (!enteredPassword) {
    displayError('Password cannot be empty.');
    
    return;
  }

  if (enteredPassword === currentPassword) {
    document.getElementById('password').value='';
    displayError('');
    document.getElementById('login-form').style.display = 'none';  // Hide login form
    document.getElementById('admin-panel').style.display = 'block';  // Show admin panel
    loadDoctors(); // Load the doctors when admin is logged in
    loadServices(); // Load the services when admin is logged in
    loadUsers();
  } else {
    displayError('Incorrect password. Please try again.');
  }
}

// Display error message
function displayError(message) {
  const errorElement = document.getElementById('login-error');
  if (!errorElement) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'login-error';
    errorDiv.style.color = 'red';
    errorDiv.innerText = message;
    document.getElementById('login-form').prepend(errorDiv);  // Add error message at the top of the form
  } else {
    errorElement.innerText = message;  // Update existing error message
  }
}

// Change the admin password
function changePassword() {
  const oldPassword = document.getElementById('old-password').value;
  const newPassword = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Check if the old password matches the current password
  if (oldPassword !== currentPassword) {
    alert('Old password is incorrect.');
    return;
  }

  // Check if the new password and confirmation password match
  if (newPassword !== confirmPassword) {
    alert('New password and confirmation password do not match.');
    return;
  }

  // Save the new password in the password file
  currentPassword = newPassword;
  const newPasswordData = { password: newPassword };

  fs.writeFile(passwordFilePath, JSON.stringify(newPasswordData, null, 2), (err) => {
    if (err) {
      alert('Error saving the new password.');
      console.error(err);
      return;
    }

    alert('Password changed successfully!');
  });
}

// Load and display doctors
function loadDoctors() {
  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);
    const doctors = data ? JSON.parse(data) : [];
    displayDoctors(doctors);
  });
}

//load and display user

function loadUsers() {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);
    const users = data ? JSON.parse(data) : [];
    displayUsers(users);
  });
}

// Load and display services
function loadServices() {
  fs.readFile(servicesFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);
    const services = data ? JSON.parse(data) : [];
    displayServices(services);
  });
}

// Display doctors in the list
function displayDoctors(doctors) {
  const doctorList = document.getElementById('doctor-list');
  doctorList.innerHTML = '';
  doctors.forEach((doctor, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${doctor.name} - ${doctor.specialization} - $${doctor.fee} 
                    <button onclick="editDoctor(${index})">Edit</button> 
                    <button onclick="deleteDoctor(${index})">Delete</button>`;
    doctorList.appendChild(li);
  });
}
//disply uaer
function displayUsers(users) {
  const userList = document.getElementById('user-list');
  userList.innerHTML = '';
  users.forEach((user, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${user.name} 
                    <button onclick="deleteUser(${index})">Delete</button>`;
    userList.appendChild(li);
  });
}

// Display services in the list
function displayServices(services) {
  const serviceList = document.getElementById('service-list');
  serviceList.innerHTML = '';
  services.forEach((service, index) => {
    const li = document.createElement('li');
    li.innerHTML = `${service.name} - ${service.description} - $${service.fee} 
                    <button onclick="editService(${index})">Edit</button> 
                    <button onclick="deleteService(${index})">Delete</button>`;
    serviceList.appendChild(li);
  });
}

/// Add a new doctor
function addDoctor() {
  const name = document.getElementById('doctor-name').value.trim();
  const specialization = document.getElementById('specialization').value.trim();
  const fee = document.getElementById('fee').value.trim();

  // Validation
  if (!name || !specialization || !fee || isNaN(fee)) {
    alert('Please fill all fields correctly. Fee must be a number.');
    return;
  }

  const newDoctor = { name, specialization, fee };

  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    const doctors = data ? JSON.parse(data) : [];
    doctors.push(newDoctor);

    fs.writeFile(doctorsFilePath, JSON.stringify(doctors, null, 2), (err) => {
      if (err) throw err;
      loadDoctors(); // Reload the doctor list after adding
      alert('Doctor added successfully!');
    });
  });
}

// Update a doctor
function updateDoctor() {
  const index = document.getElementById('update-doctor-id').value;
  const name = document.getElementById('update-doctor-name').value.trim();
  const specialization = document.getElementById('update-specialization').value.trim();
  const fee = document.getElementById('update-fee').value.trim();

  // Validation
  if (!name || !specialization || !fee || isNaN(fee)) {
    alert('Please fill all fields correctly. Fee must be a number.');
    return;
  }

  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const doctors = data ? JSON.parse(data) : [];
    doctors[index] = { name, specialization, fee };

    fs.writeFile(doctorsFilePath, JSON.stringify(doctors, null, 2), (err) => {
      if (err) throw err;
      document.getElementById('update-doctor-form').style.display = 'none';
      loadDoctors(); // Reload the doctor list after updating
      alert('Doctor updated successfully!');
    });
  });
}


// // Show update doctor form
// function editDoctor(index) {
//   fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
//     if (err) return console.error(err);

//     const doctors = data ? JSON.parse(data) : [];
//     const doctor = doctors[index];

//     document.getElementById('update-doctor-id').value = index;
//     document.getElementById('update-doctor-name').value = doctor.name;
//     document.getElementById('update-specialization').value = doctor.specialization;
//     document.getElementById('update-fee').value = doctor.fee;

//     document.getElementById('update-doctor-form').style.display = 'block';
//   });
// }

// // Update a doctor
// function updateDoctor() {
//   const index = document.getElementById('update-doctor-id').value;
//   const name = document.getElementById('update-doctor-name').value;
//   const specialization = document.getElementById('update-specialization').value;
//   const fee = document.getElementById('update-fee').value;

//   fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
//     if (err) return console.error(err);

//     const doctors = data ? JSON.parse(data) : [];
//     doctors[index] = { name, specialization, fee };

//     fs.writeFile(doctorsFilePath, JSON.stringify(doctors, null, 2), (err) => {
//       if (err) throw err;
//       document.getElementById('update-doctor-form').style.display = 'none';
//       loadDoctors(); // Reload the doctor list after updating
//     });
//   });
// }

// Delete a doctor
function deleteDoctor(index) {
  fs.readFile(doctorsFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const doctors = data ? JSON.parse(data) : [];
    doctors.splice(index, 1); // Remove doctor at the specified index

    fs.writeFile(doctorsFilePath, JSON.stringify(doctors, null, 2), (err) => {
      if (err) throw err;
      loadDoctors(); // Reload the doctor list after deletion
    });
  });
}

//add a new user

function addUser() {
  const name = document.getElementById('user-name').value;
  const password = document.getElementById('user-password').value;

  const newUser = { name, password };

  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    const users = data ? JSON.parse(data) : [];
    users.push(newUser);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) throw err;
      loadUsers(); // Reload the doctor list after adding
    });
  });
}

//update user

// Show update user form
function editUser(index) {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const users = data ? JSON.parse(data) : [];
    const user = users[index];

    document.getElementById('update-user-id').value = index;
    document.getElementById('update-user-name').value = user.name;
    document.getElementById('update-user-password').value = user.password;

    document.getElementById('update-user-form').style.display = 'block';
  });
}

// Update a user
function updateUser() {
  const index = document.getElementById('update-user-id').value;
  const name = document.getElementById('update-user-name').value;
  const password = document.getElementById('update-user-password').value;

  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const users = data ? JSON.parse(data) : [];
    users[index] = { name, password };

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) throw err;
      document.getElementById('update-user-form').style.display = 'none';
      loadUsers(); // Reload the user list after updating
    });
  });
}

// Delete a user
function deleteUser(index) {
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const users = data ? JSON.parse(data) : [];
    users.splice(index, 1); // Remove user at the specified index

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) throw err;
      loadUsers(); // Reload the user list after deletion
    });
  });
}


// Add a new service
function addService() {
  const name = document.getElementById('service-name').value;
  const description = document.getElementById('service-description').value;
  const fee = document.getElementById('service-fee').value;

  const newService = { name, description, fee };

  fs.readFile(servicesFilePath, 'utf8', (err, data) => {
    const services = data ? JSON.parse(data) : [];
    services.push(newService);

    fs.writeFile(servicesFilePath, JSON.stringify(services, null, 2), (err) => {
      if (err) throw err;
      loadServices(); // Reload the service list after adding
    });
  });
}

// Edit and delete doctors and services logic remains the same
