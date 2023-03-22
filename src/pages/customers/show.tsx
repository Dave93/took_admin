import { useGetIdentity, useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { Typography, Row, Col, Tabs } from "antd";

const { Title, Text } = Typography;

export const CustomersShow = () => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const { queryResult } = useShow({
    meta: {
      fields: [
        "id",
        "name",
        "phone",
        {
          customers_comments_customers: ["id", "comment", "created_at"],
        },
      ],
      pluralize: true,
      requestHeaders: {
        Authorization: `Bearer ${identity?.token.accessToken}`,
      },
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;
  return (
    <Show isLoading={isLoading}>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Основная информация" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Title level={5}>Ф.И.О.</Title>
              <Text>{record?.name}</Text>
              <Title level={5}>Телефон</Title>
              <Text>{record?.phone}</Text>
            </Col>
            <Col span={12}>
              <Title level={5}>Комментарии</Title>
              {/* <AntdList
                className="comment-list"
                header={`${record?.customers_comments_customers.length} комментариев`}
                itemLayout="horizontal"
                dataSource={record?.customers_comments_customers}
                renderItem={(item: customers_comments) => (
                  <li>
                    <Comment
                      content={item.comment}
                      datetime={
                        <div>{dayjs(item.created_at).format("DD.MM.YYYY")}</div>
                      }
                    />
                  </li>
                )}
              /> */}
            </Col>
          </Row>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Заказы" key="2"></Tabs.TabPane>
      </Tabs>
    </Show>
  );
};
