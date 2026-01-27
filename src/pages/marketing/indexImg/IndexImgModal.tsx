import { indexImgApi } from "@/service/api/marketing/indexImg";
import { App, Form, Input, InputNumber, Modal, Radio } from "antd";
import { useEffect, useState } from "react";

export type IndexImgModalType = "add" | "update";

interface IndexImgModalProps {
	open: boolean;
	type: IndexImgModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function IndexImgModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: IndexImgModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				indexImgApi
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
				await indexImgApi.add(values);
				message.success("新增成功");
			} else {
				await indexImgApi.update({ ...values, imgId: editingId });
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
			title={type === "add" ? "新增轮播图" : "编辑轮播图"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={550}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="imgUrl"
					label="图片URL"
					rules={[{ required: true, message: "请输入图片URL" }]}
				>
					<Input placeholder="请输入图片URL" />
				</Form.Item>

				<Form.Item name="title" label="标题">
					<Input placeholder="请输入标题" maxLength={50} />
				</Form.Item>

				<Form.Item name="des" label="描述">
					<Input.TextArea rows={2} placeholder="请输入描述" maxLength={200} />
				</Form.Item>

				<Form.Item name="link" label="链接">
					<Input placeholder="请输入跳转链接" />
				</Form.Item>

				<Form.Item name="seq" label="排序">
					<InputNumber min={0} max={9999} style={{ width: 120 }} />
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>启用</Radio>
						<Radio value={0}>禁用</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
