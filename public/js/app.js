// Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUser) {
        updateNavForLoggedInUser();
    }
    
    // Show driver fields when checkbox is checked
    const driverCheckbox = document.getElementById('regIsDriver');
    const driverFields = document.getElementById('driverFields');
    driverCheckbox.addEventListener('change', (e) => {
        driverFields.style.display = e.target.checked ? 'block' : 'none';
    });
});

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Load data for specific sections
    if (sectionId === 'my-rides' && authToken) {
        loadMyRides();
    } else if (sectionId === 'my-bookings' && authToken) {
        loadMyBookings();
    }
}

function updateNavForLoggedInUser() {
    document.getElementById('navLogin').style.display = 'none';
    document.getElementById('navRegister').style.display = 'none';
    document.getElementById('navLogout').style.display = 'block';
    document.getElementById('navMyRides').style.display = currentUser.isDriver ? 'block' : 'none';
    document.getElementById('navPostRide').style.display = currentUser.isDriver ? 'block' : 'none';
    document.getElementById('navMyBookings').style.display = 'block';
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = null;
    document.getElementById('navLogin').style.display = 'block';
    document.getElementById('navRegister').style.display = 'block';
    document.getElementById('navLogout').style.display = 'none';
    document.getElementById('navMyRides').style.display = 'none';
    document.getElementById('navPostRide').style.display = 'none';
    document.getElementById('navMyBookings').style.display = 'none';
    showSection('home');
}

// Authentication
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateNavForLoggedInUser();
            showSection('home');
            document.getElementById('loginForm').reset();
        } else {
            showError('loginError', data.error || 'Login failed');
        }
    } catch (error) {
        showError('loginError', 'Failed to connect to server');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const phone = document.getElementById('regPhone').value;
    const isDriver = document.getElementById('regIsDriver').checked;
    const carModel = document.getElementById('regCarModel').value;
    const carPlate = document.getElementById('regCarPlate').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, password, firstName, lastName, phone, 
                isDriver, carModel, carPlate 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateNavForLoggedInUser();
            showSection('home');
            document.getElementById('registerForm').reset();
        } else {
            showError('registerError', data.error || 'Registration failed');
        }
    } catch (error) {
        showError('registerError', 'Failed to connect to server');
    }
}

// Search Rides
async function handleSearch(event) {
    event.preventDefault();
    const date = document.getElementById('searchDate').value;
    const seats = document.getElementById('searchSeats').value;
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="spinner"></div>';
    
    try {
        let url = `${API_URL}/rides/search?seats=${seats}`;
        if (date) {
            url += `&date=${date}`;
        }
        
        const response = await fetch(url, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displaySearchResults(data.rides);
        } else {
            resultsDiv.innerHTML = `<div class="alert alert-error">${data.error || 'Search failed'}</div>`;
        }
    } catch (error) {
        resultsDiv.innerHTML = '<div class="alert alert-error">Failed to connect to server</div>';
    }
}

function displaySearchResults(rides) {
    const resultsDiv = document.getElementById('searchResults');
    
    if (rides.length === 0) {
        resultsDiv.innerHTML = '<div class="alert alert-info">No rides found. Try adjusting your search criteria.</div>';
        return;
    }
    
    resultsDiv.innerHTML = rides.map(ride => `
        <div class="ride-card">
            <div class="ride-header">
                <div class="ride-route">
                    📍 ${ride.origin.address} → ${ride.destination.address}
                </div>
                <div class="ride-price">$${ride.pricePerSeat}</div>
            </div>
            <div class="ride-details">
                <div class="ride-detail">🕒 Departure: ${new Date(ride.departureTime).toLocaleString()}</div>
                <div class="ride-detail">💺 Available Seats: ${ride.availableSeats}/${ride.totalSeats}</div>
                ${ride.notes ? `<div class="ride-detail">📝 ${ride.notes}</div>` : ''}
            </div>
            <div class="ride-footer">
                <div class="driver-info">
                    <span>👤 ${ride.driver.firstName} ${ride.driver.lastName}</span>
                    <span class="driver-rating">⭐ ${ride.driver.rating}</span>
                    ${ride.driver.carModel ? `<span>🚗 ${ride.driver.carModel}</span>` : ''}
                </div>
                ${authToken ? `<button class="btn btn-primary" onclick="bookRide(${ride.id}, ${ride.pricePerSeat})">Book Now</button>` : '<button class="btn btn-primary" onclick="showSection(\'login\')">Login to Book</button>'}
            </div>
        </div>
    `).join('');
}

// Book Ride
async function bookRide(rideId, pricePerSeat) {
    if (!authToken) {
        alert('Please login to book a ride');
        showSection('login');
        return;
    }
    
    const seatsBooked = prompt('How many seats do you want to book?', '1');
    if (!seatsBooked || seatsBooked < 1) return;
    
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ 
                rideId, 
                seatsBooked: parseInt(seatsBooked)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Booking successful! Total cost: $' + (pricePerSeat * seatsBooked));
            showSection('my-bookings');
        } else {
            alert(data.error || 'Booking failed');
        }
    } catch (error) {
        alert('Failed to connect to server');
    }
}

// Post Ride
async function handlePostRide(event) {
    event.preventDefault();
    
    if (!authToken) {
        alert('Please login to post a ride');
        showSection('login');
        return;
    }
    
    const originAddress = document.getElementById('postOriginAddress').value;
    const originLat = document.getElementById('postOriginLat').value;
    const originLng = document.getElementById('postOriginLng').value;
    const destinationAddress = document.getElementById('postDestAddress').value;
    const destinationLat = document.getElementById('postDestLat').value;
    const destinationLng = document.getElementById('postDestLng').value;
    const departureTime = document.getElementById('postDepartureTime').value;
    const totalSeats = document.getElementById('postSeats').value;
    const pricePerSeat = document.getElementById('postPrice').value;
    const notes = document.getElementById('postNotes').value;
    
    try {
        const response = await fetch(`${API_URL}/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                originLat: parseFloat(originLat),
                originLng: parseFloat(originLng),
                originAddress,
                destinationLat: parseFloat(destinationLat),
                destinationLng: parseFloat(destinationLng),
                destinationAddress,
                departureTime,
                totalSeats: parseInt(totalSeats),
                pricePerSeat: parseFloat(pricePerSeat),
                notes
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('postSuccess', 'Ride posted successfully!');
            document.getElementById('postRideForm').reset();
            setTimeout(() => {
                showSection('my-rides');
            }, 2000);
        } else {
            showError('postError', data.error || 'Failed to post ride');
        }
    } catch (error) {
        showError('postError', 'Failed to connect to server');
    }
}

// Load My Rides
async function loadMyRides() {
    const listDiv = document.getElementById('myRidesList');
    listDiv.innerHTML = '<div class="spinner"></div>';
    
    try {
        const response = await fetch(`${API_URL}/rides/my-rides`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayMyRides(data.rides);
        } else {
            listDiv.innerHTML = `<div class="alert alert-error">${data.error || 'Failed to load rides'}</div>`;
        }
    } catch (error) {
        listDiv.innerHTML = '<div class="alert alert-error">Failed to connect to server</div>';
    }
}

function displayMyRides(rides) {
    const listDiv = document.getElementById('myRidesList');
    
    if (rides.length === 0) {
        listDiv.innerHTML = '<div class="alert alert-info">You haven\'t posted any rides yet.</div>';
        return;
    }
    
    listDiv.innerHTML = rides.map(ride => `
        <div class="ride-card">
            <div class="ride-header">
                <div class="ride-route">
                    📍 ${ride.origin.address} → ${ride.destination.address}
                </div>
                <div class="ride-price">$${ride.pricePerSeat}</div>
            </div>
            <div class="ride-details">
                <div class="ride-detail">🕒 Departure: ${new Date(ride.departureTime).toLocaleString()}</div>
                <div class="ride-detail">💺 Available Seats: ${ride.availableSeats}/${ride.totalSeats}</div>
                <div class="ride-detail">📊 Status: ${ride.status}</div>
                ${ride.notes ? `<div class="ride-detail">📝 ${ride.notes}</div>` : ''}
            </div>
            <div class="ride-footer">
                <button class="btn btn-secondary" onclick="viewBookings(${ride.id})">View Bookings</button>
                <button class="btn btn-danger" onclick="deleteRide(${ride.id})">Delete Ride</button>
            </div>
        </div>
    `).join('');
}

// Load My Bookings
async function loadMyBookings() {
    const listDiv = document.getElementById('myBookingsList');
    listDiv.innerHTML = '<div class="spinner"></div>';
    
    try {
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayMyBookings(data.bookings);
        } else {
            listDiv.innerHTML = `<div class="alert alert-error">${data.error || 'Failed to load bookings'}</div>`;
        }
    } catch (error) {
        listDiv.innerHTML = '<div class="alert alert-error">Failed to connect to server</div>';
    }
}

function displayMyBookings(bookings) {
    const listDiv = document.getElementById('myBookingsList');
    
    if (bookings.length === 0) {
        listDiv.innerHTML = '<div class="alert alert-info">You haven\'t booked any rides yet.</div>';
        return;
    }
    
    listDiv.innerHTML = bookings.map(booking => `
        <div class="ride-card">
            <div class="ride-header">
                <div class="ride-route">
                    📍 ${booking.ride.originAddress} → ${booking.ride.destinationAddress}
                </div>
                <div class="ride-price">$${booking.totalPrice}</div>
            </div>
            <div class="ride-details">
                <div class="ride-detail">🕒 Departure: ${new Date(booking.ride.departureTime).toLocaleString()}</div>
                <div class="ride-detail">💺 Seats Booked: ${booking.seatsBooked}</div>
                <div class="ride-detail">📊 Status: ${booking.status}</div>
                <div class="ride-detail">👤 Driver: ${booking.driver.firstName} ${booking.driver.lastName}</div>
                ${booking.driver.carModel ? `<div class="ride-detail">🚗 ${booking.driver.carModel} (${booking.driver.carPlate})</div>` : ''}
            </div>
            <div class="ride-footer">
                ${booking.status === 'pending' || booking.status === 'confirmed' ? 
                    `<button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel Booking</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Delete Ride
async function deleteRide(rideId) {
    if (!confirm('Are you sure you want to delete this ride?')) return;
    
    try {
        const response = await fetch(`${API_URL}/rides/${rideId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            alert('Ride deleted successfully');
            loadMyRides();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete ride');
        }
    } catch (error) {
        alert('Failed to connect to server');
    }
}

// Cancel Booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: 'cancelled' })
        });
        
        if (response.ok) {
            alert('Booking cancelled successfully');
            loadMyBookings();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to cancel booking');
        }
    } catch (error) {
        alert('Failed to connect to server');
    }
}

// Helper Functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
