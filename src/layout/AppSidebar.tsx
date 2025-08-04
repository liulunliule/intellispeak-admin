import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  AISettingsIcon,
  BoxCubeIcon,
  // CalenderIcon,
  ChevronDownIcon,
  FeedbackIcon,
  GridIcon,
  HorizontaLDots,
  // ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  // TableIcon,
  UserCircleIcon,
  ForumIcon,
  InterviewIcon,
  ManageHRIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
import { logo, squarelogo, intellispeakdark, intellispeaklight } from "../assets";


type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Bảng điều khiển",
    path: "/dashboard",
    // subItems: [{ name: "Thương mại điện tử", path:  "/dashboard", pro: false }],
  },
  // {
  //   icon: <CalenderIcon />,
  //   name: "Lịch",
  //   path: "/calendar",
  // },
  {
    icon: <UserCircleIcon />,
    name: "Hồ sơ người dùng",
    subItems: [
      { name: "Hồ sơ", path: "/profile", pro: false },
      { name: "Quản lý người dùng", path: "/manage_user", pro: false },
    ],
  },
  {
    name: "Quản lý nhân sự",
    icon: <ManageHRIcon />, // Now using the custom HR icon
    path: "/manage-hr",
  },
  // {
  //   name: "Biểu mẫu",
  //   icon: <ListIcon />,
  //   subItems: [{ name: "Phần tử biểu mẫu", path: "/form-elements", pro: false }],
  // },
  {
    name: "Phỏng vấn",
    icon: <InterviewIcon />,
    subItems: [
      { name: "Quản lí câu hỏi", path: "/questions", pro: false },
      { name: "Quản lí tag", path: "/manage-tags", pro: false },
      { name: "Quản lí phỏng vấn session", path: "/manage-interview-sessions", pro: false },
      { name: "Quản lý chủ đề", path: "/manage-topics", pro: false },
    ],
  },
  {
    name: "Quản lý diễn đàn",
    icon: <ForumIcon />,
    path: "/manage-forum",
  },
  {
    name: "Phản hồi",
    icon: <FeedbackIcon />,
    subItems: [
      { name: "Phản hồi người dùng", path: "/feedback", pro: false },
      { name: "Báo cáo hệ thống", path: "/reports", pro: false, new: true },
    ],
  },

  {
    name: "Quản lý gói",
    icon: <BoxCubeIcon />,
    path: "/manage-package",
  },
  {
    name: "Cài đặt AI",
    icon: <AISettingsIcon />,
    subItems: [
      { name: "Cấu hình mô hình", path: "/ai/config", pro: false },
      { name: "Quản lý API", path: "/ai/api", pro: false },
      { name: "Chỉ số hiệu suất", path: "/ai/metrics", pro: false },
    ],
  },
  // {
  //   name: "Bảng",
  //   icon: <TableIcon />,
  //   subItems: [{ name: "Bảng cơ bản", path: "/basic-tables", pro: false }],
  // },
  {
    name: "Trang",
    icon: <PageIcon />,
    subItems: [
      { name: "Trang trống", path: "/blank", pro: false },
      { name: "Lỗi 404", path: "/error-404", pro: false },
    ],
  },
];

const othersItems: NavItem[] = [
  {
    icon: <PieChartIcon />,
    name: "Biểu đồ",
    subItems: [
      { name: "Biểu đồ đường", path: "/line-chart", pro: false },
      { name: "Biểu đồ cột", path: "/bar-chart", pro: false },
    ],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Thành phần UI",
    subItems: [
      { name: "Cảnh báo", path: "/alerts", pro: false },
      { name: "Ảnh đại diện", path: "/avatars", pro: false },
      { name: "Huy hiệu", path: "/badge", pro: false },
      { name: "Nút bấm", path: "/buttons", pro: false },
      { name: "Hình ảnh", path: "/images", pro: false },
      { name: "Video", path: "/videos", pro: false },
    ],
  },
  {
    icon: <PlugInIcon />,
    name: "Xác thực",
    subItems: [
      { name: "Đăng nhập", path: "/", pro: false },
      { name: "Đăng ký", path: "/signup", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [showBothLogos, setShowBothLogos] = useState(false);
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            mới
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}
      >
        {isExpanded || isHovered || isMobileOpen ? (
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src={squarelogo}
              alt="Logo"
              style={{ height: 40, width: 40 }}
            />
            <img
              src={intellispeaklight}
              alt="Intellispeak Logo"
              style={{ height: 40, width: 'auto' }}
              className="dark:hidden"
            />
            <img
              src={intellispeakdark}
              alt="Intellispeak Logo"
              style={{ height: 40, width: 'auto' }}
              className="hidden dark:inline"
            />
          </Link>
        ) : (
          <button
            type="button"
            className="flex items-center gap-2 focus:outline-none"
            onClick={() => setShowBothLogos((prev) => !prev)}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <img
              src={squarelogo}
              alt="Logo"
              style={{ height: 32, width: 32 }}
            />
            {showBothLogos && (
              <>
                <img
                  src={intellispeaklight}
                  alt="Intellispeak Logo"
                  style={{ height: 32, width: 'auto' }}
                  className="dark:hidden"
                />
                <img
                  src={intellispeakdark}
                  alt="Intellispeak Logo"
                  style={{ height: 32, width: 'auto' }}
                  className="hidden dark:inline"
                />
              </>
            )}
          </button>
        )}
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Khác"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;