const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');

router.get('/', petController.getPets);
router.post('/', petController.addPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);

module.exports = router;
