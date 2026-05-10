import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Space,
  Tag,
  Tooltip,
  Image,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Badge,
  Popconfirm,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FireOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { TrendWatchWrap } from "./trendWatchPage.styles";
import {
  getAllTrendGroups,
  createTrendGroup,
  updateTrendGroup,
  toggleTrendGroup,
  deleteTrendGroup,
} from "../../service/trendWatchApi";
import { getAllProducts } from "../../service/productApi";

const { Title, Text } = Typography;
const { Option } = Select;

// ── tiny preview for a URL string ─────────────────────────────────────────
function UrlPreview({ url }) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      style={{
        width: 40,
        height: 40,
        objectFit: "cover",
        borderRadius: 6,
        border: "1px solid #f0f0f0",
        flexShrink: 0,
      }}
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

export default function TrendWatchPage() {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving] = useState(false);
  const [smallImages, setSmallImages] = useState(["", "", "", ""]);
  const [previewImage, setPreviewImage] = useState("");

  const [form] = Form.useForm();

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTrendGroups();
      setGroups(data.groups || []);
    } catch (err) {
      message.error("Failed to load trend groups: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (products.length > 0) return; // already loaded
    try {
      setProductsLoading(true);
      const data = await getAllProducts();
      const list = data?.data?.products || [];
      setProducts(list);
    } catch (err) {
      message.warning("Could not load products: " + err.message);
    } finally {
      setProductsLoading(false);
    }
  }, [products.length]);

  useEffect(() => {
    fetchGroups();
    fetchProducts();
  }, [fetchGroups, fetchProducts]);

  // ── stats ────────────────────────────────────────────────────────────────
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.isActive).length;
  const totalProducts = groups.reduce((s, g) => s + (g.products?.length || 0), 0);

  // ── open modal ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingGroup(null);
    setSmallImages(["", "", "", ""]);
    setPreviewImage("");
    form.resetFields();
    form.setFieldsValue({ isActive: true, displayOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    const imgs = [...(group.smallImages || []), "", "", "", ""].slice(0, 4);
    setSmallImages(imgs);
    setPreviewImage(group.bigImage || "");
    form.setFieldsValue({
      label: group.label,
      bigImage: group.bigImage,
      products: (group.products || []).map((p) => p._id || p),
      completeLookProducts: (group.completeLookProducts || []).map((p) => p._id || p),
      displayOrder: group.displayOrder ?? 0,
      isActive: group.isActive,
    });
    setModalOpen(true);
  };

  // ── save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const cleanSmall = smallImages.filter(Boolean);
      const payload = {
        label: values.label,
        bigImage: values.bigImage,
        smallImages: cleanSmall,
        products: values.products || [],
        completeLookProducts: values.completeLookProducts || [],
        displayOrder: values.displayOrder ?? 0,
        isActive: values.isActive !== undefined ? values.isActive : true,
      };

      setSaving(true);
      if (editingGroup) {
        await updateTrendGroup(editingGroup._id, payload);
        message.success("Trend group updated!");
      } else {
        await createTrendGroup(payload);
        message.success("Trend group created!");
      }
      setModalOpen(false);
      fetchGroups();
    } catch (err) {
      if (err.errorFields) return; // validation error — antd handles display
      message.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── toggle ───────────────────────────────────────────────────────────────
  const handleToggle = async (group) => {
    try {
      await toggleTrendGroup(group._id);
      message.success(`Group ${group.isActive ? "deactivated" : "activated"}`);
      fetchGroups();
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteTrendGroup(id);
      message.success("Trend group deleted");
      fetchGroups();
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Order",
      dataIndex: "displayOrder",
      width: 70,
      sorter: (a, b) => a.displayOrder - b.displayOrder,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Label",
      dataIndex: "label",
      render: (label, record) => (
        <Space>
          {record.bigImage && (
            <Image
              src={record.bigImage}
              width={48}
              height={48}
              style={{ objectFit: "cover", borderRadius: 8 }}
              preview={{ mask: <EyeOutlined /> }}
            />
          )}
          <Text strong>{label}</Text>
        </Space>
      ),
    },
    {
      title: "Style Pics",
      dataIndex: "smallImages",
      render: (imgs) => (
        <Space size={4}>
          {(imgs || []).slice(0, 4).map((src, i) =>
            src ? (
              <Image
                key={i}
                src={src}
                width={32}
                height={32}
                style={{ objectFit: "cover", borderRadius: 4 }}
                preview={{ mask: false }}
              />
            ) : null
          )}
          {(!imgs || imgs.length === 0) && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: "Curated Products",
      dataIndex: "products",
      render: (prods) => (
        <Space size={[4, 4]} wrap>
          {(prods || []).slice(0, 4).map((p) => (
            <Tag key={p._id || p} color="blue" style={{ fontSize: 11 }}>
              {p.productName ? p.productName.slice(0, 18) : p}
            </Tag>
          ))}
          {(!prods || prods.length === 0) && <Text type="secondary">None</Text>}
        </Space>
      ),
    },
    {
      title: "Complete Look",
      dataIndex: "completeLookProducts",
      render: (prods) => (
        <Badge
          count={(prods || []).length}
          style={{ backgroundColor: "#722ed1" }}
          showZero
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (active) =>
        active ? (
          <Tag icon={<CheckCircleOutlined />} color="success">Active</Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">Inactive</Tag>
        ),
    },
    {
      title: "Actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Deactivate" : "Activate"}>
            <Button
              icon={record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              type={record.isActive ? "default" : "primary"}
              onClick={() => handleToggle(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this trend group?"
            description="This cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button icon={<DeleteOutlined />} size="small" danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <TrendWatchWrap>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <Title level={2} style={{ margin: 0, color: "#1a1a1a" }}>
            <FireOutlined style={{ marginRight: 10, color: "#fa541c" }} />
            Trend Watch
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Curate trend groups — each with 3–4 products and a "Complete the Look" set
          </Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchGroups} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Trend Group
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Total Groups"
              value={totalGroups}
              valueStyle={{ color: "#1890ff" }}
              prefix={<AppstoreOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Active Groups"
              value={activeGroups}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="Curated Products"
              value={totalProducts}
              valueStyle={{ color: "#722ed1" }}
              prefix={<FireOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card className="table-card">
        <Table
          dataSource={groups}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        title={
          <Space>
            <FireOutlined style={{ color: "#fa541c" }} />
            <span>{editingGroup ? "Edit Trend Group" : "New Trend Group"}</span>
          </Space>
        }
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingGroup ? "Save Changes" : "Create"}
        confirmLoading={saving}
        width={760}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* Label */}
          <Form.Item
            name="label"
            label="Trend Label"
            rules={[{ required: true, message: "Label is required" }]}
          >
            <Input placeholder='e.g. "Cloud Dancer"' maxLength={60} showCount />
          </Form.Item>

          {/* Big Image URL */}
          <Form.Item
            name="bigImage"
            label="Hero / Big Image URL"
            rules={[{ required: true, message: "Big image URL is required" }]}
          >
            <Input
              placeholder="https://…"
              onChange={(e) => setPreviewImage(e.target.value)}
            />
          </Form.Item>
          {previewImage && (
            <div style={{ marginBottom: 16, marginTop: -8 }}>
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  height: 120,
                  borderRadius: 8,
                  objectFit: "cover",
                  border: "1px solid #f0f0f0",
                }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* Small Images */}
          <Form.Item label="Style / Small Images (up to 4 URLs)">
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
              These appear in the 2×2 grid on the homepage. Leave empty to auto-use product cover images.
            </Text>
            {smallImages.map((url, idx) => (
              <div key={idx} className="image-url-row">
                <UrlPreview url={url} />
                <Input
                  placeholder={`Image ${idx + 1} URL`}
                  value={url}
                  onChange={(e) => {
                    const updated = [...smallImages];
                    updated[idx] = e.target.value;
                    setSmallImages(updated);
                  }}
                />
                {url && (
                  <Button
                    size="small"
                    icon={<MinusCircleOutlined />}
                    onClick={() => {
                      const updated = [...smallImages];
                      updated[idx] = "";
                      setSmallImages(updated);
                    }}
                  />
                )}
              </div>
            ))}
          </Form.Item>

          <Divider style={{ margin: "8px 0 16px" }} />

          {/* Products selector */}
          <Form.Item
            name="products"
            label="Curated Products (3–4 products)"
            rules={[
              { required: true, message: "Select at least 1 product" },
              {
                validator: (_, value) =>
                  value && value.length <= 4
                    ? Promise.resolve()
                    : Promise.reject(new Error("Maximum 4 products allowed")),
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Search and select products…"
              loading={productsLoading}
              showSearch
              optionFilterProp="label"
              maxTagCount={4}
              style={{ width: "100%" }}
              options={products.map((p) => ({
                value: p._id,
                label: p.productName,
              }))}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 16, marginTop: -12 }}>
            These are the main products showcased when a user clicks on the trend card.
          </Text>

          {/* Complete the Look selector */}
          <Form.Item
            name="completeLookProducts"
            label="Complete the Look Products"
          >
            <Select
              mode="multiple"
              placeholder="Search and select additional products…"
              loading={productsLoading}
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              options={products.map((p) => ({
                value: p._id,
                label: p.productName,
              }))}
            />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 16, marginTop: -12 }}>
            Shown in the "Complete the Look" section on the trend detail page to suggest outfit pairings.
          </Text>

          <Divider style={{ margin: "8px 0 16px" }} />

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="displayOrder" label="Display Order">
                <InputNumber min={0} max={999} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </TrendWatchWrap>
  );
}
