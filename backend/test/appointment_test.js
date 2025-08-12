const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const TreatmentRecord = require('../models/TreatmentRecord');
const VaccinationRecord = require('../models/VaccinationRecord');
const appointmentController = require('../controllers/appointmentController');
const { expect } = chai;

afterEach(() => {
  sinon.restore(); 
});

// test addAppointment
describe('Appointment Controller - AddAppointment', () => {
  it('should create a new appointment successfully', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        petId: new mongoose.Types.ObjectId(),
        date: '2025-08-09',
        reason: 'Regular check',
        appointmentType: 'Treatment',
        status: 'Scheduled'
      }
    };
    const createdAppointment = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

    const createStub = sinon.stub(Appointment, 'create').resolves(createdAppointment);

    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await appointmentController.addAppointment(req, res);

    expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith(createdAppointment)).to.be.true;
  });

  it('should return 500 if an error occurs', async () => {
    const req = {
      user: { id: new mongoose.Types.ObjectId() },
      body: {
        petId: new mongoose.Types.ObjectId(),
        date: '2025-08-09',
        reason: 'Regular check',
        appointmentType: 'Treatment',
        status: 'Scheduled'
      }
    };

    const createStub = sinon.stub(Appointment, 'create').throws(new Error('DB Error'));
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await appointmentController.addAppointment(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
  });
});

// test updateAppointment
describe('Appointment Controller - UpdateAppointment', () => {
  it('should update appointment successfully and create TreatmentRecord if completed', async () => {
    const appointmentId = new mongoose.Types.ObjectId();
    const existingAppointment = {
      _id: appointmentId,
      petId: new mongoose.Types.ObjectId(),
      date: '2025-08-09',
      reason: 'Old reason',
      appointmentType: 'Treatment',
      status: 'Scheduled',
      save: sinon.stub().resolvesThis()
    };

    sinon.stub(Appointment, 'findById').resolves(existingAppointment);
    const treatmentCreateStub = sinon.stub(TreatmentRecord, 'create').resolves({});

    const req = {
      params: { id: appointmentId },
      body: { reason: 'New treatment', status: 'Completed' }
    };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await appointmentController.updateAppointment(req, res);

    expect(existingAppointment.reason).to.equal('New treatment');
    expect(treatmentCreateStub.calledOnce).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it('should return 404 if appointment not found', async () => {
    sinon.stub(Appointment, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

    await appointmentController.updateAppointment(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Appointment not found' })).to.be.true;
  });
});

// test getAppointments
describe('Appointment Controller - GetAppointments', () => {
  it('should return all appointments', async () => {
    const userId = new mongoose.Types.ObjectId();
    const appointments = [{ _id: new mongoose.Types.ObjectId(), userId }];

    const findStub = sinon.stub(Appointment, 'find').returns({ populate: sinon.stub().resolves(appointments) });

    const req = { user: { id: userId } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await appointmentController.getAppointments(req, res);

    expect(findStub.calledOnceWith({ userId })).to.be.true;
    expect(res.json.calledWith(appointments)).to.be.true;
  });
});

// test deleteAppointment
describe('Appointment Controller - DeleteAppointment', () => {
  it('should delete an appointment successfully', async () => {
    const appointmentId = new mongoose.Types.ObjectId();
    const appointment = { remove: sinon.stub().resolves() };

    sinon.stub(Appointment, 'findById').resolves(appointment);

    const req = { params: { id: appointmentId } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await appointmentController.deleteAppointment(req, res);

    expect(res.json.calledWith({ message: 'Appointment deleted' })).to.be.true;
  });

  it('should return 404 if appointment not found', async () => {
    sinon.stub(Appointment, 'findById').resolves(null);

    const req = { params: { id: new mongoose.Types.ObjectId() } };
    const res = { json: sinon.spy(), status: sinon.stub().returnsThis() };

    await appointmentController.deleteAppointment(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWith({ message: 'Appointment not found' })).to.be.true;
  });
});
