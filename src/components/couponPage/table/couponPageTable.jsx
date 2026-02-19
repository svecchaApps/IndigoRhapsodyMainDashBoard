import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
  Tag,
  InputNumber,
  Spin,
} from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import { GetCoupons, SearchUsers, DeleteCoupon, CreateCoupon, ApplyCoupon } from "../../../service/couponApi";
import { apiCall } from "../../../service/apiUtils";

const { Option } = Select;

const CouponPageTable = () => {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPromoModalVisible, setIsPromoModalVisible] = useState(false);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("code"); // 'code', 'amount', or 'type'
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCoupons(coupons);
      return;
    }

    const filtered = coupons.filter((coupon) => {
      switch (searchType) {
        case "code":
          return coupon.couponCode
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        case "amount":
          return coupon.couponAmount.toString().includes(searchTerm);
        case "type":
          const type = coupon.created_for ? "user-specific" : "promotion";
          return type.includes(searchTerm.toLowerCase());
        default:
          return true;
      }
    });
    setFilteredCoupons(filtered);
  }, [searchTerm, searchType, coupons]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await GetCoupons();
      // API returns { message: "...", data: [...] }
      const couponsData = response.data || [];
      setCoupons(couponsData);
      setFilteredCoupons(couponsData);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      message.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await DeleteCoupon(couponId);
      setCoupons(coupons.filter((coupon) => coupon._id !== couponId));
      message.success("Coupon deleted successfully");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      message.error("Failed to delete coupon");
    }
  };

  const handleAddPromoCoupon = async (values) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate.toISOString(),
      };

      const newCoupon = await apiCall("/coupon/createCouponForPromotion", {
        method: "POST",
        body: JSON.stringify(formattedValues),
      });

      setCoupons([...coupons, newCoupon]);
      message.success("Promotion coupon created successfully");
      form.resetFields();
      setIsPromoModalVisible(false);
    } catch (error) {
      console.error("Error creating promotion coupon", error);
      message.error(error.message || "Error creating promotion coupon");
    }
  };

  const handleAddUserCoupon = async (values) => {
    try {
      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate.toISOString(),
        userId: values.userId,
      };

      const newCoupon = await apiCall("/coupon/particularUser", {
        method: "POST",
        body: JSON.stringify(formattedValues),
      });

      setCoupons([...coupons, newCoupon]);
      message.success("User-specific coupon created successfully");
      userForm.resetFields();
      setIsUserModalVisible(false);
    } catch (error) {
      console.error("Error creating user coupon", error);
      message.error(error.message || "Error creating user coupon");
    }
  };

  const handleUserSearch = async (searchText) => {
    if (!searchText) {
      setUserOptions([]);
      return;
    }

    try {
      setUserSearchLoading(true);
      const response = await SearchUsers(searchText);
      setUserOptions(response.data || []);
    } catch (error) {
      console.error("Error searching users:", error);
      message.error("Error searching users");
    } finally {
      setUserSearchLoading(false);
    }
  };

  const disablePastDates = (current) => {
    return current && current < moment().startOf("day");
  };

  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      key: "couponCode",
      sorter: (a, b) => a.couponCode.localeCompare(b.couponCode),
    },
    {
      title: "Amount",
      dataIndex: "couponAmount",
      key: "couponAmount",
      sorter: (a, b) => a.couponAmount - b.couponAmount,
    },
    {
      title: "Type",
      dataIndex: "created_for",
      key: "type",
      render: (created_for) => (
        <Tag color={created_for ? "blue" : "green"}>
          {created_for ? "User-specific" : "Promotion"}
        </Tag>
      ),
      sorter: (a, b) => (a.created_for ? 1 : -1) - (b.created_for ? 1 : -1),
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active) => (
        <Tag color={is_active ? "green" : "volcano"}>
          {is_active ? "Active" : "Inactive"}
        </Tag>
      ),
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => moment(date).format("YYYY-MM-DD"),
      sorter: (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button danger onClick={() => handleDeleteCoupon(record._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder={`Search by ${searchType}`}
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            style={{ width: "100%" }}
            value={searchType}
            onChange={setSearchType}
          >
            <Option value="code">Search by Code</Option>
            <Option value="amount">Search by Amount</Option>
            <Option value="type">Search by Type</Option>
          </Select>
        </Space>
      </div>

      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Space>
          <Button type="primary" onClick={() => setIsPromoModalVisible(true)}>
            Create Promotion Coupon
          </Button>
          <Button type="primary" onClick={() => setIsUserModalVisible(true)}>
            Create User Coupon
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredCoupons}
        rowKey="_id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} coupons`,
          pageSizeOptions: ['5', '10', '20', '50'],
          size: 'default',
          position: ['bottomRight'],
          showLessItems: false,
          hideOnSinglePage: false,
          responsive: true
        }}
        bordered
      />

      {/* Modal for Promotion Coupon */}
      <Modal
        title="Create Promotion Coupon"
        visible={isPromoModalVisible}
        onCancel={() => setIsPromoModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddPromoCoupon} layout="vertical">
          <Form.Item
            label="Coupon Code"
            name="couponCode"
            rules={[{ required: true, message: "Please enter coupon code" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="couponAmount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                validator: (_, value) =>
                  value >= 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Amount cannot be negative")),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Max Usage"
            name="maxUsage"
            rules={[
              { required: true, message: "Please enter max usage count" },
              {
                validator: (_, value) =>
                  value > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Must be at least 1")),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Expiry Date"
            name="expiryDate"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={disablePastDates}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Create Promotion Coupon
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for User-specific Coupon */}
      <Modal
        title="Create User-specific Coupon"
        visible={isUserModalVisible}
        onCancel={() => setIsUserModalVisible(false)}
        footer={null}
      >
        <Form form={userForm} onFinish={handleAddUserCoupon} layout="vertical">
          <Form.Item
            label="Search User"
            name="userId"
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              showSearch
              placeholder="Search user by name or email"
              defaultActiveFirstOption={false}
              showArrow={false}
              filterOption={false}
              onSearch={handleUserSearch}
              notFoundContent={null}
              loading={userSearchLoading}
            >
              {userOptions.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Coupon Code"
            name="couponCode"
            rules={[{ required: true, message: "Please enter coupon code" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Amount"
            name="couponAmount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                validator: (_, value) =>
                  value >= 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Amount cannot be negative")),
              },
            ]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Expiry Date"
            name="expiryDate"
            rules={[{ required: true, message: "Please select expiry date" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              disabledDate={disablePastDates}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Create User Coupon
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default CouponPageTable;
