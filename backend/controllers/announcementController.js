const AnnouncementService = require('../services/AnnouncementService');

class AnnouncementController {
  async getAll(req, res, next) {
    try {
      const announcements = await AnnouncementService.getAnnouncements(req.query);
      res.json({ success: true, data: announcements });
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const announcement = await AnnouncementService.create(req.body);
      res.status(201).json({ success: true, data: announcement });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const announcement = await AnnouncementService.update(req.params.id, req.body);
      res.json({ success: true, data: announcement });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const announcement = await AnnouncementService.delete(req.params.id);
      res.json({ success: true, data: announcement });
    } catch (err) {
      next(err);
    }
  }

  async getAnnouncementById(req, res, next) {
    try {
      const announcement = await AnnouncementService.getById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ success: false, message: 'Announcement not found' });
      }
      res.json({ success: true, data: announcement });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnnouncementController();