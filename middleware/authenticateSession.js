const { fetchInfoFromUserId } = require('../controller/userDataHandler');

/**
 * Authenticate and allow to use /upload /delete /update /download
 * only if user is logged in, if user is logged in then populate session object 
 * with username and verifiedAt
 */
const authenticateSession = (req, res, next) => {
  if (req.session.userId) {
    fetchInfoFromUserId(req.session.userId)
      .then(result => {
        if (!result) {
          req.session.destroy();
          return res.redirect('/login')
        }
        req.session.username = result.username;
        req.session.verification = result.verifiedAt;
        return next()
      }).catch(err => res.status(500).send({ message: err.message }))
  }
  else {
    return res.redirect('/login');
  }

};

module.exports = authenticateSession;
