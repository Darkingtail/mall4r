import { memberApi } from "@/service/api/member";
import { App, Form, Input, Modal, Radio, InputNumber } from "antd";
import { useEffect, useState } from "react";

interface MemberModalProps {
	open: boolean;
	editingId: string | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function MemberModal({
	open,
	editingId,
	onOk,
	onCancel,
}: MemberModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open && editingId) {
			setFetching(true);
			memberApi
				.getById(editingId)
				.then((data) => {
					form.setFieldsValue(data);
				})
				.catch(console.error)
				.finally(() => setFetching(false));
		}
	}, [open, editingId, form]);

	const handleOk = async () => {
		if (!editingId) return;

		try {
			const values = await form.validateFields();
			setLoading(true);

			await memberApi.update({ ...values, userId: editingId });
			message.success("更新成功");

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title="编辑会员"
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
				<Form.Item name="nickName" label="昵称">
					<Input placeholder="请输入昵称" maxLength={50} />
				</Form.Item>

				<Form.Item name="realName" label="真实姓名">
					<Input placeholder="请输入真实姓名" maxLength={50} />
				</Form.Item>

				<Form.Item name="userMobile" label="手机号">
					<Input placeholder="请输入手机号" maxLength={11} />
				</Form.Item>

				<Form.Item name="userMail" label="邮箱">
					<Input placeholder="请输入邮箱" maxLength={100} />
				</Form.Item>

				<Form.Item name="sex" label="性别">
					<Radio.Group>
						<Radio value="M">男</Radio>
						<Radio value="F">女</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item name="score" label="积分">
					<InputNumber min={0} style={{ width: 120 }} />
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>无效</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item name="userMemo" label="备注">
					<Input.TextArea rows={3} placeholder="请输入备注" maxLength={500} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
