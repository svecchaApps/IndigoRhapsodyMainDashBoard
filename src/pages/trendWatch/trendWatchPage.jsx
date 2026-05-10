import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
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
  Upload,
  Input,
  Spin,
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
  ReloadOutlined,
  UploadOutlined,
  PictureOutlined,
  LoadingOutlined,
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
import { uploadImageToFirebase } from "../../service/FirebaseService";

const { Title, Text } = Typography;

// ── Reusable single-image uploader ─────────────────────────────────────────
function ImageUploader({ value, onChange, label, folder = "trend-watch" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");

  // Keep local preview in sync when parent resets (e.g. modal close)
  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  const handleBeforeUpload = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Only image files are allowed.");
      return Upload.LIST_IGNORE;
    }
    try {
      setUploading(true);
      const url = await uploadImageToFirebase(file, folder);
      setPreview(url);
      onChange?.(url);
      message.success("Image uploaded!");
    } catch (err) {
      message.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
    // Prevent antd's default upload behaviour
    return false;
  };

  const handleRemove = () => {
    setPreview("");
    onChange?.("");
  };

  return (
    <div>
      <Upload
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleBeforeUpload}
        accept="image/*"
        disabled={uploading}
      >
        {preview ? (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <img
              src={preview}
              alt={label}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }}
            />
            {uploading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                }}
              >
                <Spin indicator={<LoadingOutlined spin />} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 8 }}>
            {uploading ? (
              <Spin indicator={<LoadingOutlined spin />} />
            ) : (
              <>
                <UploadOutlined style={{ fontSize: 22, color: "#1890ff" }} />
                <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{label}</div>
              </>
            )}
          </div>
        )}
      </Upload>

      {preview && (
        <Button
          size="small"
          danger
          style={{ marginTop: 4 }}
          onClick={handleRemove}
          disabled={uploading}
        >
          Remove
        </Button>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function TrendWatchPage() {
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [saving, setSaving] = useState(false);

  // Image state — managed outside the form so uploads are immediate
  const [bigImage, setBigImage] = useState("");
  const [smallImages, setSmallImages] = useState(["", "", "", ""]);

  const [form] = Form.useForm();

  // ── fetch ─────────────────────────────────────────────────────────────────
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
    if (products.length > 0) return;
    try {
      setProductsLoading(true);
      const data = await getAllProducts();
      setProducts(data?.data?.products || []);
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

  // ── stats ─────────────────────────────────────────────────────────────────
  const totalGroups = groups.length;
  const activeGroups = groups.filter((g) => g.isActive).length;
  const totalProducts = groups.reduce((s, g) => s + (g.products?.length || 0), 0);

  // ── open modal ────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingGroup(null);
    setBigImage("");
    setSmallImages(["", "", "", ""]);
    form.resetFields();
    form.setFieldsValue({ isActive: true, displayOrder: 0 });
    setModalOpen(true);
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setBigImage(group.bigImage || "");
    const imgs = [...(group.smallImages || []), "", "", "", ""].slice(0, 4);
    setSmallImages(imgs);
    form.setFieldsValue({
      label: group.label,
      products: (group.products || []).map((p) => p._id || p),
      completeLookProducts: (group.completeLookProducts || []).map((p) => p._id || p),
      displayOrder: group.displayOrder ?? 0,
      isActive: group.isActive,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    form.resetFields();
    setBigImage("");
    setSmallImages(["", "", "", ""]);
    setEditingGroup(null);
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (!bigImage) {
        message.error("Please upload a hero image.");
        return;
      }

      const payload = {
        label: values.label,
        bigImage,
        smallImages: smallImages.filter(Boolean),
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
      closeModal();
      fetchGroups();
    } catch (err) {
      if (err.errorFields) return;
      message.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── toggle ────────────────────────────────────────────────────────────────
  const handleToggle = async (group) => {
    try {
      await toggleTrendGroup(group._id);
      message.success(`Group ${group.isActive ? "deactivated" : "activated"}`);
      fetchGroups();
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteTrendGroup(id);
      message.success("Trend group deleted");
      fetchGroups();
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Order",
      dataIndex: "displayOrder",
      width: 70,
      sorter: (a, b) => a.displayOrder - b.displayOrder,
      render: (v) => <Text type="secondary">{v}</Text>,
    },
    {
      title: "Trend Group",
      dataIndex: "label",
      render: (label, record) => (
        <Space>
          {record.bigImage ? (
            <Image
              src={record.bigImage}
              width={52}
              height={52}
              style={{ objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
              preview={{ mask: <EyeOutlined /> }}
            />
          ) : (
            <div
              style={{
                width: 52, height: 52, borderRadius: 8,
                background: "#f0f0f0", display: "flex",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <PictureOutlined style={{ color: "#bbb" }} />
            </div>
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
          {(imgs || []).filter(Boolean).slice(0, 4).map((src, i) => (
            <Image
              key={i}
              src={src}
              width={34}
              height={34}
              style={{ objectFit: "cover", borderRadius: 5 }}
              preview={{ mask: false }}
            />
          ))}
          {!(imgs || []).filter(Boolean).length && (
            <Text type="secondary" style={{ fontSize: 12 }}>Auto from products</Text>
          )}
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
              {p.productName ? p.productName.slice(0, 20) : p}
            </Tag>
          ))}
          {!(prods || []).length && <Text type="secondary">None</Text>}
        </Space>
      ),
    },
    {
      title: "Complete Look",
      dataIndex: "completeLookProducts",
      width: 110,
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
            <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
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

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <TrendWatchWrap>
      {/* Header */}
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
        onCancel={closeModal}
        okText={editingGroup ? "Save Changes" : "Create"}
        confirmLoading={saving}
        width={780}
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

          {/* Hero image upload */}
          <Form.Item
            label={
              <span>
                Hero Image{" "}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                  (big portrait shown on homepage card)
                </Text>
              </span>
            }
          >
            <ImageUploader
              value={bigImage}
              onChange={setBigImage}
              label="Upload hero image"
              folder="trend-watch/hero"
            />
            {!bigImage && saving && (
              <Text type="danger" style={{ fontSize: 12 }}>
                Hero image is required
              </Text>
            )}
          </Form.Item>

          <Divider style={{ margin: "4px 0 16px" }} />

          {/* Small style images */}
          <Form.Item
            label={
              <span>
                Style Images{" "}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                  (up to 4 — shown in the 2×2 grid; leave empty to auto-use product photos)
                </Text>
              </span>
            }
          >
            <Row gutter={12}>
              {smallImages.map((url, idx) => (
                <Col key={idx} span={6}>
                  <ImageUploader
                    value={url}
                    onChange={(newUrl) => {
                      const updated = [...smallImages];
                      updated[idx] = newUrl;
                      setSmallImages(updated);
                    }}
                    label={`Style ${idx + 1}`}
                    folder="trend-watch/style"
                  />
                </Col>
              ))}
            </Row>
          </Form.Item>

          <Divider style={{ margin: "4px 0 16px" }} />

          {/* Curated products */}
          <Form.Item
            name="products"
            label={
              <span>
                Curated Products{" "}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                  (3–4 products — shown when user clicks the trend card)
                </Text>
              </span>
            }
            rules={[
              { required: true, message: "Select at least 1 product" },
              {
                validator: (_, value) =>
                  !value || value.length <= 4
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
              options={products.map((p) => ({ value: p._id, label: p.productName }))}
            />
          </Form.Item>

          {/* Complete the Look products */}
          <Form.Item
            name="completeLookProducts"
            label={
              <span>
                Complete the Look Products{" "}
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
                  (shown as outfit pairings on the detail page)
                </Text>
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Search and select additional products…"
              loading={productsLoading}
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              options={products.map((p) => ({ value: p._id, label: p.productName }))}
            />
          </Form.Item>

          <Divider style={{ margin: "4px 0 16px" }} />

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
