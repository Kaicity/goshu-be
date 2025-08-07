const DepartmentModel = require('../models/departmentModel');

const data = [
  { name: 'Phòng Kinh Doanh', description: 'Phụ trách bán hàng, phát triển khách hàng và duy trì mối quan hệ với đối tác' },
  { name: 'Phòng Tài Chính - Kế Toán', description: 'Quản lý ngân sách, kế toán, báo cáo tài chính và dòng tiền' },
  { name: 'Phòng Nhân Sự', description: 'Tuyển dụng, đào tạo, phát triển nhân lực và xây dựng văn hóa công ty' },
  { name: 'Phòng Kỹ Thuật (Engineering)', description: 'Phát triển và bảo trì các sản phẩm phần mềm của công ty' },
  {
    name: 'Phòng Sản Phẩm (Product)',
    description: 'Phân tích nhu cầu người dùng, lên kế hoạch và định hướng phát triển sản phẩm',
  },
  { name: 'Phòng Kiểm Thử (QA/QC)', description: 'Đảm bảo chất lượng phần mềm thông qua kiểm thử và đánh giá sản phẩm' },
  { name: 'Phòng Hạ Tầng (DevOps/IT)', description: 'Quản lý hạ tầng hệ thống, CI/CD và hỗ trợ kỹ thuật nội bộ' },
  { name: 'Phòng Thiết Kế (UI/UX)', description: 'Thiết kế giao diện người dùng và trải nghiệm người dùng cho sản phẩm' },
  { name: 'Phòng Marketing', description: 'Chiến lược marketing, truyền thông và phát triển thương hiệu số' },
  { name: 'Phòng Pháp Chế', description: 'Hỗ trợ pháp lý, hợp đồng, và đảm bảo tuân thủ các quy định' },
  { name: 'Phòng Nghiên Cứu & Phát Triển (R&D)', description: 'Nghiên cứu công nghệ mới và thử nghiệm giải pháp sáng tạo' },
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
