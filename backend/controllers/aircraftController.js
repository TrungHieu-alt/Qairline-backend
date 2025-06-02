const AircraftService = require('../services/AircraftService');

exports.createAircraft = async (req, res) => {
  try {
    const aircraft = await AircraftService.createAircraft(req.body, req.user);
    res.status(201).json({ success: true, data: aircraft });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAircraft = async (req, res) => {
  try {
    const aircraft = await AircraftService.updateAircraft(req.params.id, req.body, req.user);
    res.json({ success: true, data: aircraft });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAllAircrafts = async (req, res) => {
  try {
    const aircrafts = await AircraftService.getAllAircrafts();
    res.json({ success: true, data: aircrafts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAircraftById = async (req, res) => {
  try {
    const aircraft = await AircraftService.getAircraftById(req.params.id);
    if (!aircraft) return res.status(404).json({ success: false, message: 'Aircraft not found' });
    res.json({ success: true, data: aircraft });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteAircraft = async (req, res) => {
  try {
    const result = await AircraftService.deleteAircraft(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};