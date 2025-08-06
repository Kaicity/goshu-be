const DepartmentModel = require('../models/departmentModel');

const data = [
  { name: 'Phòng Kinh Doanh', description: 'Phụ trách các hoạt động bán hàng và chăm sóc khách hàng' },
  { name: 'Phòng Kế Toán', description: 'Quản lý tài chính và kế toán' },
  { name: 'Phòng Nhân Sự', description: 'Tuyển dụng và quản lý nhân sự' },
  { name: 'Phòng Kỹ Thuật', description: 'Phát triển và bảo trì hệ thống kỹ thuật' },
  { name: 'Phòng Marketing', description: 'Chiến lược quảng bá và phát triển thương hiệu' },
  { name: 'Phòng Sản Xuất', description: 'Quản lý quy trình sản xuất sản phẩm' },
  { name: 'Phòng Hành Chính', description: 'Quản lý văn phòng và hỗ trợ nội bộ' },
  { name: 'Phòng Pháp Chế', description: 'Đảm bảo tuân thủ pháp luật' },
  { name: 'Phòng R&D', description: 'Nghiên cứu và phát triển sản phẩm mới' },
  { name: 'Phòng IT', description: 'Hỗ trợ kỹ thuật và quản trị hệ thống' },
];

async function seedDepartment() {
  // KIEU TRUYEN THONG RAT HAP DAN
  for (let i = 0; i < data.length; i++) {
    const newDepartment = new DepartmentModel({
      name: data[i].name,
      description: data[i].description,
    });

    await newDepartment.save();
  }
}

module.exports = seedDepartment;
