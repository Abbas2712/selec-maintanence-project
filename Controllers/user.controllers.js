const bcrypt = require('bcrypt')
const { generateToken } = require('../Middleware/jsonToken.middleware')
const {findUser, checkLoginRole} = require('../Middleware/checkAuth.middleware')

const login = async(req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    try {
        let user = await findUser(username)
        if (user) {
            let role = await checkLoginRole(user)
            const compare = await bcrypt.compare(password, user.password)
            if (compare) {
                if (role !== null) {
                    let token = generateToken(user.username, role)
                    res.status(201).json({ access_token: token });
                }
                return res.status(404).json({ error: role })
            }
            return res.status(400).json({ msg: 'incorrect password' });
        }
        return res.status(404).json({ error: "Username not found" })

    } catch (err) {
        return new Error(err)
    }

}

module.exports = { login }