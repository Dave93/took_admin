import { Button, Col, Row } from "@pankod/refine-antd";
import { useMemo, useState } from "react";
import * as gqlb from "gql-query-builder";
import { client } from "graphConnect";
import { CloseCircleFilled } from "@ant-design/icons";
import { useGetIdentity } from "@pankod/refine-core";
import { useAutoAnimate } from "@formkit/auto-animate/react";

interface OnChangeHandler {
  (e: any): void;
}
interface MyInputProps {
  value: string[];
  modelId: string;
  onChange: OnChangeHandler;
}

const FileUploaderMultiple = ({ value, onChange, modelId }: MyInputProps) => {
  const { data: identity } = useGetIdentity<{
    token: { accessToken: string };
  }>();
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const [additionalFiles, setAdditionalFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const uploadFile = async (file: File) => {
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

  const onUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setLoading(true);
    try {
      const data = await uploadFile(file);
      setAdditionalFiles([...additionalFiles, data]);
      onChange([...additionalFiles, data]);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const clearValue = async (file: string) => {
    const { query, variables } = gqlb.mutation({
      operation: "removeFile",
      variables: {
        url: {
          value: file,
          type: "String!",
        },
      },
    });
    const response = await client.request(query, variables, {
      Authorization: `Bearer ${identity?.token.accessToken}`,
    });
    onChange(value.filter((v) => v !== file));
  };

  const files = useMemo(() => {
    // return array of not null values
    let res = value ? value.filter((v) => v) : [];
    return [...res];
  }, [value]);

  return (
    <div>
      {files.length && files.length > 0 && (
        /** @ts-ignore */
        <div ref={parent}>
          <Row gutter={16}>
            {files.map((file) => (
              <Col key={file} span={2}>
                <Row>
                  <Col span={20}>
                    <img
                      src={file}
                      style={{
                        width: "100%",
                        height: "100px",
                      }}
                      alt="logo"
                    />
                  </Col>
                  <Col span={4}>
                    <CloseCircleFilled
                      onClick={() => clearValue(file)}
                      style={{
                        fontSize: "20px",
                        color: "red",
                        cursor: "pointer",
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </div>
      )}
      <label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100px",
            border: "1px dashed #d9d9d9",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "10px",
            width: "100px",
            textAlign: "center",
          }}
        >
          <div>Выбрать файл</div>
        </div>
        <input
          type="file"
          onChange={onUpload}
          style={{
            display: "none",
          }}
        />
      </label>
    </div>
  );
};

export default FileUploaderMultiple;
