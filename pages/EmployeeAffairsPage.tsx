import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import { UsersIcon, CalculatorIcon, CalendarDaysIcon, UserCircleIcon, CurrencyDollarIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, GavelIcon } from '../constants';
import Button from '../components/ui/Button';

interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
  status?: 'active' | 'developing';
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, linkTo, icon, status = 'active' }) => (
  <Card title={title} className={`hover:shadow-xl transition-shadow duration-300 flex flex-col ${status === 'developing' ? 'bg-gray-50 opacity-70' : 'bg-white dark:bg-dm-card'}`}>
    <div className="flex flex-col items-center text-center p-4 flex-grow">
      <div className={`mb-4 ${status === 'developing' ? 'text-gray-400' : 'text-primary-light'}`}>{icon}</div>
      <p className={`text-sm mb-4 ${status === 'developing' ? 'text-gray-500' : 'text-gray-600 dark:text-dm-text-light'}`}>
        {description}
      </p>
    </div>
    <div className="p-4 text-center mt-auto">
      {status === 'active' ? (
        <Link to={linkTo}>
          <Button variant="primary" size="md">الذهاب إلى القسم</Button>
        </Link>
      ) : (
        <Button variant="secondary" size="md" disabled>قيد التطوير</Button>
      )}
    </div>
  </Card>
);


const EmployeeAffairsPage: React.FC = () => {
  const features: FeatureCardProps[] = [
    {
      title: 'ملفات الموظفين',
      description: 'إدارة شاملة لبيانات الموظفين، عقودهم، ومستنداتهم الرسمية.',
      linkTo: '/employee-affairs/profiles',
      icon: <UserCircleIcon className="w-16 h-16" />,
      status: 'active',
    },
    {
      title: 'احتساب نهاية الخدمة',
      description: 'حساب دقيق لمستحقات نهاية الخدمة وفقًا لقانون العمل الكويتي.',
      linkTo: '/employee-affairs/end-of-service',
      icon: <CalculatorIcon className="w-16 h-16" />,
      status: 'active',
    },
    {
      title: 'إدارة الإجازات',
      description: 'تتبع وإدارة أرصدة الإجازات، وطلبات الإجازات، وسياساتها.',
      linkTo: '/employee-affairs/leave-management',
      icon: <CalendarDaysIcon className="w-16 h-16" />,
      status: 'active',
    },
    {
      title: 'القروض والسلف',
      description: 'نظام لتسجيل ومتابعة قروض الموظفين وسلفهم المالية.',
      linkTo: '/employee-affairs/loans',
      icon: <CurrencyDollarIcon className="w-16 h-16" />,
      status: 'active', 
    },
    {
      title: 'الإجراءات التأديبية',
      description: 'توثيق ومتابعة المخالفات والإجراءات التأديبية المتخذة.',
      linkTo: '/employee-affairs/disciplinary',
      icon: <ExclamationTriangleIcon className="w-16 h-16" />,
      status: 'active', 
    },
    {
      title: 'التحقيقات الإدارية',
      description: 'إدارة متكاملة للتحقيقات الإدارية ومحاضرها.',
      linkTo: '/employee-affairs/investigations',
      icon: <GavelIcon className="w-16 h-16" />,
      status: 'active',
    },
    {
      title: 'طلبات الموظفين',
      description: 'إدارة مركزية لطلبات الموظفين المختلفة (شهادات، وثائق، إلخ).',
      linkTo: '/employee-affairs/requests',
      icon: <ChatBubbleLeftEllipsisIcon className="w-16 h-16" />,
      status: 'active', 
    },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <UsersIcon className="w-10 h-10 text-primary me-4" />
        <h1 className="text-3xl font-bold text-primary-dark">إدارة شؤون الموظفين الشاملة</h1>
      </div>
      
      <Card title="مقدمة حول إدارة شؤون الموظفين">
        <p className="text-gray-700 leading-relaxed">
          تم تصميم وحدة شؤون الموظفين في "قانوني برو" لتوفير مجموعة متكاملة من الأدوات لإدارة كافة الجوانب القانونية والإدارية المتعلقة بموظفي مؤسستك. 
          تهدف هذه الوحدة إلى ضمان الامتثال لأحكام <strong>قانون العمل الكويتي رقم 6 لسنة 2010 في القطاع الأهلي</strong> وتعديلاته، وتسهيل العمليات الإدارية، وحفظ حقوق كل من الموظفين والمؤسسة. 
          ستجد هنا أدوات لحساب مستحقات نهاية الخدمة بدقة، إدارة الإجازات بفعالية، الاحتفاظ بملفات الموظفين محدثة، وتتبع الطلبات والإجراءات المختلفة المتعلقة بهم.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => (
          <FeatureCard 
            key={feature.title}
            title={feature.title}
            description={feature.description}
            linkTo={feature.linkTo}
            icon={feature.icon}
            status={feature.status}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeAffairsPage;
