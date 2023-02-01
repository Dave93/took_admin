import { Descriptions, Button, Input, Space } from "@pankod/refine-antd";
import { FC, useState } from "react";
import { SaveOutlined, EditOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface OrderNotesProps {
  orderId: string;
  notes?: string | null;
}

const OrderNotes: FC<OrderNotesProps> = ({ orderId, notes }) => {
  const [orderNotes, setOrderNotes] = useState(notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  return (
    <>
      {isEditing ? (
        <div>
          <TextArea
            value={orderNotes}
            rows={2}
            onChange={(e) => setOrderNotes(e.target.value)}
          />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => setIsEditing(false)}
          >
            Сохранить
          </Button>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
          }}
        >
          <div>{orderNotes}</div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: -10,
            }}
          >
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              shape="circle"
              onClick={() => setIsEditing(true)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderNotes;
