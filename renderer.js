const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const usersFilePath = path.join(__dirname, 'data', 'users.json');


async function saveUserSession(user) {
  await ipcRenderer.invoke('set-session', user);
}


// Function to check password
function checkPassword(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // Check if fields are empty
  if (!username || !password) {
    displayError('Username and password cannot be empty.');
    return false;
  }

  // Read users.json file
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users.json:', err);
      displayError('Error loading user data. Please contact support.');
      return;
    }

    try {
      const users = JSON.parse(data);
      const user = users.find(
        (u) => u.username === username && u.password === password
      );

      if (user) {
        
        displayError('');
        saveUserSession(user);

        // Redirect based on role
        if (user.isAdmin) {
          window.location.href = 'admin.html'; // Redirect to admin dashboard
        } else {
          window.location.href = 'receptionist.html'; // Redirect to receptionist dashboard
        }
      } else {
        displayError('Invalid username or password. Please try again.');
      }
    } catch (parseError) {
      console.error('Error parsing users.json:', parseError);
      displayError('Error processing user data. Please contact support.');
    }
  });

  return false; // Prevent default form submission
}

// Function to display an error message
function displayError(message) {
  const errorElement = document.getElementById('login-error');
  if (message) {
    errorElement.textContent = message;
    errorElement.style.color = 'red';
  } else {
    errorElement.textContent = ''; // Clear the error message
  }
}
