import { CourierEfficiencyTerminalItem } from "interfaces";
import { FC, useState } from "react";
import { Edit, EditButton, PageHeader, useDrawerForm } from "@refinedev/antd";

import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Modal,
} from "antd";

import { UnorderedListOutlined } from "@ant-design/icons";

import { sortBy } from "lodash";

interface Props {
  data: CourierEfficiencyTerminalItem[];
}
export const CourierEfficiencyDetails: FC<Props> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [
    {
      title: "Филиал",
      dataIndex: "terminal_name",
      width: 100,
      render: (value: string) => value,
    },
    {
      title: "Период",
      dataIndex: "hour_period",
      width: 100,
      render: (value: string) => value,
    },
    {
      title: "Кол-во обработанных заказов",
      dataIndex: "courier_count",
      width: 100,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    {
      title: "Кол-во всех заказов",
      dataIndex: "total_count",
      width: 100,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
    // {
    //   title: "Кол-во курьеров",
    //   dataIndex: "courier_ids",
    //   width: 100,
    //   render: (value: string[] | null) =>
    //     value && value.length ? value.length : 0,
    // },
    {
      title: "Эффективность",
      dataIndex: "efficiency",
      width: 100,
      render: (value: string) => new Intl.NumberFormat("ru-RU").format(+value),
    },
  ];

  return (
    <div>
      <Button
        color="primary"
        onClick={() => setIsModalOpen(true)}
        icon={<UnorderedListOutlined />}
      />
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        cancelText={null}
        title="Заказы по филиалам и часам"
        onOk={() => setIsModalOpen(false)}
        width={1000}
      >
        <Table
          rowKey="id"
          bordered
          size="small"
          columns={columns}
          dataSource={sortBy(data, ["terminal_name", "hour_period"])}
          pagination={false}
        />
      </Modal>
    </div>
  );
};
