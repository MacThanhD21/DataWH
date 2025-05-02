# Data Warehouse Analytics System

Hệ thống phân tích dữ liệu Data Warehouse với giao diện trực quan và hiệu suất cao.

## 🚀 Công nghệ sử dụng

### Front-end
- **Next.js 14**: Framework React hiện đại với Server Components
- **Shadcn/ui**: Component library đẹp mắt và tùy chỉnh cao
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client cho API calls
- **Recharts**: Thư viện vẽ biểu đồ chuyên nghiệp

### Back-end
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **node-adodb**: Kết nối và truy vấn SQL Server
- **CORS**: Xử lý cross-origin requests

## 🛠 Cấu trúc dự án

```
BTL_DataWarehouse-main/
├── front-end/           # Next.js application
│   ├── src/
│   │   ├── app/        # App router
│   │   ├── components/ # UI components
│   │   └── config/     # Configuration files
│   └── public/         # Static assets
│
└── back-end/           # Express.js server
    ├── src/
    │   ├── routes/     # API routes
    │   ├── services/   # Business logic
    │   └── config/     # Configuration files
    └── public/         # Static files
```

## 🚀 Cách chạy dự án

### Yêu cầu hệ thống
- Node.js >= 18.0.0
- SQL Server
- Git

### Cài đặt và chạy

1. **Clone repository**
```bash
git clone [repository-url]
cd BTL_DataWarehouse-main
```

2. **Cài đặt Front-end**
```bash
cd front-end
npm install
npm run dev
```
Front-end sẽ chạy tại: http://localhost:3000

3. **Cài đặt Back-end**
```bash
cd back-end
npm install
npm run dev
```
Back-end sẽ chạy tại: http://localhost:8000

## 📊 Tính năng chính

### Front-end
- Dashboard với biểu đồ trực quan
- Bảng dữ liệu với tính năng lọc và sắp xếp
- Giao diện responsive và hiện đại
- Loading states và error handling

### Back-end
- API endpoints cho Data Warehouse
- Kết nối và truy vấn SQL Server
- Xử lý dữ liệu và aggregation
- CORS và security

## 🔒 Bảo mật

- CORS được cấu hình để chỉ cho phép requests từ front-end
- Environment variables được sử dụng cho các thông tin nhạy cảm
- Input validation và error handling

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Contributors

- [MacThanhD21] - Developer
