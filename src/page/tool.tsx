import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import {
  Alert,
  Button,
  Card,
  Form,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import {
  getFirebaseProjectId,
  getMissingFirebaseEnvVars,
  isFirebaseConfigured,
} from "../config/firebase";
import { LIST_ALL_BUSINESSES } from "../gql/businessManagement";
import {
  createTelegramLinkCode,
  listTelegramLinkCodesByBusiness,
  revokeTelegramLinkCode,
  TelegramLinkCode,
} from "../helper/telegramLink";
import type { ApolloResult, Business } from "../store";

type FormValues = {
  businessId: string;
  expiresInMinutes: number;
};

const projectId = getFirebaseProjectId();
const firebaseConfigured = isFirebaseConfigured();
const missingFirebaseEnvVars = getMissingFirebaseEnvVars();

const formatDateTime = (value?: number): string => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const getStatus = (
  record: TelegramLinkCode
): { label: string; color: "green" | "orange" | "red" | "default" } => {
  if (record.used) {
    return { label: "Used", color: "default" };
  }
  if (record.expiresAt <= Date.now()) {
    return { label: "Expired", color: "orange" };
  }
  return { label: "Active", color: "green" };
};

const copyText = async (text: string, successMsg: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    message.success(successMsg);
  } catch {
    message.error("Copy failed");
  }
};

const ToolPage: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TelegramLinkCode[]>([]);
  const [latestCode, setLatestCode] = useState<TelegramLinkCode | null>(null);

  const businessesQ = useQuery<ApolloResult<"listAllBusiness", Business[]>>(
    LIST_ALL_BUSINESSES,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const businesses = useMemo(
    () => (businessesQ.data?.listAllBusiness ?? []).filter((biz) => biz.isActive),
    [businessesQ.data]
  );

  const selectedBusinessId = Form.useWatch("businessId", form);

  const selectedBusiness = useMemo(
    () => businesses.find((biz) => biz.id === selectedBusinessId) ?? null,
    [businesses, selectedBusinessId]
  );

  const refresh = async (businessId?: string): Promise<void> => {
    if (!firebaseConfigured) {
      setRows([]);
      return;
    }
    const targetBusinessId = businessId ?? selectedBusinessId;
    if (!targetBusinessId) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await listTelegramLinkCodesByBusiness(targetBusinessId);
      setRows(data);
    } catch (error: unknown) {
      message.error(String(error) || "Failed to load link codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businesses.length === 0) return;
    if (!selectedBusinessId) {
      const initialBusinessId = businesses[0]?.id;
      if (initialBusinessId) {
        form.setFieldsValue({
          businessId: initialBusinessId,
          expiresInMinutes: 30,
        });
      }
    }
  }, [businesses, form, selectedBusinessId]);

  useEffect(() => {
    void refresh();
    // react-hooks/exhaustive-deps intentionally skipped to avoid refresh loop
    // when refresh reference changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBusinessId]);

  const onGenerate = async (values: FormValues): Promise<void> => {
    if (!firebaseConfigured) {
      message.error("Firebase configuration is missing.");
      return;
    }
    const business = businesses.find((biz) => biz.id === values.businessId);
    if (!business) {
      message.error("Select a valid business first");
      return;
    }

    setLoading(true);
    try {
      const created = await createTelegramLinkCode({
        businessId: business.id,
        businessName: business.name,
        expiresInMinutes: values.expiresInMinutes,
        createdBy: "admin_portal",
      });
      setLatestCode(created);
      message.success("Telegram link code created");
      await refresh(values.businessId);
    } catch (error: unknown) {
      message.error(String(error) || "Failed to create code");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (value: string) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: "Status",
      key: "status",
      render: (_: unknown, record: TelegramLinkCode) => {
        const status = getStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: "Expires",
      key: "expiresAt",
      render: (_: unknown, record: TelegramLinkCode) =>
        formatDateTime(record.expiresAt),
    },
    {
      title: "Used At",
      key: "usedAt",
      render: (_: unknown, record: TelegramLinkCode) => formatDateTime(record.usedAt),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: TelegramLinkCode) => {
        const command = `/link ${record.code}`;
        const status = getStatus(record);
        const canRevoke = status.label === "Active";
        return (
          <Space>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => void copyText(command, "Command copied")}
            >
              Copy
            </Button>
            {canRevoke ? (
              <Popconfirm
                title="Revoke this code?"
                onConfirm={async () => {
                  await revokeTelegramLinkCode(record.id);
                  message.success("Code revoked");
                  await refresh();
                }}
              >
                <Button size="small" danger>
                  Revoke
                </Button>
              </Popconfirm>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }} size={16}>
      <Alert
        type="info"
        showIcon
        message="Telegram Link Tool"
        description={
          <>
            <div>Create one-time codes for users to run in Telegram: /link &lt;code&gt;</div>
            <div>Firestore project: {projectId}</div>
          </>
        }
      />
      {!firebaseConfigured ? (
        <Alert
          type="error"
          showIcon
          message="Firebase env is not configured for this build"
          description={`Missing: ${missingFirebaseEnvVars.join(", ")}`}
        />
      ) : null}

      <Card title="Generate Link Code">
        <Form<FormValues>
          form={form}
          layout="inline"
          initialValues={{ expiresInMinutes: 30 }}
          onFinish={(values) => void onGenerate(values)}
        >
          <Form.Item
            label="Business"
            name="businessId"
            rules={[{ required: true, message: "Business is required" }]}
          >
            <Select
              style={{ width: 360 }}
              placeholder="Select business"
              options={businesses.map((biz) => ({
                value: biz.id,
                label: `${biz.name} (${biz.id})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Expires (minutes)"
            name="expiresInMinutes"
            rules={[{ required: true, message: "Expiry is required" }]}
          >
            <InputNumber min={1} max={1440} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!firebaseConfigured}
            >
              Generate
            </Button>
          </Form.Item>
          <Form.Item>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void refresh()}
              loading={loading}
              disabled={!firebaseConfigured}
            >
              Refresh
            </Button>
          </Form.Item>
        </Form>

        {latestCode ? (
          <Card style={{ marginTop: 16 }} type="inner" title="Latest Code">
            <Space direction="vertical">
              <Typography.Text>
                Business: <Typography.Text strong>{latestCode.businessName}</Typography.Text>
              </Typography.Text>
              <Typography.Text>
                Code: <Typography.Text code>{latestCode.code}</Typography.Text>
              </Typography.Text>
              <Typography.Text>
                Telegram command: <Typography.Text code>{`/link ${latestCode.code}`}</Typography.Text>
              </Typography.Text>
              <Typography.Text>Expires: {formatDateTime(latestCode.expiresAt)}</Typography.Text>
              <Space>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => void copyText(latestCode.code, "Code copied")}
                >
                  Copy Code
                </Button>
                <Button
                  icon={<CopyOutlined />}
                  onClick={() =>
                    void copyText(`/link ${latestCode.code}`, "Command copied")
                  }
                >
                  Copy /link Command
                </Button>
              </Space>
            </Space>
          </Card>
        ) : null}
      </Card>

      <Card
        title={`Codes for ${selectedBusiness ? selectedBusiness.name : "selected business"}`}
      >
        <Table<TelegramLinkCode>
          rowKey="id"
          loading={loading && firebaseConfigured}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </Space>
  );
};

export default ToolPage;
