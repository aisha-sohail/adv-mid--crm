const Customer = require('../models/Customer');

// Create customer
exports.createCustomer = async (req, res) => {
  try {
    const customer = new Customer({
      ...req.body,
      createdBy: req.user.userId
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
};

// Get all customers
exports.getCustomers = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    let query = {};

    // Filter by role
    if (req.user.role === 'Team Member') {
      query.assignedTo = req.user.userId;
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;

    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
};

// Get single customer
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Team Member') {
      query.assignedTo = req.user.userId;
    }

    const totalCustomers = await Customer.countDocuments(query);
    
    const statusDistribution = await Customer.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalCustomers,
      statusDistribution
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};