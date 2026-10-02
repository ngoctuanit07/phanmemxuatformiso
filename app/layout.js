import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import BootstrapClient from '../components/BootstrapClient';
import AppLayout from '../components/AppLayout';

export const metadata = {
  title: 'Phần Mềm Xuất Form Theo Mẫu ISO & In Ấn Local',
  description: 'Xuất form theo mẫu Word có sẵn, lưu cơ sở dữ liệu và in trực tiếp ra máy in local',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <BootstrapClient />
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
