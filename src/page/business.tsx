import { CopyFilled, PlusCircleOutlined, ReloadOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Alert, Button, Card, Col, DatePicker, Form, Input, message, Modal, Radio, Row, Select, Space, Table, TableColumnsType, Tabs, Tag, Typography } from 'antd';
import React, { ReactNode, useState, useRef } from 'react';
import { list_business, register as registerQuery, registerVar } from "../gql/business";
import { ApolloResult, Business } from "../store";
import type { InputRef, TableColumnType } from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';
import { readDoc } from "../helper/fb";
import { createPitiPull, createPitiPush, createPitiSchedule, createPitiSetup } from "../api";

const { Option } = Select;

interface BusinessRegistrationProps {
  trigger: ReactNode;
}

interface PitiIntegratoinProps {
  trigger: ReactNode;
  data: Business
}


const countries: string[] = [
  "Myanmar",
  "Thailand",
  "Malaysia",
];
const fiscalYears: string[] = [
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
  "Dec"
]

type DataIndex = keyof Business;

const BusinessRegistrationForm: React.FC<BusinessRegistrationProps> = ({ trigger }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [form] = Form.useForm();

  const [register, { loading, error }] = useMutation<ApolloResult<"createBusiness", { id: string }>>(registerQuery)

  const showModal = () => {
    setIsVisible(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (values: any) => {
    const result = await register({ variables: registerVar(values) });
    if (result.data?.createBusiness) {
      message.success('Business Registration Successful!')
      form.resetFields();
      setIsVisible(false);
    }
  };

  return (
    <>
      {React.cloneElement(trigger as React.ReactElement, { onClick: showModal })}
      <Modal
        title="Business Registration"
        open={isVisible}
        onCancel={handleCancel}
        footer={null}
        centered
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            country: countries[0], // Default value for the country field
            fiscalYear: fiscalYears[3],

          }}
        >
          {/* Name Input */}
          <Form.Item
            name="name"
            label="Business Name"
            rules={[{ required: true, message: 'Please enter your business name!' }]}
          >
            <Input placeholder="Enter business name" />
          </Form.Item>

          {/* Email Input */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="fiscalYear"
            label="FiscalYear"
            rules={[{ required: true, message: 'Please select fiscalYear!' }]}
          >
            <Select placeholder="Select fiscalYear" defaultValue={fiscalYears[3]}>
              {fiscalYears.map(fs => (<Option key={fs} value={fs}>{fs}</Option>))}
            </Select>
          </Form.Item>
          {/* Country Select */}
          <Form.Item
            name="country"
            label="Country"
            rules={[{ required: true, message: 'Please select your country!' }]}
          >
            <Select placeholder="Select country" defaultValue={countries[0]}>
              {countries.map(country => (<Option key={country} value={country}>{country}</Option>))}
            </Select>
          </Form.Item>

          {/* City Input */}
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please enter your city!' }]}
          >
            <Input placeholder="Enter city" />
          </Form.Item>

          {/* Address Input */}
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please enter your address!' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter full address" />
          </Form.Item>
          <Form.Item
            name="migrationDate"
            label="Migration Date"
            rules={[{ required: true, message: 'Please select migration date!' }]}
          >
            <DatePicker placeholder="Select date" />
          </Form.Item>

          {error && <Alert
            description={error?.message}
            type="error"
            style={{ margin: 10 }}
          />
          }
          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Register
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

interface Schedule {
  status: string,
  intervalValue: string,
  intervalType: string,

}

const PitiIntegrationForm: React.FC<PitiIntegratoinProps> = ({ trigger, data }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [form] = Form.useForm();
  const [toFrom] = Form.useForm();
  const [fromForm] = Form.useForm();
  const [activeKeys, setKeys] = useState<string[]>(['1'])
  const [merchant, setMerchant] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const showModal = async () => {
    setIsVisible(true);
    await initializeForms()
  };

  const initializeForms = async () => {
    const sn = await readDoc(`piti_integrations/${data.id}`);
    if (sn.exists()) {
      setKeys(prev => { return [...prev, "2", "3", "4"] })
      const doc = sn.data() as {
        merchantId: string, username: string, password: string, schedule?: {
          syncitems2?: Schedule,
          synctopiti?: Schedule
        }
      }
      form.setFieldsValue({
        merchantId: doc.merchantId,
        username: doc.username,
        password: doc.password,
      });

      if (doc.schedule) {
        if (doc.schedule.syncitems2) {
          fromForm.setFieldsValue({
            status: doc.schedule.syncitems2?.status,
            intervalValue: doc.schedule.syncitems2.intervalValue,
            intervalType: doc.schedule.syncitems2.intervalType,
          })
        }

        if (doc.schedule.synctopiti) {
          toFrom.setFieldsValue({
            status: doc.schedule.synctopiti.status,
            intervalValue: doc.schedule.synctopiti.intervalValue,
            intervalType: doc.schedule.synctopiti.intervalType,
          })
        }
      }

      if (doc.merchantId) {
        setMerchant(doc.merchantId);
      }

    }
  }
  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleSetup = async (values: any) => {
    setLoading(true);
    const success = await createPitiSetup({ ...values, bizId: data.id })
    setLoading(false)
    if (success) {
      message.success("Piti Integration Successful!")
      form.resetFields();
      setIsVisible(false);
    }
  };
  const handlePush = async () => {
    if (merchant) {
      setLoading(true);
      const s = await createPitiPush({ merchantId: merchant!, bizId: data.id });
      if (s) {
        message.success("Successfully Pushed!")
      }
      setLoading(false);
    }
  }
  const handlePull = async () => {
    if (merchant) {
      setLoading(true);
      const s = await createPitiPull({ merchantId: merchant!, bizId: data.id });
      if (s) {
        message.success("Successfully Pulled!")
      }
      setLoading(false);
    }
  }

  const handleSchedule = async (values: any) => {
    if (merchant) {
      setLoading(true);
      const s = await createPitiSchedule({ ...values, merchantId: merchant!, bizId: data.id });
      if (s) {
        message.success("Successfully Scheduled!")
      }
      await initializeForms();
      setLoading(false);
    }
  }
  return (
    <>
      {React.cloneElement(trigger as React.ReactElement, { onClick: showModal })}
      <Modal
        title={`${data.name} - Piti Integration`}
        open={isVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose={true}
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              label: 'Setup',
              key: '1',
              children:
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSetup}
                  initialValues={{}}
                >
                  {/* Name Input */}
                  <Form.Item
                    name="merchantId"
                    label="Piti MerchantID"
                    rules={[{ required: true, message: 'Please enter Piti merchantID!' }]}
                  >
                    <Input placeholder="Enter Piti MerchantID" />
                  </Form.Item>

                  {/* Email Input */}
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                      { required: true, message: 'Please enter username!' },
                      { type: 'email', message: 'Please enter a valid username!' },
                    ]}
                  >
                    <Input placeholder="Enter username" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                      { required: true, message: 'Please enter password!' },
                    ]}
                  >
                    <Input placeholder="Enter password" />
                  </Form.Item>

                  <Form.Item shouldUpdate>
                    {() => (
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={
                          !form.isFieldsTouched(true) || form.getFieldsError().some(({ errors }) => errors.length)
                        }
                      >
                        setup
                      </Button>
                    )}
                  </Form.Item>
                </Form>
            },
            {
              label: 'Pull',
              key: '2',
              children:
                <div style={{ padding: 12 }}>
                  <Button
                    type="primary"
                    size="large" // Set size to large
                    icon={<SyncOutlined />} // Add the icon
                    loading={loading}
                    onClick={handlePull}
                  >
                    Sync From Piti Products
                  </Button>
                </div>
              ,
              disabled: !activeKeys.includes('2'),
            },
            {
              label: 'Push',
              key: '3',
              disabled: !activeKeys.includes('3'),
              children:
                <div style={{ padding: 12 }}>
                  <Button
                    type="primary"
                    size="large" // Set size to large
                    icon={<SyncOutlined />} // Add the icon
                    loading={loading}
                    onClick={handlePush}
                  >
                    Sync To Piti
                  </Button>
                </div>,
            },
            {
              label: 'Schedule',
              key: '4',
              disabled: !activeKeys.includes('4'),
              children:
                <Tabs
                  defaultActiveKey="1"
                  size="small"
                  items={[
                    {
                      label: 'Sync From Piti',
                      key: '1',
                      children:
                        <Form
                          form={fromForm}
                          layout="vertical"
                          onFinish={handleSchedule}
                          initialValues={{
                            taskId: "syncitems2",
                            name: "Sync From Piti",
                            status: "Active",
                            intervalType: "hourly",
                            intervalValue: 1,
                          }}
                        >
                          <Form.Item name="taskId" hidden>
                            <Input />
                          </Form.Item>
                          <Form.Item name="name" hidden>
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: "Please select status!" }]}
                          >
                            <Radio.Group>
                              <Radio value="Active">Active</Radio>
                              <Radio value="Paused">Paused</Radio>
                              <Radio value="Completed">Completed</Radio>
                            </Radio.Group>
                          </Form.Item>
                          <Form.Item
                            name="intervalType"
                            label="Interval Type"
                            rules={[{ required: true, message: "Please select interval type!" }]}
                          >
                            <Radio.Group>
                              <Radio value="hourly">Hourly</Radio>
                              <Radio value="daily">Daily</Radio>
                            </Radio.Group>
                          </Form.Item>

                          <Form.Item
                            name="intervalValue"
                            label="Interval"
                            rules={[{ required: true, message: "Please enter interval!" }]}
                          >
                            <Input type="number" placeholder="Enter amount" />
                          </Form.Item>

                          <Form.Item shouldUpdate>
                            {() => (
                              <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={
                                  fromForm.getFieldsError().some(({ errors }) => errors.length)
                                }
                              >
                                save
                              </Button>
                            )}
                          </Form.Item>
                        </Form>
                    },
                    {
                      label: 'Sync To Piti',
                      key: '2',
                      children: <Form
                        form={toFrom}
                        layout="vertical"
                        onFinish={handleSchedule}
                        initialValues={{
                          taskId: "synctopiti",
                          name: "Sync To Piti",
                          status: "Active",
                          intervalType: "hourly",
                          intervalValue: 1,
                        }}
                      >
                        <Form.Item name="taskId" hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item name="name" hidden>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name="status"
                          label="Status"
                          rules={[{ required: true, message: "Please select status!" }]}
                        >
                          <Radio.Group>
                            <Radio value="Active">Active</Radio>
                            <Radio value="Paused">Paused</Radio>
                            <Radio value="Completed">Completed</Radio>
                          </Radio.Group>
                        </Form.Item>
                        <Form.Item
                          name="intervalType"
                          label="Interval Type"
                          rules={[{ required: true, message: "Please select interval type!" }]}
                        >
                          <Radio.Group>
                            <Radio value="hourly">Hourly</Radio>
                            <Radio value="daily">Daily</Radio>
                          </Radio.Group>
                        </Form.Item>

                        <Form.Item
                          name="intervalValue"
                          label="Interval"
                          rules={[{ required: true, message: "Please enter interval!" }]}
                        >
                          <Input type="number" placeholder="Enter amount" />
                        </Form.Item>

                        <Form.Item shouldUpdate>
                          {() => (
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                              disabled={
                                toFrom.getFieldsError().some(({ errors }) => errors.length)
                              }
                            >
                              save
                            </Button>
                          )}
                        </Form.Item>
                      </Form>
                    },
                  ]}

                />

            },
          ]}
        />

      </Modal>
    </>
  );
};



const BusinessList = () => {

  const { data, loading, refetch } = useQuery<ApolloResult<"listAllBusiness", Business[]>>(list_business);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Business> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div
        style={{ padding: 8 }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
          onFocus={() => {
            // Automatically select input when dropdown opens
            setTimeout(() => searchInput.current?.select(), 100);
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          {/* <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button> */}
          {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button> */}
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
              if (clearFilters) {
                handleReset(clearFilters)
              }
            }}
          >
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]!.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });



  const columns: TableColumnsType<Business> = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name: string, v) => (
        <Typography.Text copyable={{ icon: [<CopyFilled />, <CopyFilled />], text: v.id }} >
          {name}
        </Typography.Text>
      ),
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => (
        <Typography.Text copyable={{ icon: [<CopyFilled />, <CopyFilled />] }} >
          {email}
        </Typography.Text>
      ),
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      render: (active: boolean) => (
        active ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
      ),
    },
    {
      title: 'Country',
      dataIndex: 'country',
    },
    {
      title: 'City',
      dataIndex: 'city',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
    {
      title: "Actions",
      dataIndex: "id",
      render: (_, record) => (
        <Space size="middle">
          <PitiIntegrationForm data={record} trigger={<Space size="middle">
            <a>Piti Integration</a>
          </Space>} />
        </Space>
      ),
    }
  ];

  return (
    <Card
      title={<Row align="middle" justify="space-between">
        {/* Refresh Button - Start */}
        <Col>
          <Button type="link" icon={<ReloadOutlined />} onClick={async () => {
            await refetch()
          }}>
            Refresh
          </Button>
        </Col>

        {/* Card Title - Mid */}
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Businesses
          </Typography.Title>
        </Col>

        {/* Extra Actions - End */}
        <Col>
          <BusinessRegistrationForm trigger={<Button type="link" icon={<PlusCircleOutlined />}>Add</Button>} />
        </Col>
      </Row>}
      style={{ textAlign: 'center' }}
      // extra={
      //   <BusinessRegistrationForm trigger={<Button type="link" icon={<PlusCircleOutlined />} >Add</Button>} />
      // }
      type="inner"
    >
      <Table<Business> columns={columns} dataSource={(data?.listAllBusiness ?? []).map((b) => ({ ...b, key: b.id }))} size="small" loading={loading} />
    </Card>

  )
}


export default BusinessList;