const AnnouncementService = require('../services/AnnouncementService');
const announcementService = new AnnouncementService();

exports.getAll = async (req, res) => {
  try {
    const announcements = await announcementService.getAll();
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const announcement = await announcementService.create(req.body);
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const announcement = await announcementService.update(req.params.id, req.body);
    res.json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const announcement = await announcementService.delete(req.params.id);
    res.json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};