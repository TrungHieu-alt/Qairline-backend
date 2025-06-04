// backend/controllers/serviceOfferingController.js
const ServiceOfferingService = require('../services/ServiceOfferingService');

class ServiceOfferingController {
  async create(req, res, next) {
    try {
      const serviceOffering = await ServiceOfferingService.createServiceOffering(req.body);
      res.status(201).json({ success: true, data: serviceOffering });
    } catch (error) {
      throw error;
    }
  }

  async getById(req, res, next) {
    try {
      const { travelClassId, serviceId } = req.params;
      const serviceOffering = await ServiceOfferingService.getServiceOfferingById(travelClassId, serviceId);
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
      const serviceOffering = await ServiceOfferingService.updateServiceOffering(travelClassId, serviceId, req.body);
      res.status(200).json({ success: true, data: serviceOffering });
    } catch (error) {
      throw error;
    }
  }

  async delete(req, res, next) {
    try {
      const result = await ServiceOfferingService.deleteServiceOffering(req.params.travelClassId, req.params.serviceId);
      res.status(200).json({ success: true, message: 'Service Offering deleted successfully', data: result });
    } catch (error) {
      throw error;
    }
  }

  async getAll(req, res, next) {
    try {
      const serviceOfferings = await ServiceOfferingService.getAll();
      res.status(200).json({ success: true, message: 'Service Offerings fetched successfully', data: await ServiceOfferingService.getAllServiceOfferings() });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ServiceOfferingController();