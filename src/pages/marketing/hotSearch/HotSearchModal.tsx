import { hotSearchApi } from "@/service/api/marketing/hotSearch";
import { App, Form, Input, InputNumber, Modal, Radio } from "antd";
import { useEffect, useState } from "react";

export type HotSearchModalType = "add" | "update";

interface HotSearchModalProps {
	open: boolean;
	type: HotSearchModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function HotSearchModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: HotSearchModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				hotSearchApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				form.setFieldsValue({ status: 1, seq: 0 });
			}
		}
	}, [open, type, editingId, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (type === "add") {
				await hotSearchApi.add(values);
				message.success("新增成功");
			} else {
				await hotSearchApi.update({ ...values, hotSearchId: editingId });
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={type === "add" ? "新增热搜" : "编辑热搜"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={500}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="title"
					label="标题"
					rules={[{ required: true, message: "请输入标题" }]}
				>
					<Input placeholder="请输入标题" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="content"
					label="搜索词"
					rules={[{ required: true, message: "请输入搜索词" }]}
				>
					<Input placeholder="请输入搜索词" maxLength={100} />
				</Form.Item>

				<Form.Item name="seq" label="排序">
					<InputNumber min={0} max={9999} style={{ width: 120 }} />
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>下线</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
