const Pet = require('../models/Pet');

// Get Pets (Read)
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find({ userId: req.user.id });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add Pet (Create)
const addPet = async (req, res) => {
  const { name, species, breed, age, medicalHistory } = req.body;
  try {
    const pet = await Pet.create({
      userId: req.user.id,
      name,
      species,
      breed,
      age,
      medicalHistory
    });
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Pet (Update)
const updatePet = async (req, res) => {
  const { name, species, breed, age, medicalHistory } = req.body;
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    pet.name = name || pet.name;
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.age = age ?? pet.age;
    pet.medicalHistory = medicalHistory || pet.medicalHistory;

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Pet (Delete)
const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    await pet.remove();
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPets, addPet, updatePet, deletePet };
