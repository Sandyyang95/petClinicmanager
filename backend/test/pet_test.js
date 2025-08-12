const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Pet = require('../models/Pet');
const { addPet, getPets, updatePet, deletePet } = require('../controllers/petController');
const { expect } = chai;

describe('Pet Controller - AddPet', () => {
  it('should add a new pet successfully', async () => {
    const req = {
      body: { name: "Buddy", type: "Dog", age: 3, owner: "John Doe" }
    };
    const addPet = { _id: new mongoose.Types.ObjectId(), ...req.body };
    const createStub = sinon.stub(Pet, 'add').resolves(addPet);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await addPet(req, res);

    expect(createStub.calledOnceWith(req.body)).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(addPet)).to.be.true;

    createStub.restore();
  });

  it('should return 500 if an error occurs', async () => {
    const createStub = sinon.stub(Pet, 'add').throws(new Error('DB Error'));
    const req = { body: { name: "Buddy" } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await addPet(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;

    createStub.restore();
  });
});

describe('Pet Controller - UpdatePet', () => {
  it('should update pet successfully', async () => {
    const petId = new mongoose.Types.ObjectId();
    const existingPet = {
      _id: petId,
      name: "Buddy",
      type: "Dog",
      save: sinon.stub().resolvesThis()
    };
    const findByIdStub = sinon.stub(Pet, 'findById').resolves(existingPet);

    const req = { params: { id: petId }, body: { name: "Max" } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await updatePet(req, res);

    expect(existingPet.name).to.equal("Max");
    expect(res.status.called).to.be.false;
    expect(res.json.calledOnce).to.be.true;

    findByIdStub.restore();
  });

  it('should return 404 if pet not found', async () => {
    const findByIdStub = sinon.stub(Pet, 'findById').resolves(null);
    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await updatePet(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Pet not found' })).to.be.true;

    findByIdStub.restore();
  });
});

describe('Pet Controller - GetPets', () => {
  it('should return all pets', async () => {
    const pets = [{ name: "Buddy" }, { name: "Max" }];
    const findStub = sinon.stub(Pet, 'find').withArgs({ userId: 'test-user-id' }).resolves(pets);

    const req = {user: { id: 'test-user-id' } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await getPets(req, res);

    expect(findStub.calledOnce).to.be.true;
    expect(res.json.calledWith(pets)).to.be.true;

    findStub.restore();
  });
});

describe('Pet Controller - DeletePet', () => {
  it('should delete a pet successfully', async () => {
    const req = { params: { id: new mongoose.Types.ObjectId().toString() } };
    const pet = { remove: sinon.stub().resolves() };
    const findByIdStub = sinon.stub(Pet, 'findById').resolves(pet);
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await deletePet(req, res);

    expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
    expect(pet.remove.calledOnce).to.be.true;
    expect(res.json.calledWith({ message: 'Pet deleted' })).to.be.true;

    findByIdStub.restore();
  });
});
