import { Button, Col, Row } from "@pankod/refine-antd";
import { useState } from "react";
import * as gqlb from "gql-query-builder";
import { client } from "graphConnect";
import { CloseCircleFilled } from "@ant-design/icons";
import { useGetIdentity } from "@pankod/refine-core";

interface OnChangeHandler {
  (e: any): void;
}
interface MyInputProps {
  value: string;
  modelId: string;
  onChange: OnChangeHandler;
}

const FileUploader = ({ value, onChange, modelId }: MyInputProps) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    const { query, variables } = gqlb.mutation({
      operation: "uploadFile",
      variables: {
        file: {
          value: file,
          type: "Upload!",
        },
        modelId: {
          value: modelId,
          type: "String!",
        },
      },
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    return response.uploadFile;
  };

  const onUpload = async () => {
    if (!file) {
      return;
    }
    setLoading(true);
    try {
      const data = await uploadFile();
      onChange(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const clearValue = async () => {
    const { query, variables } = gqlb.mutation({
      operation: "removeFile",
      variables: {
        url: {
          value: value,
          type: "String!",
        },
      },
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    onChange(null);
  };

  const onFileChange = (e: any) => {
    const file = e.target.files[0];
    setFile(file);
  };

  return (
    <div>
      {!value && (
        <div>
          <input type="file" onChange={onFileChange} />
          <Button onClick={onUpload} loading={loading}>
            Загрузить
          </Button>
        </div>
      )}
      {value && (
        <Row gutter={16}>
          <Col span={2}>
            <img
              src={value}
              style={{
                width: "100%",
              }}
              alt="logo"
            />
          </Col>
          <Col span={2}>
            <Button onClick={clearValue} danger icon={<CloseCircleFilled />} />
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FileUploader;
