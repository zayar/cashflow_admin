import {
  CopyOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import React, { useMemo, useState } from "react";
import {
  CREATE_BUSINESS,
  GET_BUSINESS_ADMIN,
  LIST_ALL_BUSINESSES,
  TOGGLE_ACTIVE_BUSINESS,
} from "../gql/businessManagement";
import type { ApolloResult, Business } from "../store";

type BusinessDetails = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  companyId?: string;
  taxId?: string;
  fiscalYear?: string;
  reportBasis?: string;
  timezone?: string;
  migrationDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

const DEFAULT_TEMP_PASSWORD = "default123";
const DEFAULT_REPORT_BASIS = "Accrual";

const fiscalYears = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const countries = ["Myanmar", "Thailand", "Malaysia"];

function copy(text: string, successMsg: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => message.success(successMsg))
    .catch(() => message.error("Copy failed"));
}

function toISOStringOrUndefined(d?: Dayjs) {
  if (!d) return undefined;
  return d.toDate().toISOString();
}

function getBestApolloErrorMessage(err: any): string {
  // ApolloError.graphQLErrors
  const gqlMsg = err?.graphQLErrors?.[0]?.message;
  if (gqlMsg) return gqlMsg;

  // ApolloError.networkError (ServerError) may include a JSON body
  const result = err?.networkError?.result;
  if (typeof result === "string") return result;
  if (result?.error) return String(result.error);
  if (Array.isArray(result?.errors) && result.errors[0]?.message) return String(result.errors[0].message);

  return err?.message ?? "Request failed";
}

function statusTag(isActive?: boolean) {
  if (isActive === false) return <Tag color="red">Disabled</Tag>;
  return <Tag color="green">Active</Tag>;
}

const BusinessManagementPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "disabled">("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [createResult, setCreateResult] = useState<{
    businessId: string;
    ownerUsername: string;
    tempPassword: string;
  } | null>(null);

  const [detailBizId, setDetailBizId] = useState<string | null>(null);

  const [form] = Form.useForm<{
    // business
    name: string;
    email: string; // backend uses this as owner username too
    country?: string;
    city?: string;
    address?: string;
    fiscalYear?: string;
    migrationDate?: Dayjs;
    timezone?: string;
  }>();

  const listQ = useQuery<ApolloResult<"listAllBusiness", Business[]>>(LIST_ALL_BUSINESSES, {
    fetchPolicy: "cache-and-network",
  });

  const detailsQ = useQuery<ApolloResult<"getBusinessAdmin", BusinessDetails>>(GET_BUSINESS_ADMIN, {
    variables: detailBizId ? { id: detailBizId } : undefined,
    skip: !detailBizId,
  });

  const [createBusiness, createBusinessState] = useMutation<
    ApolloResult<"createBusiness", { id: string; email: string; name: string }>
  >(CREATE_BUSINESS);

  const [toggleActiveBusiness, toggleActiveState] = useMutation<
    ApolloResult<"toggleActiveBusiness", { id: string; isActive: boolean }>
  >(TOGGLE_ACTIVE_BUSINESS);

  const rows = useMemo(() => {
    const data = (listQ.data?.listAllBusiness ?? []).map((b) => ({ ...b, key: b.id }));
    const q = search.trim().toLowerCase();
    return data.filter((b) => {
      const matchesSearch =
        q === "" ||
        b.name?.toLowerCase().includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q);
      const matchesStatus =
        status === "all" ||
        (status === "active" && b.isActive) ||
        (status === "disabled" && !b.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [listQ.data, search, status]);

  const openCreate = () => {
    setCreateResult(null);
    setCreateStep(0);
    form.resetFields();
    form.setFieldsValue({
      country: countries[0],
      fiscalYear: "Apr",
      migrationDate: dayjs(),
      timezone: "Asia/Yangon",
    });
    setCreateOpen(true);
  };

  const closeCreate = () => {
    setCreateOpen(false);
    setCreateStep(0);
    setCreateResult(null);
  };

  const next = async () => {
    if (createStep === 0) {
      await form.validateFields(["name", "email", "country", "city", "address", "fiscalYear"]);
      setCreateStep(1);
      return;
    }
    if (createStep === 1) {
      // Owner step is informational right now (backend sets default password).
      setCreateStep(2);
      return;
    }
  };

  const back = () => setCreateStep((s) => Math.max(0, s - 1));

  const submitCreate = async () => {
    try {
      const v = await form.validateFields();
      if (!v.name) {
        message.error("Business name is required");
        return;
      }
      if (!v.email) {
        message.error("Owner login email is required");
        return;
      }
      const input: any = {
        name: v.name,
        email: v.email,
        country: v.country,
        city: v.city,
        address: v.address,
        fiscalYear: v.fiscalYear,
        reportBasis: DEFAULT_REPORT_BASIS,
        timezone: v.timezone,
        migrationDate: toISOStringOrUndefined(v.migrationDate),
      };

      const res = await createBusiness({ variables: { input } });
      const created = res.data?.createBusiness;
      if (!created?.id) return;

      // Backend behavior (current): CreateBusiness creates Owner role + first user:
      // - username/email = business.email
      // - password = "default123"
      setCreateResult({
        businessId: created.id,
        ownerUsername: v.email,
        tempPassword: DEFAULT_TEMP_PASSWORD,
      });
      message.success("Business created successfully");
      await listQ.refetch();
      setCreateStep(3);
    } catch (e: any) {
      message.error(getBestApolloErrorMessage(e));
    }
  };

  const columns = [
    {
      title: "Business Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "Business ID",
      dataIndex: "id",
      key: "id",
      width: 260,
      render: (id: string) => (
        <Space>
          <Typography.Text code>{id}</Typography.Text>
          <Button
            size="small"
            type="text"
            icon={<CopyOutlined />}
            onClick={() => copy(id, "Business ID copied")}
          />
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => statusTag(isActive),
    },
    {
      title: "Created",
      key: "createdAt",
      width: 150,
      render: () => <Typography.Text type="secondary">N/A</Typography.Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 260,
      render: (_: any, record: Business) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setDetailBizId(record.id)}
          >
            View
          </Button>
          <Button
            danger={record.isActive}
            icon={<StopOutlined />}
            loading={toggleActiveState.loading}
            onClick={async () => {
              await toggleActiveBusiness({
                variables: { id: record.id, isActive: !record.isActive },
              });
              await listQ.refetch();
            }}
          >
            {record.isActive ? "Disable" : "Enable"}
          </Button>
          <Button disabled title="Backend API not available yet">
            Reset password
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Business Management
        </Typography.Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => listQ.refetch()}
            loading={listQ.loading}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Create business
          </Button>
        </Space>
      </Flex>

      <Card>
        <Flex gap={12} wrap="wrap" justify="space-between">
          <Space wrap>
            <Input.Search
              placeholder="Search by name, email, or business id"
              allowClear
              style={{ width: 360, maxWidth: "100%" }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={status}
              style={{ width: 160 }}
              onChange={(v) => setStatus(v)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "disabled", label: "Disabled" },
              ]}
            />
          </Space>
          <Typography.Text type="secondary">
            {rows.length} businesses
          </Typography.Text>
        </Flex>
        <Divider style={{ margin: "16px 0" }} />

        {listQ.error && (
          <Alert type="error" message={listQ.error.message} showIcon />
        )}

        <Table
          size="middle"
          columns={columns as any}
          dataSource={rows}
          loading={listQ.loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Drawer
        title="Business details"
        width={560}
        open={!!detailBizId}
        onClose={() => setDetailBizId(null)}
      >
        {detailsQ.loading && <Typography.Text>Loading...</Typography.Text>}
        {detailsQ.error && (
          <Alert type="error" message={detailsQ.error.message} showIcon />
        )}
        {detailsQ.data?.getBusinessAdmin && (
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Business ID">
              <Space>
                <Typography.Text code>{detailsQ.data.getBusinessAdmin.id}</Typography.Text>
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    copy(detailsQ.data!.getBusinessAdmin.id, "Business ID copied")
                  }
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Name">{detailsQ.data.getBusinessAdmin.name}</Descriptions.Item>
            <Descriptions.Item label="Email">{detailsQ.data.getBusinessAdmin.email}</Descriptions.Item>
            <Descriptions.Item label="Status">{statusTag(detailsQ.data.getBusinessAdmin.isActive)}</Descriptions.Item>
            <Descriptions.Item label="Country">{detailsQ.data.getBusinessAdmin.country || "-"}</Descriptions.Item>
            <Descriptions.Item label="City">{detailsQ.data.getBusinessAdmin.city || "-"}</Descriptions.Item>
            <Descriptions.Item label="Address">{detailsQ.data.getBusinessAdmin.address || "-"}</Descriptions.Item>
            <Descriptions.Item label="Timezone">{detailsQ.data.getBusinessAdmin.timezone || "-"}</Descriptions.Item>
            <Descriptions.Item label="Fiscal year">{detailsQ.data.getBusinessAdmin.fiscalYear || "-"}</Descriptions.Item>
            <Descriptions.Item label="Created">{detailsQ.data.getBusinessAdmin.createdAt || "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      <Modal
        title="Create business"
        open={createOpen}
        onCancel={closeCreate}
        footer={null}
        destroyOnClose
        width={760}
      >
        <Steps
          current={createStep}
          items={[
            { title: "Business info" },
            { title: "Owner user" },
            { title: "Confirm" },
            { title: "Done" },
          ]}
          style={{ marginBottom: 24 }}
        />

        {createStep < 3 && (
          <Form
            layout="vertical"
            form={form}
            requiredMark="optional"
            initialValues={{
              country: countries[0],
              fiscalYear: "Apr",
              migrationDate: dayjs(),
              timezone: "Asia/Yangon",
            }}
          >
            {createStep === 0 && (
              <>
                <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
                  This will create the business and its default setup (currency, modules, branch, etc.).
                </Typography.Paragraph>
                <Form.Item
                  name="name"
                  label="Business name"
                  rules={[{ required: true, message: "Business name is required" }]}
                >
                  <Input placeholder="e.g. ACME Co., Ltd." />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Owner login email/username"
                  rules={[
                    { required: true, message: "Owner email is required" },
                    { type: "email", message: "Enter a valid email address" },
                  ]}
                >
                  <Input placeholder="owner@company.com" />
                </Form.Item>
                <Space size={12} wrap style={{ width: "100%" }}>
                  <Form.Item
                    name="fiscalYear"
                    label="Fiscal year"
                    rules={[{ required: true, message: "Fiscal year is required" }]}
                    style={{ width: 220 }}
                  >
                    <Select options={fiscalYears.map((v) => ({ value: v, label: v }))} />
                  </Form.Item>
                  <Form.Item
                    name="country"
                    label="Country"
                    rules={[{ required: true, message: "Country is required" }]}
                    style={{ width: 220 }}
                  >
                    <Select options={countries.map((v) => ({ value: v, label: v }))} />
                  </Form.Item>
                  <Form.Item
                    name="city"
                    label="City"
                    rules={[{ required: true, message: "City is required" }]}
                    style={{ width: 220 }}
                  >
                    <Input placeholder="City" />
                  </Form.Item>
                </Space>
                <Form.Item
                  name="address"
                  label="Address"
                  rules={[{ required: true, message: "Address is required" }]}
                >
                  <Input.TextArea rows={3} placeholder="Full address" />
                </Form.Item>
                <Form.Item name="timezone" label="Timezone">
                  <Input placeholder="Asia/Yangon" />
                </Form.Item>
                <Form.Item name="migrationDate" label="Migration date">
                  <DatePicker style={{ width: "100%" }} />
                  <Typography.Text type="secondary">
                    Backend accepts `migrationDate` (Time). We send ISO timestamp.
                  </Typography.Text>
                </Form.Item>
              </>
            )}

            {createStep === 1 && (
              <>
                <Typography.Paragraph style={{ marginTop: 0 }}>
                  The backend currently creates the first Owner user automatically from the business email.
                </Typography.Paragraph>
                <Alert
                  type="info"
                  showIcon
                  message="Current backend behavior"
                  description={
                    <div>
                      <div>
                        Owner username/email will be the <b>Owner login email</b> you entered.
                      </div>
                      <div>
                        Temporary password is currently fixed to <b>{DEFAULT_TEMP_PASSWORD}</b>.
                      </div>
                      <div>
                        If you want to set/generate a password from the admin UI, we need a backend API to override/reset the owner password after creation.
                      </div>
                    </div>
                  }
                  style={{ marginBottom: 16 }}
                />
                <Form.Item label="Owner username/email">
                  <Input value={form.getFieldValue("email")} readOnly />
                </Form.Item>
                <Form.Item label="Temporary password">
                  <Space>
                    <Input value={DEFAULT_TEMP_PASSWORD} readOnly style={{ width: 260 }} />
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copy(DEFAULT_TEMP_PASSWORD, "Password copied")}
                    >
                      Copy
                    </Button>
                  </Space>
                </Form.Item>
              </>
            )}

            {createStep === 2 && (
              <>
                <Typography.Paragraph style={{ marginTop: 0 }}>
                  Confirm and create the business.
                </Typography.Paragraph>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="Business name">{form.getFieldValue("name")}</Descriptions.Item>
                  <Descriptions.Item label="Owner login">{form.getFieldValue("email")}</Descriptions.Item>
                  <Descriptions.Item label="Fiscal year">{form.getFieldValue("fiscalYear")}</Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {[form.getFieldValue("city"), form.getFieldValue("country")].filter(Boolean).join(", ") || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">Active</Descriptions.Item>
                </Descriptions>
                {createBusinessState.error && (
                  <Alert
                    type="error"
                    showIcon
                    message={getBestApolloErrorMessage(createBusinessState.error)}
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            )}
          </Form>
        )}

        {createStep === 3 && createResult && (
          <>
            <Alert
              type="success"
              showIcon
              message="Business created"
              description="Copy the credentials below and share with the customer."
              style={{ marginBottom: 16 }}
            />
            <Card>
              <Descriptions bordered size="middle" column={1}>
                <Descriptions.Item label="Business ID">
                  <Space>
                    <Typography.Text code>{createResult.businessId}</Typography.Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copy(createResult.businessId, "Business ID copied")}
                    />
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Owner login">
                  <Space>
                    <Typography.Text>{createResult.ownerUsername}</Typography.Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copy(createResult.ownerUsername, "Login copied")}
                    />
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Temporary password">
                  <Space>
                    <Typography.Text strong>{createResult.tempPassword}</Typography.Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copy(createResult.tempPassword, "Password copied")}
                    />
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}

        <Divider style={{ margin: "16px 0" }} />
        <Flex justify="space-between">
          <Button onClick={closeCreate}>Close</Button>
          <Space>
            {createStep > 0 && createStep < 3 && <Button onClick={back}>Back</Button>}
            {createStep < 2 && <Button type="primary" onClick={next}>Next</Button>}
            {createStep === 2 && (
              <Button type="primary" onClick={submitCreate} loading={createBusinessState.loading}>
                Create
              </Button>
            )}
            {createStep === 3 && (
              <Button type="primary" onClick={closeCreate}>
                Done
              </Button>
            )}
          </Space>
        </Flex>
      </Modal>
    </Space>
  );
};

export default BusinessManagementPage;

