import { brandApi } from "@/service/api/prod/brand";
import { App, Form, Input, InputNumber, Modal, Radio } from "antd";
import { useEffect, useState } from "react";

export type BrandModalType = "add" | "update";

interface BrandModalProps {
	open: boolean;
	type: BrandModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function BrandModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: BrandModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				brandApi
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
				await brandApi.add(values);
				message.success("新增成功");
			} else {
				await brandApi.update({ ...values, brandId: editingId });
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
			title={type === "add" ? "新增品牌" : "编辑品牌"}
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
					name="brandName"
					label="品牌名称"
					rules={[{ required: true, message: "请输入品牌名称" }]}
				>
					<Input placeholder="请输入品牌名称" maxLength={50} />
				</Form.Item>

				<Form.Item name="brandPic" label="品牌图片">
					<Input placeholder="请输入品牌图片URL" />
				</Form.Item>

				<Form.Item name="firstChar" label="首字母">
					<Input placeholder="请输入品牌首字母" maxLength={1} style={{ width: 80 }} />
				</Form.Item>

				<Form.Item name="brief" label="简介">
					<Input.TextArea rows={2} placeholder="请输入品牌简介" maxLength={200} />
				</Form.Item>

				<Form.Item name="memo" label="备注">
					<Input.TextArea rows={2} placeholder="请输入备注" maxLength={500} />
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
