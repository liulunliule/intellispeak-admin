import React, { useState } from 'react';
import { useModal } from '../../hooks/useModal';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import Input from '../form/input/InputField';
import Label from '../form/Label';
import api from '../../services/api';

interface UserProfile {
  firstName: string | null;
  lastName: string | null;
  userName: string;
  bio: string | null;
  role: string;
  phone: string | null;
  email: string;
  avatar: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  facebook: string | null;
  youtube: string | null;
}

interface UserMetaCardProps {
  user: UserProfile;
  refetchProfile: () => Promise<void>;
}

const UserMetaCard: React.FC<UserMetaCardProps> = ({ user, refetchProfile }) => {
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    userName: user.userName || '',
    facebook: user.facebook || '',
    linkedin: user.linkedin || '',
    youtube: user.youtube || '',
    github: user.github || '',
    website: user.website || '',
  });
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      const payload = {
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        bio: user.bio || null,
        phone: user.phone || null,
        avatar: user.avatar || null,
        website: formData.website || null,
        github: formData.github || null,
        linkedin: formData.linkedin || null,
        facebook: formData.facebook || null,
        youtube: formData.youtube || null,
        userName: formData.userName || null,
      };
      const response = await api.put('/auth/profile', payload);
      if (response.data.code === 200) {
        await refetchProfile();
        closeModal();
        setError('');
      } else {
        setError(response.data.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={user.avatar || '/images/user/default.jpg'}
                alt="user avatar"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-gray-100 xl:text-left">
                {user.userName}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.bio || 'No bio yet'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ho Chi Minh City, Vietnam
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              {user.facebook && (
                <a
                  href={user.facebook}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.6666 11.2503H13.7499L14.5833 7.91699H11.6666V6.25033C11.6666 5.39251 11.6666 4.58366 13.3333 4.58366H14.5833V1.78374C14.3118 1.7477 13.2858 1.66699 12.2023 1.66699C9.94025 1.66699 8.33325 3.04771 8.33325 5.58342V7.91699H5.83325V11.2503H8.33325V18.3337H11.6666V11.2503Z"
                      fill=""
                    />
                  </svg>
                </a>
              )}
              {user.youtube && (
                <a
                  href={user.youtube}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 2.5C6.41667 2.5 3.66667 3.33333 2.08333 4.58333C0.833333 5.83333 0 7.91667 0 10C0 12.0833 0.833333 14.1667 2.08333 15.4167C3.66667 16.6667 6.41667 17.5 10 17.5C13.5833 17.5 16.3333 16.6667 17.9167 15.4167C19.1667 14.1667 20 12.0833 20 10C20 7.91667 19.1667 5.83333 17.9167 4.58333C16.3333 3.33333 13.5833 2.5 10 2.5ZM8.33333 13.3333V6.66667L13.3333 10L8.33333 13.3333Z"
                      fill=""
                    />
                  </svg>
                </a>
              )}
              {user.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.78381 4.16645C5.78351 4.84504 5.37181 5.45569 4.74286 5.71045C4.11391 5.96521 3.39331 5.81321 2.92083 5.32613C2.44836 4.83904 2.31837 4.11413 2.59216 3.49323C2.86596 2.87233 3.48886 2.47942 4.16715 2.49978C5.06804 2.52682 5.78422 3.26515 5.78381 4.16645ZM5.83381 7.06645H2.50048V17.4998H5.83381V7.06645ZM11.1005 7.06645H7.78381V17.4998H11.0672V12.0248C11.0672 8.97475 15.0422 8.69142 15.0422 12.0248V17.4998H18.3338V10.8914C18.3338 5.74978 12.4505 5.94145 11.0672 8.46642L11.1005 7.06645Z"
                      fill=""
                    />
                  </svg>
                </a>
              )}
              {user.github && (
                <a
                  href={user.github}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0C4.477 0 0 4.477 0 10C0 14.418 2.865 18.166 6.839 19.489C7.339 19.582 7.521 19.271 7.521 19.008C7.521 18.774 7.513 18.04 7.508 17.095C4.672 17.715 4.113 15.697 4.113 15.697C3.684 14.645 3.078 14.334 3.078 14.334C2.241 13.699 3.128 13.708 3.128 13.708C4.028 13.777 4.503 14.644 4.503 14.644C5.305 15.969 6.614 15.711 7.532 15.557C7.672 14.898 7.948 14.441 8.251 14.156C5.971 13.871 3.581 12.973 3.581 9.234C3.581 8.094 3.997 7.153 4.682 6.404C4.566 6.119 4.182 5.048 4.761 3.633C4.761 3.633 5.528 3.333 7.496 4.441C8.221 4.236 9.011 4.133 9.801 4.129C10.591 4.133 11.381 4.236 12.106 4.441C14.073 3.333 14.841 3.633 14.841 3.633C15.419 5.048 15.035 6.119 14.919 6.404C15.605 7.153 16.021 8.094 16.021 9.234C16.021 12.981 13.626 13.867 11.34 14.152C11.715 14.496 12.051 15.183 12.051 16.189C12.051 17.645 12.041 18.69 12.041 19.008C12.041 19.271 12.223 19.586 12.727 19.489C16.702 18.166 19.567 14.418 19.567 10C19.567 4.477 15.09 0 10 0Z"
                      fill=""
                    />
                  </svg>
                </a>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener"
                  className="flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM10 18C5.582 18 2 14.418 2 10C2 5.582 5.582 2 10 2C14.418 2 18 5.582 18 10C18 14.418 14.418 18 10 18ZM10 4C7.791 4 6 5.791 6 8C6 10.209 7.791 12 10 12C12.209 12 14 10.209 14 8C14 5.791 12.209 4 10 4Z"
                      fill=""
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your information to keep your profile up to date.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-gray-100 lg:mb-6">
                  Social Links
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label className="text-gray-800 dark:text-gray-100">Facebook</Label>
                    <Input
                      type="text"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      placeholder="Enter Facebook URL"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-100">YouTube</Label>
                    <Input
                      type="text"
                      value={formData.youtube}
                      onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                      placeholder="Enter YouTube URL"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-100">LinkedIn</Label>
                    <Input
                      type="text"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="Enter LinkedIn URL"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-100">GitHub</Label>
                    <Input
                      type="text"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      placeholder="Enter GitHub URL"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-800 dark:text-gray-100">Website</Label>
                    <Input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="Enter Website URL"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-gray-100 lg:mb-6">
                  Personal Information
                </h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label className="text-gray-800 dark:text-gray-100">Username</Label>
                    <Input
                      type="text"
                      value={formData.userName}
                      onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                      placeholder="Enter username"
                      className="text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-4 text-sm text-red-500 dark:text-red-400">
                  {error === 'Không thể cập nhật hồ sơ' || error === 'Không thể cập nhật hồ sơ. Vui lòng thử lại.' ? 'Unable to update profile. Please try again.' : error}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default UserMetaCard;