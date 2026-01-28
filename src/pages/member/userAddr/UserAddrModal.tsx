import { userAddrApi } from "@/service/api/member/userAddr";
import { App, Form, Input, Modal, Radio, Switch } from "antd";
import { useEffect, useState } from "react";

export type UserAddrModalType = "add" | "update";

interface UserAddrModalProps {
	open: boolean;
	type: UserAddrModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function UserAddrModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: UserAddrModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				userAddrApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				form.setFieldsValue({ status: 1, commonAddr: 0 });
			}
		}
	}, [open, type, editingId, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (type === "add") {
				await userAddrApi.add(values);
				message.success("新增成功");
			} else {
				await userAddrApi.update({ ...values, addrId: editingId });
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
			title={type === "add" ? "新增地址" : "编辑地址"}
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
					name="receiver"
					label="收货人"
					rules={[{ required: true, message: "请输入收货人" }]}
				>
					<Input placeholder="请输入收货人姓名" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="mobile"
					label="手机号"
					rules={[{ required: true, message: "请输入手机号" }]}
				>
					<Input placeholder="请输入手机号" maxLength={11} />
				</Form.Item>

				<Form.Item
					name="province"
					label="省份"
					rules={[{ required: true, message: "请输入省份" }]}
				>
					<Input placeholder="请输入省份" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="city"
					label="城市"
					rules={[{ required: true, message: "请输入城市" }]}
				>
					<Input placeholder="请输入城市" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="area"
					label="区县"
					rules={[{ required: true, message: "请输入区县" }]}
				>
					<Input placeholder="请输入区县" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="addr"
					label="详细地址"
					rules={[{ required: true, message: "请输入详细地址" }]}
				>
					<Input.TextArea rows={2} placeholder="请输入详细地址" maxLength={200} />
				</Form.Item>

				<Form.Item name="postCode" label="邮编">
					<Input placeholder="请输入邮编" maxLength={6} style={{ width: 120 }} />
				</Form.Item>

				<Form.Item name="commonAddr" label="默认地址" valuePropName="checked">
					<Switch
						checkedChildren="是"
						unCheckedChildren="否"
						onChange={(checked) => form.setFieldValue("commonAddr", checked ? 1 : 0)}
						checked={form.getFieldValue("commonAddr") === 1}
					/>
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>无效</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
