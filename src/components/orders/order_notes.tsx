import { Descriptions, Button, Input, Space, Form } from "antd";
import { FC, useState } from "react";
import { SaveOutlined, EditOutlined } from "@ant-design/icons";
import { useGetIdentity } from "@refinedev/core";
import { client } from "graphConnect";
import { gql } from "graphql-request";

const { TextArea } = Input;

interface OrderNotesProps {
  orderId: string;
  notes?: string | null;
}

const OrderNotes: FC<OrderNotesProps> = ({ orderId, notes }) => {
  const [orderNotes, setOrderNotes] = useState(notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>({
    v3LegacyAuthProviderCompatible: true
  });
  const saveNotes = async () => {
    setIsSaving(true);
    let createQuery = gql`
      mutation ($orderId: String!, $notes: String!) {
        addOrderNotes(orderId: $orderId, notes: $notes)
      }
    `;
    await client.request(
      createQuery,
      {
        orderId,
        notes: orderNotes,
      },
      { Authorization: `Bearer ${identity?.token.accessToken}` }
    );
    setIsSaving(false);
  };

  return (
    <>
      <Form
        layout="vertical"
        initialValues={{
          notes: notes,
        }}
      >
        <Space direction="vertical" style={{ display: "flex" }}>
          <TextArea
            defaultValue={notes || ""}
            rows={2}
            onChange={(e) => setOrderNotes(e.target.value)}
          >
            {notes}
          </TextArea>
          <Button
            type="primary"
            loading={isSaving}
            icon={<SaveOutlined />}
            onClick={saveNotes}
          >
            Сохранить
          </Button>
        </Space>
      </Form>
    </>
  );
};

export default OrderNotes;
