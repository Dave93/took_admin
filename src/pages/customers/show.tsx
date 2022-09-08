import { useShow } from "@pankod/refine-core";
import {
  Show,
  Typography,
  Row,
  Col,
  Comment,
  AntdList,
} from "@pankod/refine-antd";

import { useEffect, useState } from "react";
import { gql } from "graphql-request";
import { client } from "graphConnect";
import { customers_comments } from "interfaces";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const CustomersShow = () => {
  const { queryResult, showId } = useShow({
    metaData: {
      fields: [
        "id",
        "name",
        "phone",
        {
          customers_comments_customers: ["id", "comment", "created_at"],
        },
      ],
      pluralize: true,
    },
  });
  const { data, isLoading } = queryResult;
  const record = data?.data;
  console.log(record);
  return (
    <Show isLoading={isLoading}>
      <Row gutter={16}>
        <Col span={12}>
          <Title level={5}>Ф.И.О.</Title>
          <Text>{record?.name}</Text>
          <Title level={5}>Телефон</Title>
          <Text>{record?.phone}</Text>
        </Col>
        <Col span={12}>
          <Title level={5}>Комментарии</Title>
          <AntdList
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
          />
        </Col>
      </Row>
    </Show>
  );
};
