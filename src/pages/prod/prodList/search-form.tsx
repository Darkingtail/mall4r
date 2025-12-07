import type { FetchProdListPageRequestPayload } from "@/service/api/prod/prod-list";
import { Button, Form, Input, Select, type FormProps } from "antd";

export type FormValues = Omit<FetchProdListPageRequestPayload, "t">;

interface SearchFormProps {
	onSearch: (values: FormValues) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
	const [form] = Form.useForm<FormValues>();

	const onFormFinish: FormProps<FormValues>["onFinish"] = (values) => {
		onSearch(values);
	};

	const handleReset = () => {
		form.resetFields();
	};

	return (
		<Form
			form={form}
			layout="inline"
			initialValues={{ status: -1 }}
			onFinish={onFormFinish}
		>
			<Form.Item label="产品名字" name="prodName">
				<Input placeholder="请输入商品名称" allowClear />
			</Form.Item>
			<Form.Item label="状态" name="status">
				<Select
					style={{ width: 200 }}
					options={[
						{ value: 1, label: "上架" },
						{ value: 0, label: "未上架" },
						{ value: -1, label: "全部" },
					]}
				/>
			</Form.Item>
			<Form.Item>
				<Button type="primary" htmlType="submit">
					查询
				</Button>
			</Form.Item>
			<Form.Item>
				<Button onClick={handleReset}>清空</Button>
			</Form.Item>
		</Form>
	);
}
