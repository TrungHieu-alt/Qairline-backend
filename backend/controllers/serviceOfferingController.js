// backend/controllers/serviceOfferingController.js
const ServiceOfferingService = require('../services/ServiceOfferingService');

class ServiceOfferingController {
  async create(req, res, next) {
    try {
      const serviceOffering = await ServiceOfferingService.create(req.body);
      res.status(201).json({ success: true, data: serviceOffering });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const { travelClassId, serviceId } = req.params;
      const serviceOffering = await ServiceOfferingService.getById(travelClassId, serviceId);
      if (!serviceOffering) {
        res.status(404).json({ success: false, message: 'Service Offering not found' });
      } else {
        res.status(200).json({ success: true, data: serviceOffering });
      }
    } catch (error) {
      throw error;
    }
  }

  async update(req, res, next) {
    try {
      const { travelClassId, serviceId } = req.params;
      const serviceOffering = await ServiceOfferingService.update(travelClassId, serviceId, req.body);
      res.status(200).json({ success: true, data: serviceOffering });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ServiceOfferingService.delete(req.params.travelClassId, req.params.serviceId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      const serviceOfferings = await ServiceOfferingService.getAll();
      res.status(200).json({ success: true, data: serviceOfferings });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ServiceOfferingController();