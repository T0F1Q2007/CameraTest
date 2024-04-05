document.getElementById('captureButton').addEventListener('click', function() {
    // Access the device camera
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(stream) {
        var video = document.createElement('video');
        document.body.appendChild(video);
        video.srcObject = stream;
        video.play();

        // Capture image after 2 seconds
        setTimeout(function() {
            var canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            var imageUrl = canvas.toDataURL('image/png');

            // Display captured image
            var capturedImage = document.getElementById('capturedImage');
            capturedImage.src = imageUrl;
            capturedImage.style.display = 'block';

            // Convert base64 image to Blob
            var blob = dataURItoBlob(imageUrl);

            // Prepare form data
            var formData = new FormData();
            formData.append('imageFile', blob);

            // Upload image to server
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/upload', true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    console.log('Image uploaded successfully');
                } else {
                    console.error('Error uploading image');
                }
            };
            xhr.send(formData);

            // Cleanup
            document.body.removeChild(video);
            stream.getVideoTracks()[0].stop();
        }, 2000);
    })
    .catch(function(err) {
        console.error('Error accessing camera: ', err);
    });
});

// Function to convert data URI to Blob
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}
const express = require('express');
const multer = require('multer');
const path = require('path');
const { SftpClient } = require('ssh2-sftp-client');

const app = express();

// Storage configuration for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage });

// SFTP configuration
const sftpConfig = {
    host: '82.194.13.43',
    port: 22, // SFTP port
    username: 'tofiqv',
    password: 'aKindT0fiq'
};

// Route to handle file upload
app.post('/upload', upload.single('imageFile'), async function (req, res, next) {
    try {
        // Initialize SFTP client
        const sftp = new SftpClient();
        await sftp.connect(sftpConfig);

        // Upload file to the server
        await sftp.put(req.file.path, '/home/tofiqv/Desktop/HTML\ project' + req.file.filename);

        // Close the SFTP connection
        await sftp.end();

        // File uploaded successfully
        res.sendStatus(200);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).send('Error uploading file');
    }
});

// Serve static files
app.use(express.static('public'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
