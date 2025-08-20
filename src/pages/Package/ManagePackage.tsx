import React from "react";
import AllPackage from "../../components/tables/TablePackage/AllPackage";
import PageMeta from "../../components/common/PageMeta";
// import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const ManagePackage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Quản lý Gói"
                description="Đây là trang quản lý gói"
            />
            <div className="space-y-6">
                <AllPackage />
            </div>
        </>
    );
};

export default ManagePackage;
