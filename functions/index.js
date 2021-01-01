const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin');
const BusBoy = require('busboy')
const os = require('os');
const path = require('path');
const cors = require('cors')({origin: true})
const fs = require('fs')
admin.initializeApp();

exports.doIt = functions.https.onRequest((req, res) => {
   
   cors(req, res, () => {
    console.log("In Function!")
    const bucket = admin.storage().bucket();
    const busboy = new BusBoy({headers: req.headers})
    let uploadData = null;
    console.log("Before Busboy!")

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        console.log("yo")
        const filePath = path.join(os.tmpdir(), filename);
         uploadData = {file: filePath, type: mimetype, name: filename};
        file.pipe(fs.createWriteStream(filePath));
        console.log(uploadData.filePath)
    });
    console.log("After Busboy!")
    busboy.on('finish', () => {
        console.log("In Finish Busboy!")
        bucket.upload(uploadData.file, {
            uploadType: "media",
            metadata: {
                metadata: {
                    contentType: uploadData.type
                }
            }
        }).then(() => {
            res.status(200).json({
                message: "Uploaded!"
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
        
    });
    busboy.end(req.rawBody)
});
    /*
    console.log("!!!" + request.headers.)
    const MIME_TYPE = 'image/png';
    return axios.get(IMAGE_URL, { // URL for the image
        responseType: 'arraybuffer',
        headers: {
          accept: MIME_TYPE
        }
      }).then(response => {
        //console.log(response);  // only to show we got the data for debugging
        const destinationFile = bucket.file('my-stackoverflow-logo.svg');  
        return destinationFile.save(response.data).then(() => {  // note: defaults to resumable upload
          return destinationFile.setMetadata({ contentType: MIME_TYPE });
        });
      }).then(() => { response.send('ok'); })
      .catch((err) => { console.log(err); })
      */
  });