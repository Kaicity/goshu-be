const EmployeeStatus = require('../enums/employeeStatus');
const EmployeeModel = require('../models/employeeModel');

const getDashboardSummaryService = async (month, year) => {
  const m = Number(month);
  const y = Number(year);

  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const prevStart = new Date(y, m - 2, 1);
  const prevEnd = new Date(y, m - 1, 1);

  const totalEmployees = await EmployeeModel.countDocuments({
    status: { $ne: EmployeeStatus.TERMINATED },
  });

  const prevTotalEmployees = await EmployeeModel.countDocuments({
    status: { $ne: EmployeeStatus.TERMINATED },
    joinDate: { $lt: prevEnd },
  });

  //   const jobApplicants = await JobApplicant.countDocuments({
  //     appliedAt: { $gte: start, $lt: end },
  //   });

  //   const prevJobApplicants = await JobApplicant.countDocuments({
  //     appliedAt: { $gte: prevStart, $lt: prevEnd },
  //   });

  const newEmployees = await EmployeeModel.countDocuments({
    joinDate: { $gte: start, $lt: end },
  });

  const prevNewEmployees = await EmployeeModel.countDocuments({
    joinDate: { $gte: prevStart, $lt: prevEnd },
  });

  const resignedEmployees = await EmployeeModel.countDocuments({
    resignedDate: { $gte: prevStart, $lt: prevEnd },
  });

  const prevResignedEmployees = await EmployeeModel.countDocuments({
    resignedDate: { $gte: prevStart, $lt: prevEnd },
  });

  const calcPercent = (current, prev) => {
    if (prev === 0) return 100;

    const percent = ((current - prev) / prev) * 100;
    return Math.min(Number(percent.toFixed(1)), 100);
  };

  const data = {
    totalEmployees: {
      value: totalEmployees,
      percent: calcPercent(totalEmployees, prevTotalEmployees),
    },
    newEmployees: {
      value: newEmployees,
      percent: calcPercent(newEmployees, prevNewEmployees),
    },
    resignedEmployees: {
      value: resignedEmployees,
      percent: calcPercent(resignedEmployees, prevResignedEmployees),
    },
  };

  return { data };
};

module.exports = { getDashboardSummaryService };
