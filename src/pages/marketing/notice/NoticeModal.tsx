import { noticeApi } from "@/service/api/marketing/notice";
import { App, Form, Input, Modal, Radio, Switch } from "antd";
import { useEffect, useState } from "react";

export type NoticeModalType = "add" | "update";

interface NoticeModalProps {
	open: boolean;
	type: NoticeModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function NoticeModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: NoticeModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				noticeApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				form.setFieldsValue({ status: 1, isTop: 0 });
			}
		}
	}, [open, type, editingId, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (type === "add") {
				await noticeApi.add(values);
				message.success("新增成功");
			} else {
				await noticeApi.update({ ...values, id: editingId });
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
			title={type === "add" ? "新增公告" : "编辑公告"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={600}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 19 }}
				disabled={fetching}
			>
				<Form.Item
					name="title"
					label="标题"
					rules={[{ required: true, message: "请输入标题" }]}
				>
					<Input placeholder="请输入公告标题" maxLength={100} />
				</Form.Item>

				<Form.Item
					name="content"
					label="内容"
					rules={[{ required: true, message: "请输入内容" }]}
				>
					<Input.TextArea
						rows={6}
						placeholder="请输入公告内容"
						showCount
						maxLength={2000}
					/>
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>公布</Radio>
						<Radio value={0}>撤回</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item name="isTop" label="置顶" valuePropName="checked">
					<Switch
						checkedChildren="是"
						unCheckedChildren="否"
						onChange={(checked) => form.setFieldValue("isTop", checked ? 1 : 0)}
						checked={form.getFieldValue("isTop") === 1}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
