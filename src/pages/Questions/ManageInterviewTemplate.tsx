import React from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import AdminTemplateManagement from './AdminTemplateManagement';
import CompanyTemplateManagement from './CompanyTemplateManagement';

const ManageInterviewTemplate: React.FC = () => {
    return (
        <>
            <PageMeta title="Interview Session Management" description="Manage interview templates in the system" />
            <PageBreadcrumb pageTitle="Interview Template" />
            <AdminTemplateManagement onAddTemplate={() => { }} />
            <CompanyTemplateManagement />
        </>
    );
};

export default ManageInterviewTemplate;