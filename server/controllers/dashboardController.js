const Project = require('../models/Project');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard summary statistics, charts data, and recent activity
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Total counts
  const [activeProjects, totalProjects, totalClients] = await Promise.all([
    Project.countDocuments({ user: userId, status: 'Active' }),
    Project.countDocuments({ user: userId }),
    Client.countDocuments({ user: userId })
  ]);

  // 2. Total lifetime income (Paid payments)
  const totalIncomeAgg = await Payment.aggregate([
    {
      $match: {
        user: userId,
        status: 'Paid'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  const totalIncome = totalIncomeAgg.length > 0 ? totalIncomeAgg[0].total : 0;

  // 3. Pending payments: sum of (project fee - paidAmount) for projects that aren't Cancelled
  const nonCancelledProjects = await Project.find({
    user: userId,
    status: { $ne: 'Cancelled' }
  }).select('_id fee');

  const nonCancelledProjectIds = nonCancelledProjects.map((p) => p._id);

  const projectPaidSums = await Payment.aggregate([
    {
      $match: {
        user: userId,
        project: { $in: nonCancelledProjectIds },
        status: 'Paid'
      }
    },
    {
      $group: {
        _id: '$project',
        totalPaid: { $sum: '$amount' }
      }
    }
  ]);

  const paidMap = {};
  projectPaidSums.forEach((item) => {
    paidMap[item._id.toString()] = item.totalPaid;
  });

  let pendingPayments = 0;
  nonCancelledProjects.forEach((proj) => {
    const fee = proj.fee || 0;
    const paid = paidMap[proj._id.toString()] || 0;
    if (fee > paid) {
      pendingPayments += fee - paid;
    }
  });

  // 4. Status breakdown for pie chart
  const statusAgg = await Project.aggregate([
    { $match: { user: userId } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const allStatuses = ['Pending', 'Active', 'Completed', 'On Hold', 'Cancelled'];
  const statusMap = {};
  statusAgg.forEach((item) => {
    statusMap[item._id] = item.count;
  });

  const statusBreakdown = allStatuses.map((status) => ({
    status,
    count: statusMap[status] || 0
  }));

  // 5. Monthly income for the past 12 months
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const monthlyAgg = await Payment.aggregate([
    {
      $match: {
        user: userId,
        status: 'Paid',
        date: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$date' }
        },
        income: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const monthlyMap = {};
  monthlyAgg.forEach((item) => {
    monthlyMap[item._id] = item.income;
  });

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyIncome = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyIncome.push({
      key,
      label,
      income: monthlyMap[key] || 0
    });
  }

  // 6. Recent 5 payments
  const recentPayments = await Payment.find({ user: userId })
    .sort({ date: -1, createdAt: -1 })
    .limit(5)
    .populate('project', 'name')
    .populate('client', 'name');

  // 7. Recent 5 projects
  const recentProjects = await Project.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('client', 'name');

  res.status(200).json({
    success: true,
    data: {
      stats: {
        activeProjects,
        totalProjects,
        totalClients,
        totalIncome,
        pendingPayments
      },
      statusBreakdown,
      monthlyIncome,
      recentPayments,
      recentProjects
    }
  });
});

module.exports = {
  getDashboardSummary
};
