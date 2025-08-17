const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, petController.getPets);
router.post('/', protect, petController.addPet);
router.put('/:id', protect, petController.updatePet);
router.delete('/:id', protect, petController.deletePet);

module.exports = router;