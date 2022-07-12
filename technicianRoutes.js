const express = require('express');
const technicianController = require('./../controllers/technicianController');
const router = express.Router();

router.param('id',technicianController.check);

router
.route('/')
.get(technicianController.getAlltours)
.post(technicianController.checkBody ,technicianController.createTours)

router.route('/:id')
.get(technicianController.getTours)
.patch(technicianController.updateTours)
.delete(technicianController.deleteTours)

module.exports = router;