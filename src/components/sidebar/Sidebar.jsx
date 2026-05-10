import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { SidebarWrap } from "./Sidebar.styles";
import { NavLink } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { LiaProductHunt } from "react-icons/lia";
import { SiAltiumdesigner } from "react-icons/si";
import { PiUsersThree } from "react-icons/pi";
import { MdPayments } from "react-icons/md";
import { FaBorderAll } from "react-icons/fa";
import { TbCategoryPlus } from "react-icons/tb";
import { LiaVideoSolid } from "react-icons/lia";
import { PiSignOutLight } from "react-icons/pi";
import { SiContentful } from "react-icons/si";
import { MdOutlineTrendingUp } from "react-icons/md";
import { BsCartCheck } from "react-icons/bs";
import { logout } from "../../service/apiUtils";

function Sidebar() {
  const isSidebarOpen = useSelector((state) => state.isSidebarOpen);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout(); // Use our centralized logout function
  };

  return (
    <SidebarWrap className={`${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="brand-logo">
            {/* <img src={Images.Logo} alt="site brand logo" /> */}
          </span>
          <span className="brand-text">Indigo Rhapsody</span>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={() => dispatch(setSidebarClose())}
        ></button>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <ul className="menu-list">
            <li className="menu-item">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive ? "menu-link active" : "menu-link"
                }
              >
                <span className="menu-link-icon">
                  <RxDashboard style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">DashBoard</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/designers"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <SiAltiumdesigner style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Designers</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/products"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaProductHunt style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Products</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/orders"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <BsCartCheck style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Orders</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/users"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <PiUsersThree style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Users</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/payment"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <MdPayments style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Payments</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/coupon"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <FaBorderAll style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Coupons</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/category"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <TbCategoryPlus style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Categories</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/video"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaVideoSolid style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Videos</span>
              </NavLink>
            </li>{" "}
            <li className="menu-item">
              <NavLink
                to="/designer-requests"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaVideoSolid style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Update Requests</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/banner"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <SiContentful style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Content</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/trend-watch"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <MdOutlineTrendingUp style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Trend Watch</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/notification"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaVideoSolid style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Notifications</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/blogs"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaVideoSolid style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Blogs</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/manage-queries"
                activeClassName="active"
                className="menu-link"
              >
                <span className="menu-link-icon">
                  <LiaVideoSolid style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Queries</span>
              </NavLink>
            </li>
            <li className="menu-item">
              <button onClick={handleSignOut} className="menu-link">
                <span className="menu-link-icon">
                  <PiSignOutLight style={{ color: "black" }} />
                </span>
                <span className="menu-link-text">Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </SidebarWrap>
  );
}

export default Sidebar;
