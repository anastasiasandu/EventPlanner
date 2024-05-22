const express = require('express')
const {signup, login, current, refresh, logout} = require('../handlers/auth')
const router = express.Router()
const authToken = require("../middlewares/authMiddlewares")


router.post('/signup', signup)
router.post('/login', login)
router.get('/current', authToken,current)
router.get('/refresh', authToken,refresh)
router.get('/logout', authToken,logout)

module.exports  = router