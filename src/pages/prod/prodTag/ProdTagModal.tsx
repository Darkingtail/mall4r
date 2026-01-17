import {
	type ProdTag,
	prodTagApi,
} from "@/service/api/prod/prodTag";
import { App, Form, Input, InputNumber, Modal, Radio } from "antd";
import { type Ref, useEffect, useImperativeHandle, useMemo, useState } from "react";

export type ProdTagModalType = "add" | "update";

export type ProdTagModalHandle = {
	resetForm: () => void;
};

interface ProdTagModalProps {
	open: boolean;
	type: ProdTagModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
	ref?: Ref<ProdTagModalHandle>;
}

export function ProdTagModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
	ref,
}: ProdTagModalProps) {
	const [form] = Form.useForm<ProdTag>();
	const [confirmLoading, setConfirmLoading] = useState(false);
	const { message } = App.useApp();

	const title = useMemo(
		() => (type === "add" ? "新增标签" : "修改标签"),
		[type],
	);

	useImperativeHandle(ref, () => ({
		resetForm: () => form.resetFields(),
	}));

	useEffect(() => {
		if (open && type === "update" && editingId) {
			setConfirmLoading(true);
			prodTagApi
				.getProdTagInfo(editingId)
				.then((data) => {
					form.setFieldsValue(data);
				})
				.catch((err) => {
					console.error(err);
					message.error("获取详情失败");
				})
				.finally(() => {
					setConfirmLoading(false);
				});
		} else if (open && type === "add") {
			form.resetFields();
			form.setFieldsValue({
				status: 1,
				style: 0,
				seq: 0,
			});
		}
	}, [open, type, editingId, form, message]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setConfirmLoading(true);

			if (type === "add") {
				await prodTagApi.addProdTag(values);
				message.success("新增成功");
			} else {
				await prodTagApi.updateProdTag({ ...values, id: editingId! });
				message.success("修改成功");
			}
			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setConfirmLoading(false);
		}
	};

	return (
		<Modal
			title={title}
			open={open}
			confirmLoading={confirmLoading}
			onOk={handleOk}
			onCancel={onCancel}
			destroyOnHidden
		>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 16 }}
				initialValues={{ status: 1, style: 0, seq: 0 }}
			>
				<Form.Item
					label="标签名称"
					name="title"
					rules={[
						{ required: true, message: "请输入标签名称" },
						{ whitespace: true, message: "标签名称不能为空" },
					]}
				>
					<Input maxLength={20} showCount />
				</Form.Item>

				<Form.Item label="状态" name="status">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>禁用</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="列表风格" name="style">
					<Radio.Group>
						<Radio value={0}>风格一</Radio>
						<Radio value={1}>风格二</Radio>
						<Radio value={2}>风格三</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="排序" name="seq">
					<InputNumber min={0} precision={0} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
