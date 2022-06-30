const sequelize = require('sequelize');
const Bcrypt = require('bcrypt');
const Op = sequelize.Op;
const jwt = require('jsonwebtoken');
const { upload, deleteImg } = require('../modules/multer');
const nodemailer = require('nodemailer');
const { User } = require('../../models');
