import { io } from 'socket.io-client';

document.addEventListener('DOMContentLoaded', function() {
    const joinForm = document.getElementById('join-form');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    const messagesContainer = document.getElementById('messages');
    const adminMessage = document.getElementById("adminMessage");
  
    // Determine the environment (development or production)
    const isProduction = window.location.hostname !== 'localhost';
    const socketUrl = isProduction ? 'https://your-production-server.com' : 'http://localhost:3000';

    const socket = io(socketUrl);

    // Handle form submission on index.html (join form)
    if (joinForm) {
        joinForm.addEventListener('submit', e => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const state = document.getElementById('state').value.trim();

            if (username && state) {
                // Emit joinRoom event to the server
                socket.emit('joinRoom', { username, state });

                // Redirect to chat.html with query parameters
                window.location.href = `chat.html?username=${username}&state=${state}`;
            }
        });
    }

    // Handle message sending and receiving on chat.html
    if (messageForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        const state = urlParams.get('state');

        if (!username || !state) {
            // Redirect to index.html if username or room is missing
            window.location.href = 'index.html';
        }

        // Emit joinRoom event on chat page load
        socket.emit('joinRoom', { username, state }, 
          adminMessage.textContent = `You are connected as ${username}`
        );

        // Listen for incoming messages from the server
        socket.on('message', function(data) {
            displayMessage(data.username, data.message);
        });

        socket.on('disconnect', function(data) {
          displayMessage(data.username, data.message);
        });

        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = messageInput.value.trim();
            if (message) {
                // Send the message to the server
                socket.emit('chatMessage', { username, state, message });

                // Clear the input field after sending
                messageInput.value = '';
            }
        });

        function displayMessage(messageUsername, message) {
            const messageElement = document.createElement('div');
        
            if (messageUsername === username) {
                messageElement.className = 'message sent';
                messageElement.innerHTML = ` ${message} `;
            } else {
                messageElement.className = 'message received';
                messageElement.innerHTML = `<strong>${messageUsername}</strong>: ${message}`;
            }

            // Append the message to the messages container
            messagesContainer.appendChild(messageElement);

            // Scroll to the bottom of the container
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
});
