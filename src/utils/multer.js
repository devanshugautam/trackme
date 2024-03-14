const multer = require('multer');

/**
 * Multer storage configuration for file uploads.
 *
 * @type {multer.StorageEngine}
 */
const storage = multer.diskStorage({
    /**
     * Function to determine the destination folder for file uploads.
     *
     * @param {Request} req - The Express request object.
     * @param {file} file - The file object received from the client.
     * @param {Function} cb - The callback function to indicate the destination folder.
     */
    destination: function (req, file, cb) {
        // Specify the destination folder for file uploads.
        cb(null, 'public');
    },

    /**
     * Function to determine the filename for the uploaded file.
     *
     * @param {Request} req - The Express request object.
     * @param {file} file - The file object received from the client.
     * @param {Function} cb - The callback function to indicate the filename.
     */
    filename: function (req, file, cb) {
        // Extract the file extension from the original filename.
        let exe = file.originalname.split('.').pop();

        // Generate a unique filename with a random number and timestamp.
        let filename = `${Math.floor(Math.random() * 10000)}${Date.now()}.${exe}`;

        // Return the generated filename to the callback.
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

module.exports = { upload };