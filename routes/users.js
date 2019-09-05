const controller = require('../controllers/users');
const validateToken = require('../utils').validateToken;

module.exports = (router) => {
    router.route('/users')
        .post(controller.add)
        .get(validateToken, controller.getAll); // This route uses the validateToken middleware to protect access

    router.route('/login')
        .post(controller.login);

        
}