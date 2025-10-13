import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { WrenchScrewdriverIcon, ClipboardDocumentListIcon, UserGroupIcon } from '../constants';
import Button from '../components/ui/Button';

const AdminToolsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <WrenchScrewdriverIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">الأدوات الإدارية</h1>
      </div>
      
      <Card title="نظرة عامة على الأدوات الإدارية">
        <p className="text-gray-700">
          مجموعة من الأدوات لدعم العمليات الإدارية في المكتب القانوني أو القسم القانوني، مثل إدارة المهام، جهات الاتصال، وغيرها.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="إدارة المهام" className="hover:shadow-lg transition-shadow">
            <div className="flex flex-col items-center text-center">
                <ClipboardDocumentListIcon className="w-16 h-16 text-primary-light mb-4"/>
                <p className="text-gray-600 mb-4">
                    تنظيم وتتبع المهام القانونية والإدارية، وتعيينها للموظفين، ومراقبة تقدمها.
                </p>
                <Link to="/admin-tools/tasks">
                    <Button variant="primary">الذهاب إلى إدارة المهام</Button>
                </Link>
            </div>
        </Card>

        <Card title="إدارة جهات الاتصال" className="hover:shadow-lg transition-shadow">
             <div className="flex flex-col items-center text-center">
                <UserGroupIcon className="w-16 h-16 text-primary-light mb-4"/>
                <p className="text-gray-600 mb-4">
                    نظام لإدارة معلومات العملاء، الخصوم، الشهود، والخبراء وغيرهم من جهات الاتصال الهامة.
                </p>
                <Link to="/admin-tools/contacts">
                    <Button variant="primary">الذهاب إلى جهات الاتصال</Button>
                </Link>
            </div>
        </Card>
      </div>

       <Card title="أدوات أخرى (قيد التطوير)">
        <ul className="list-disc list-inside text-gray-500">
            <li>تتبع الشؤون المالية للعملاء</li>
            <li>لوحة تقارير وتحليلات</li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminToolsPage;
