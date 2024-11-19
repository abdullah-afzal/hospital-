const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const doctorsFilePath = path.join(__dirname, 'data', 'doctors.json');
const servicesFilePath = path.join(__dirname, 'data', 'services.json');
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// const user = await ipcRenderer.invoke('get-session');

// Change the admin password
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
      });
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    alert('An unexpected error occurred. Please try again.');
  }
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
    li.innerHTML = `${user.username} 
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
  const username = document.getElementById('user-name').value;
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;

  if (!username || !password || !role) {
    alert('Please fill all fields.');
    return;
  }

  const newUser = { username, password, isAdmin: role=="true" };

  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    const users = data ? JSON.parse(data) : [];
    users.push(newUser);

    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) throw err;
      alert('User added successfully!');
      document.getElementById('user-name').value="";
      document.getElementById('user-password').value="";
      loadUsers(); // Reload the user list
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
    document.getElementById('update-user-name').value = user.username;
    document.getElementById('update-user-password').value = user.password;

    document.getElementById('update-user-form').style.display = 'block';
  });
}

// Update a user
function updateUser() {
  const index = document.getElementById('update-user-id').value;
  const username = document.getElementById('update-user-name').value;
  const password = document.getElementById('update-user-password').value;

  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) return console.error(err);

    const users = data ? JSON.parse(data) : [];
    users[index] = { username, password };

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





///signout
function signOut() {
  window.location.href = 'index.html';
  alert('Signed out successfully.');
}

loadDoctors();
loadUsers();
loadServices();