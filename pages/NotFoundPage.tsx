
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <img src="https://picsum.photos/seed/404page/400/300" alt="Lost Gavel" className="w-64 h-auto mb-8 rounded-lg shadow-lg"/>
      <h1 className="text-6xl font-bold text-primary-dark">404</h1>
      <p className="text-xl text-gray-600 mt-4 mb-8">
        عذرًا، الصفحة التي تبحث عنها غير موجودة.
      </p>
      <Button variant="primary" size="lg">
        <Link to="/dashboard">العودة إلى لوحة التحكم</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
