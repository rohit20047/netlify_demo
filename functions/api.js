// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const serverless = require('serverless-http');
// const fs = require('fs');
// const app = express();
// const router = express.Router();

// // Ensure the /tmp/upload directory exists
// const uploadDir = path.join('/tmp/upload');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Set storage engine
// const storage = multer.diskStorage({
//   destination: uploadDir, // Use /tmp directory for temporary storage
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename file with timestamp
//   }
// });

// // Initialize upload
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10000000 }, // Limit file size to 10MB
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   }
// }).single('pdf');

// // Check file type
// function checkFileType(file, cb) {
//   const filetypes = /pdf/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb('Error: PDFs Only!');
//   }
// }

// // Serve static files from the 'dist' directory
// app.use(express.static(path.join(__dirname, '../../dist')));

// // Serve static files from the 'upload' directory
// app.use('/upload', express.static('/tmp/upload'));

// // Serve the HTML file
// router.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });

// router.post('/upload', (req, res) => {
 
//   upload(req, res, (err) => {
//     if (err) {
//       console.error('upload error:', err); // Debug statement
//       res.json({ error: err });
//     } else {
//       if (req.file == undefined) {
//         res.json({ error: 'No file selected!' });
//       } else {
//         const filePath = `functions/api/upload/${req.file.filename}`;
       
//         console.log(`File uploaded: ${filePath}`); // Debug statement
//         res.json({ file: filePath });
//       }
//     }
//   });
// });

// app.use('/.netlify/functions/api', router);
// module.exports.handler = serverless(app);
const express = require('express');
const multer = require('multer');
const path = require('path');
const serverless = require('serverless-http');
const fs = require('fs');

const app = express();
const router = express.Router();

// Ensure the /tmp/upload directory exists
const uploadDir = path.join('/tmp/upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: uploadDir, // Use /tmp directory for temporary storage
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename file with timestamp
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('pdf');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDFs Only!');
  }
}

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Serve static files from the 'upload' directory (optional)
// app.use('/upload', express.static('/tmp/upload'));

// Serve the HTML file
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist', 'index.html'));
});

router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('upload error:', err);
      res.json({ error: err });
    } else {
      if (req.file == undefined) {
        res.json({ error: 'No file selected!' });
      } else {
        // Extract filename and construct the final URL
        const filename = req.file.filename;
        const finalUrl = `https://${req.hostname}/upload/${filename}`; // Replace with your domain if needed

        console.log(`File uploaded: ${filename}`);
        res.json({ url: finalUrl });
      }
    }
  });
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
