const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;
    function escape(html) {
      return html.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
    }

    if(title && author && email && file && title.length <= 25 && author.length <=50) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0];
      if (fileExt == 'jpg' || fileExt == 'png' || fileExt == 'jpg') {
      const newPhoto = new Photo({ title: escape(title), author: escape(author), email: escape(author), src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
      } else {
        throw new Error('Wrong input!');
      }

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());
  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {

  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const photoVoter = await Voter.findOne({user: req.ip});
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else if (!photoVoter) {
      photoToUpdate.votes++;
      await photoToUpdate.save();
      const newVoter = new Voter({ user: req.ip, votes: [] });
      newVoter.votes.push(req.params.id);
      await newVoter.save(); 
      res.send({ message: 'OK' });
    } else if (!photoVoter.votes.includes(req.params.id)) {
      photoToUpdate.votes++;
      await photoToUpdate.save();
      photoVoter.votes.push(req.params.id);
      await photoVoter.save();
    } else {
      console.log(photoVoter.votes, req.params.id);
      console.log('You can vote only once for this photo');
      res.status(500).json({message: 'You can vote only once for this photo'});
    }
  } catch(err) {
    console.log(err);
    res.status(500).json(err);
  }

};
